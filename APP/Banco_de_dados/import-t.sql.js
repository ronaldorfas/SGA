const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] || path.join(__dirname, 't.sql');
const outputPath = process.argv[3] || path.join(__dirname, 't-relacional.sql');

function sqlString(value) {
	return value === null || value === undefined || value === ''
		? 'NULL'
		: `'${String(value).replace(/'/g, "''")}'`;
}

function parseDate(value, label) {
	if (!value) return null;
	const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
	if (!match) throw new Error(`${label} deve usar o formato DD/MM/AAAA.`);

	const [, dayText, monthText, yearText] = match;
	const day = Number(dayText);
	const month = Number(monthText);
	const year = Number(yearText);
	const date = new Date(Date.UTC(year, month - 1, day));
	if (year < 1 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
		throw new Error(`${label} não é uma data válida.`);
	}

	return `${yearText}-${monthText}-${dayText}`;
}

function parseTime(value, label) {
	if (!value) return null;
	const match = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.exec(value);
	if (!match) throw new Error(`${label} deve usar o formato HH:MM ou HH:MM:SS.`);
	return value.length === 5 ? `${value}:00` : value;
}

function parseRow(line, lineNumber = 1) {
	const invalid = (message) => {
		throw new Error(`Linha ${lineNumber}: ${message}`);
	};
	const columns = line.replace(/^\uFEFF/, '').split('\t').map((column) => column.trim());
	if (columns.length < 19) invalid(`esperadas pelo menos 19 colunas, recebidas ${columns.length}.`);

	const [nivel, tipoCurso, curso, cargaCursoText, , , turma, turno, situacao, horarioInicioText, horarioFimText, periodoInicioText, periodoFimText, , docente, , sigla, componente, cargaComponenteText] = columns;
	if (!nivel || !tipoCurso || !curso || !turma || !turno || !situacao || !sigla || !componente) {
		invalid('nível, tipo de curso, curso, turma, turno, situação, sigla e componente são obrigatórios.');
	}

	const cargaCurso = Number(cargaCursoText);
	const cargaComponente = Number(cargaComponenteText);
	if (!Number.isSafeInteger(cargaCurso) || cargaCurso <= 0) invalid('carga horária do curso deve ser um inteiro positivo.');
	if (!Number.isSafeInteger(cargaComponente) || cargaComponente <= 0) invalid('carga horária do componente deve ser um inteiro positivo.');

	let horarioInicio;
	let horarioFim;
	let periodoInicio;
	let periodoFim;
	try {
		horarioInicio = parseTime(horarioInicioText, 'Horário inicial');
		horarioFim = parseTime(horarioFimText, 'Horário final');
		periodoInicio = parseDate(periodoInicioText, 'Período inicial');
		periodoFim = parseDate(periodoFimText, 'Período final');
	} catch (error) {
		invalid(error.message);
	}
	if (Boolean(horarioInicio) !== Boolean(horarioFim)) invalid('horários inicial e final devem ser informados juntos.');
	if (horarioInicio && horarioFim && horarioFim <= horarioInicio) invalid('horário final deve ser posterior ao inicial.');
	if (periodoInicio && periodoFim && periodoFim < periodoInicio) invalid('período final deve ser igual ou posterior ao inicial.');

	return {
		nivel,
		tipoCurso,
		curso,
		cargaCurso,
		turma,
		turno,
		situacao,
		horarioInicio,
		horarioFim,
		periodoInicio,
		periodoFim,
		docente: docente || null,
		sigla,
		componente,
		cargaComponente
	};
}

function generateSql(rows) {
	const sql = ['begin;', ''];

	for (const row of rows) {
		sql.push(`insert into niveis (nome) values (${sqlString(row.nivel)}) on conflict (nome) do nothing;`);
		sql.push(`insert into tipos_curso (nivel_id, nome) select id, ${sqlString(row.tipoCurso)} from niveis where nome = ${sqlString(row.nivel)} on conflict (nivel_id, nome) do nothing;`);
		sql.push(`insert into cursos (tipo_curso_id, nome) select id, ${sqlString(row.curso)} from tipos_curso where nome = ${sqlString(row.tipoCurso)} and nivel_id = (select id from niveis where nome = ${sqlString(row.nivel)}) on conflict (tipo_curso_id, nome) do nothing;`);
		sql.push(`insert into turmas (curso_id, codigo, carga_horaria, turno, situacao, horario_inicio, horario_fim, periodo_inicio, periodo_fim) select c.id, ${sqlString(row.turma)}, ${row.cargaCurso}, ${sqlString(row.turno)}, ${sqlString(row.situacao)}, ${sqlString(row.horarioInicio)}, ${sqlString(row.horarioFim)}, ${sqlString(row.periodoInicio)}, ${sqlString(row.periodoFim)} from cursos c join tipos_curso tc on tc.id = c.tipo_curso_id where c.nome = ${sqlString(row.curso)} and tc.nome = ${sqlString(row.tipoCurso)} and tc.nivel_id = (select id from niveis where nome = ${sqlString(row.nivel)}) on conflict (codigo) do update set carga_horaria = excluded.carga_horaria, turno = excluded.turno, situacao = excluded.situacao, horario_inicio = excluded.horario_inicio, horario_fim = excluded.horario_fim, periodo_inicio = excluded.periodo_inicio, periodo_fim = excluded.periodo_fim;`);

		if (row.docente) {
			sql.push(`insert into docentes (nome) values (${sqlString(row.docente)}) on conflict (nome) do nothing;`);
		}
		sql.push(`insert into componentes_curriculares (sigla, nome) values (${sqlString(row.sigla)}, ${sqlString(row.componente)}) on conflict (sigla, nome) do nothing;`);
		sql.push(`insert into turma_componentes_docentes (turma_id, componente_id, docente_id, carga_horaria) select t.id, cc.id, ${row.docente ? `(select id from docentes where nome = ${sqlString(row.docente)})` : 'NULL'}, ${row.cargaComponente} from turmas t cross join componentes_curriculares cc where t.codigo = ${sqlString(row.turma)} and cc.sigla = ${sqlString(row.sigla)} and cc.nome = ${sqlString(row.componente)} on conflict do nothing;`);
	}

	sql.push('', 'commit;', '');
	return sql.join('\n');
}

function main() {
	const lines = fs.readFileSync(inputPath, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/);
	const rows = [];
	const errors = [];

	for (let index = 1; index < lines.length; index += 1) {
		if (!lines[index].trim()) continue;
		try {
			rows.push(parseRow(lines[index], index + 1));
		} catch (error) {
			errors.push(error.message);
		}
	}

	if (errors.length > 0) {
		console.error(`Importação cancelada: ${errors.length} linha(s) inválida(s). O arquivo de saída não foi escrito nem atualizado.`);
		errors.forEach((error) => console.error(`- ${error}`));
		process.exitCode = 1;
		return;
	}
	if (rows.length === 0) {
		console.error('Importação cancelada: nenhum registro de dados foi encontrado. O arquivo de saída não foi escrito nem atualizado.');
		process.exitCode = 1;
		return;
	}

	fs.writeFileSync(outputPath, generateSql(rows), 'utf8');
	console.log(`Conversão concluída: ${rows.length} linhas validadas em ${outputPath}`);
}

if (require.main === module) main();

module.exports = {
	generateSql,
	parseDate,
	parseRow,
	parseTime
};
