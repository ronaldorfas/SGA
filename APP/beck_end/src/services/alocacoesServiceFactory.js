const { validateAlocacao } = require('./alocacoesValidation');

function createAlocacoesService(database) {
	async function listAlocacoes() {
		if (!database) throw new Error('Supabase não configurado.');

		const { data, error } = await database
			.from('alocacoes_ambiente')
			.select(`
			id,
			atribuicao_aula_id,
			ambiente_id,
			dia_semana,
			periodo,
			horario,
			ambientes(id, codigo, nome, tipo),
			turma_componentes_docentes(
				id,
				turmas(codigo, nome, horario_inicio, horario_fim, turno),
				componentes_curriculares(nome),
				docentes(nome)
			)
		`)
			.order('id');

		if (error) throw error;

		return (data || []).map((row) => {
			const tcd = row.turma_componentes_docentes;
			const turma = tcd?.turmas;
			const turmaNome = turma?.nome || turma?.codigo || '';
			const materiaNome = tcd?.componentes_curriculares?.nome || '';
			const docenteNome = tcd?.docentes?.nome || '';

			const horario = [turma?.horario_inicio, turma?.horario_fim]
				.filter(Boolean)
				.join(' - ') || turma?.turno || 'Horário da turma';

			return {
				id: row.id,
				ambienteId: row.ambiente_id,
				ambienteNome: `${row.ambientes?.codigo || `AMB-${row.ambiente_id}`} · ${row.ambientes?.nome || ''}`,
				ambienteCodigo: row.ambientes?.codigo || `AMB-${row.ambiente_id}`,
				aulaId: row.atribuicao_aula_id,
				aulaDescricao: [turmaNome, materiaNome, docenteNome].filter(Boolean).join(' · '),
				diaSemana: row.dia_semana || 'Segunda a Sexta',
				horario: row.horario || horario,
				periodo: row.periodo || turma?.turno || 'Semestral'
			};
		});
	}

	async function createAlocacao(input, { docenteId } = {}) {
		if (!database) throw new Error('Supabase não configurado.');

		const alocacao = validateAlocacao(input);

		const { data: ambiente, error: ambienteError } = await database
			.from('ambientes')
			.select('id, status')
			.eq('id', alocacao.ambienteId)
			.maybeSingle();
		if (ambienteError) throw ambienteError;
		if (!ambiente) throw new Error('Ambiente não encontrado.');

		const statusAmbiente = String(ambiente.status || '')
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase();
		if (!['disponivel', 'livre', 'ativo'].includes(statusAmbiente)) {
			throw new Error('O ambiente selecionado não está disponível para alocação.');
		}

		let aulaQuery = database
			.from('turma_componentes_docentes')
			.select('id')
			.eq('id', alocacao.aulaId);
		if (docenteId) aulaQuery = aulaQuery.eq('docente_id', docenteId);
		const { data: aula, error: aulaError } = await aulaQuery.maybeSingle();
		if (aulaError) throw aulaError;
		if (!aula) throw new Error('Aula não encontrada.');

		const { data: conflito, error: conflitoError } = await database
			.from('alocacoes_ambiente')
			.select('id')
			.eq('ambiente_id', alocacao.ambienteId)
			.eq('dia_semana', alocacao.diaSemana)
			.eq('horario', alocacao.horario)
			.maybeSingle();
		if (conflitoError) throw conflitoError;
		if (conflito) throw new Error('O ambiente já está alocado nesse dia e horário.');

		const { data, error } = await database
			.from('alocacoes_ambiente')
			.insert({
				ambiente_id: alocacao.ambienteId,
				atribuicao_aula_id: alocacao.aulaId,
				dia_semana: alocacao.diaSemana,
				periodo: alocacao.periodo,
				horario: alocacao.horario
			})
			.select('*')
			.single();

		if (error?.code === '23505') {
			throw new Error('O ambiente já está alocado nesse dia e horário.');
		}
		if (error) throw error;

		return data;
	}

	return { listAlocacoes, createAlocacao };
}

module.exports = createAlocacoesService;
