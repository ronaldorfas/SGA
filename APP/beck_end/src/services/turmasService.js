const supabase = require('../config/supabase');

function createListTurmas(database) {
	return async function listTurmas({ docenteId } = {}) {
		if (!database) throw new Error('Supabase não configurado.');

		const assignmentRelation = docenteId
			? 'turma_componentes_docentes!inner(docente_id, componentes_curriculares(nome))'
			: 'turma_componentes_docentes(componentes_curriculares(nome))';
		let query = database
			.from('turmas')
			.select(`id, codigo, nome, turno, cursos(id, nome, tipos_curso(id, nome)), ${assignmentRelation}`)
			.order('id');
		if (docenteId) query = query.eq('turma_componentes_docentes.docente_id', docenteId);

		const { data, error } = await query;

		if (error) throw error;

		return (data || []).map((row) => ({
			id: row.id,
			codigo: row.codigo,
			nome: row.nome || row.codigo,
			curso: row.cursos?.nome || '',
			cursoId: row.cursos?.id || '',
			tipoCurso: row.cursos?.tipos_curso?.nome || '',
			tipoCursoId: row.cursos?.tipos_curso?.id || '',
			turno: row.turno,
			materias: (row.turma_componentes_docentes || [])
				.map((item) => item.componentes_curriculares?.nome)
				.filter(Boolean)
		}));
	};
}

const listTurmas = createListTurmas(supabase);

async function createTurma(input = {}) {
	if (!supabase) throw new Error('Supabase não configurado.');

	const { codigo, nome, curso, turno, materias = [] } = input && typeof input === 'object' ? input : {};
	const cleanCodigo = String(codigo || '').trim();
	const cleanNome = String(nome || '').trim();
	const cleanCurso = String(curso || '').trim();
	const cleanTurno = String(turno || '').trim();

	if (!cleanCodigo || !cleanNome || !cleanCurso || !cleanTurno) {
		throw new Error('Código, nome, curso e turno são obrigatórios.');
	}
	if (!Array.isArray(materias)) {
		throw new Error('Matérias deve ser uma lista.');
	}

	const materiasLimpa = materias
		.map((materia) => String(materia || '').trim())
		.filter(Boolean);
	if (materiasLimpa.length > 5) {
		throw new Error('Cadastre no máximo cinco matérias por turma.');
	}

	// 1. Busca ou cria o curso
	let { data: courseData, error: courseLookupError } = await supabase
		.from('cursos')
		.select('id')
		.eq('nome', cleanCurso)
		.limit(1)
		.maybeSingle();
	if (courseLookupError) throw courseLookupError;

	if (!courseData) {
		const { data: tipos, error: typeError } = await supabase
			.from('tipos_curso')
			.select('id')
			.order('id')
			.limit(2);
		if (typeError) throw typeError;
		if (!tipos || tipos.length === 0) {
			throw new Error('Importe ou cadastre um tipo de curso antes de criar uma turma.');
		}
		if (tipos.length > 1) {
			throw new Error('O curso ainda não existe e há mais de um tipo de curso. Cadastre o curso no banco antes de criar a turma.');
		}

		const { data: newCourse, error: courseErr } = await supabase
			.from('cursos')
			.insert({ tipo_curso_id: tipos[0].id, nome: cleanCurso })
			.select('id')
			.single();
		if (courseErr) throw courseErr;
		courseData = newCourse;
	}

	// 2. Insere a turma
	const { data: novaTurma, error: turmaErr } = await supabase
		.from('turmas')
		.insert({
			codigo: cleanCodigo,
			nome: cleanNome,
			curso_id: courseData.id,
			turno: cleanTurno,
			carga_horaria: 80,
			situacao: 'Ativa'
		})
		.select('*')
		.single();

	if (turmaErr) throw turmaErr;

	// 3. Vincula matérias
	const materiasSalvas = [];
	const listaMaterias = [...new Set(materiasLimpa.map((materia) => materia.toLocaleLowerCase('pt-BR')))]
		.map((normalizedName) => materiasLimpa.find((materia) => materia.toLocaleLowerCase('pt-BR') === normalizedName));

	for (const materiaName of listaMaterias) {
		const nomeLimpo = materiaName;
		let { data: componente, error: componentLookupError } = await supabase
			.from('componentes_curriculares')
			.select('id')
			.eq('nome', nomeLimpo)
			.limit(1)
			.maybeSingle();
		if (componentLookupError) throw componentLookupError;

		if (!componente) {
			const sigla = nomeLimpo.slice(0, 6).toUpperCase();
			const { data: novoComp, error: componentError } = await supabase
				.from('componentes_curriculares')
				.insert({ sigla, nome: nomeLimpo })
				.select('id')
				.single();
			if (componentError) throw componentError;
			componente = novoComp;
		}

		const { error: associationError } = await supabase.from('turma_componentes_docentes').insert({
			turma_id: novaTurma.id,
			componente_id: componente.id,
			carga_horaria: 20
		});
		if (associationError) throw associationError;
		materiasSalvas.push(nomeLimpo);
	}

	return {
		id: novaTurma.id,
		codigo: novaTurma.codigo,
		nome: novaTurma.nome,
		curso: cleanCurso,
		turno: novaTurma.turno,
		materias: materiasSalvas
	};
}

module.exports = {
	createListTurmas,
	listTurmas,
	createTurma
};
