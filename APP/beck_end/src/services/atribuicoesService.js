const supabase = require('../config/supabase');

async function listAtribuicoes({ docenteId } = {}) {
	if (!supabase) throw new Error('Supabase não configurado.');

	let query = supabase
		.from('turma_componentes_docentes')
		.select(`
			id,
			turma_id,
			componente_id,
			docente_id,
			turmas(id, codigo, nome, turno, horario_inicio, horario_fim, cursos(id, nome, tipos_curso(id, nome))),
			componentes_curriculares(id, nome, sigla),
			docentes(id, nome, registro)
		`)
		.order('id');
	if (docenteId) query = query.eq('docente_id', docenteId);

	const { data, error } = await query;

	if (error) throw error;

	return (data || []).map((row) => ({
		id: row.id,
		turma: row.turmas?.nome || row.turmas?.codigo || '',
		turmaId: row.turma_id,
		turmaCodigo: row.turmas?.codigo || '',
		materia: row.componentes_curriculares?.nome || '',
		docente: row.docentes?.nome || '',
		docenteId: row.docente_id,
		curso: row.turmas?.cursos?.nome || '',
		cursoId: row.turmas?.cursos?.id || '',
		tipoCurso: row.turmas?.cursos?.tipos_curso?.nome || '',
		tipoCursoId: row.turmas?.cursos?.tipos_curso?.id || '',
		turno: row.turmas?.turno || '',
		horarioInicio: row.turmas?.horario_inicio || '',
		horarioFim: row.turmas?.horario_fim || ''
	}));
}

async function createAtribuicao({ turma, materia, docente }) {
	if (!supabase) throw new Error('Supabase não configurado.');

	const cleanTurma = String(turma || '').trim();
	const cleanMateria = String(materia || '').trim();
	const cleanDocente = String(docente || '').trim();

	if (!cleanTurma || !cleanMateria || !cleanDocente) {
		throw new Error('Turma, matéria e docente são obrigatórios.');
	}

	const { data: t, error: tErr } = await supabase
		.from('turmas')
		.select('id, nome, codigo')
		.or(`nome.eq.${cleanTurma},codigo.eq.${cleanTurma}`)
		.limit(1)
		.maybeSingle();
	if (tErr) throw tErr;

	const { data: c, error: cErr } = await supabase
		.from('componentes_curriculares')
		.select('id')
		.eq('nome', cleanMateria)
		.limit(1)
		.maybeSingle();
	if (cErr) throw cErr;

	const { data: d, error: dErr } = await supabase
		.from('docentes')
		.select('id')
		.eq('nome', cleanDocente)
		.limit(1)
		.maybeSingle();
	if (dErr) throw dErr;

	if (!t || !c || !d) {
		throw new Error('Turma, matéria ou docente não encontrados no banco de dados.');
	}

	const { data, error } = await supabase
		.from('turma_componentes_docentes')
		.insert({
			turma_id: t.id,
			componente_id: c.id,
			docente_id: d.id,
			carga_horaria: 20
		})
		.select('*')
		.single();

	if (error) throw error;
	return data;
}

module.exports = {
	listAtribuicoes,
	createAtribuicao
};
