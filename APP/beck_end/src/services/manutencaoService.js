const supabase = require('../config/supabase');

const transitions = {
	'Pendente de análise': ['Em análise'],
	'Em análise': ['Aprovada', 'Não aprovada'],
	'Aprovada': ['Em atendimento'],
	'Em atendimento': ['Finalizada'],
	'Não aprovada': [],
	'Finalizada': []
};

const occurrenceTypes = [
	'Vazamento',
	'Ar-condicionado',
	'Iluminação',
	'Equipamento',
	'Elétrica',
	'Estrutural',
	'Portas e fechaduras',
	'Mobiliário',
	'Infraestrutura',
	'Outro'
];
const priorities = ['Baixa', 'Média', 'Alta', 'Urgente'];

function validationError(message) {
	const error = new Error(message);
	error.statusCode = 400;
	return error;
}

function mapSuggestion(row) {
	const occurrence = Array.isArray(row.ocorrencias_manutencao)
		? row.ocorrencias_manutencao[0]
		: row.ocorrencias_manutencao;
	return {
		id: row.id,
		ambienteId: row.ambiente_id,
		nome: row.nome,
		sugestao: row.sujestao,
		status: row.status,
		criadoEm: row.criadoem,
		comentario: row.comentario || '',
		tipoOcorrencia: row.tipo_ocorrencia || '',
		resultadoAnalise: row.resultado_analise || '',
		prioridade: row.prioridade || '',
		responsavelId: row.responsavel_id || null,
		aprovadoEm: row.aprovado_em || null,
		atendimentoInicio: row.atendimento_inicio || null,
		finalizadaEm: row.finalizada_em || null,
		ocorrenciaId: occurrence?.id || null,
		local: row.ambientes?.local || row.ambientes?.nome || 'Geral'
	};
}

function createManutencaoService(database) {
	async function listSugestoes() {
		if (!database) throw new Error('Supabase não configurado.');

		const { data, error } = await database
			.from('sugestoes_manutencao')
			.select('id, ambiente_id, nome, sujestao, status, criadoem, comentario, tipo_ocorrencia, resultado_analise, prioridade, responsavel_id, aprovado_em, atendimento_inicio, finalizada_em, ambientes(nome, local), ocorrencias_manutencao(id)')
			.order('id', { ascending: false });

		if (error) throw error;
		return (data || []).map(mapSuggestion);
	}

	async function createSugestao(input = {}) {
		if (!database) throw new Error('Supabase não configurado.');

		const { nome, ambienteId, local, sugestao } = input && typeof input === 'object' ? input : {};
		const cleanNome = String(nome || '').trim();
		const cleanSugestao = String(sugestao || '').trim();
		const rawAmbienteId = ambienteId ?? local;
		const cleanLocal = String(local || '').trim();
		const cleanAmbienteId = Number(rawAmbienteId);

		if (!cleanNome || !cleanSugestao) {
			throw validationError('Nome e sugestão são obrigatórios.');
		}
		if (cleanNome.length > 120 || cleanSugestao.length > 4000) {
			throw validationError('O nome deve ter até 120 caracteres e a sugestão até 4000 caracteres.');
		}

		let resolvedAmbienteId = null;
		if (Number.isSafeInteger(cleanAmbienteId) && cleanAmbienteId > 0) {
			resolvedAmbienteId = cleanAmbienteId;
		} else if (cleanLocal) {
			const searchValue = cleanLocal.replace(/\s*·\s*/g, ' ').trim();
			const { data: amb, error: ambienteError } = await database
				.from('ambientes')
				.select('id')
				.or(`nome.ilike.%${searchValue}%,local.ilike.%${searchValue}%,codigo.ilike.%${searchValue}%`)
				.limit(1)
				.maybeSingle();
			if (ambienteError) throw ambienteError;
			if (amb) resolvedAmbienteId = amb.id;
		}

		if (!resolvedAmbienteId) {
			throw validationError('Selecione um ambiente válido para registrar a sugestão.');
		}

		const { data, error } = await database
			.from('sugestoes_manutencao')
			.insert({
				ambiente_id: resolvedAmbienteId,
				nome: cleanNome,
				sujestao: cleanSugestao,
				status: 'Pendente de análise'
			})
			.select('id, ambiente_id, nome, sujestao, status, criadoem, comentario, tipo_ocorrencia, resultado_analise, prioridade, responsavel_id, aprovado_em, atendimento_inicio, finalizada_em')
			.single();

		if (error) throw error;
		return mapSuggestion({ ...data, ambientes: { local: cleanLocal }, ocorrencias_manutencao: [] });
	}

	async function updateSugestaoStatus(id, input = {}, { responsavelId } = {}) {
		if (!database) throw new Error('Supabase não configurado.');

		const suggestionId = Number(id);
		if (!Number.isSafeInteger(suggestionId) || suggestionId <= 0) {
			throw validationError('Identificador da sugestão inválido.');
		}
		if (typeof responsavelId !== 'string' || !responsavelId.trim()) {
			throw validationError('Responsável autenticado inválido.');
		}

		const { status, comentario, tipoOcorrencia, prioridade, resultadoAnalise } = input && typeof input === 'object' ? input : {};
		const cleanStatus = String(status || '').trim();
		const cleanComentario = String(comentario || '').trim();
		const cleanTipo = String(tipoOcorrencia || '').trim();
		const cleanPrioridade = String(prioridade || '').trim();
		const cleanResultado = String(resultadoAnalise || '').trim();

		if (cleanComentario.length > 2000) throw validationError('A observação deve ter no máximo 2000 caracteres.');
		if (!cleanComentario) throw validationError('Descreva a observação ou ação realizada.');

		const { data: current, error: lookupError } = await database
			.from('sugestoes_manutencao')
			.select('id, status')
			.eq('id', suggestionId)
			.maybeSingle();
		if (lookupError) throw lookupError;
		if (!current) return null;

		if (!transitions[current.status]?.includes(cleanStatus)) {
			throw validationError(`Transição inválida de "${current.status}" para "${cleanStatus}".`);
		}
		if (cleanStatus === 'Aprovada') {
			if (!occurrenceTypes.includes(cleanTipo)) throw validationError('Selecione um tipo de ocorrência válido.');
			if (!priorities.includes(cleanPrioridade)) throw validationError('Selecione uma prioridade válida.');
			if (!cleanResultado) throw validationError('Informe o resultado da análise.');
		}
		if (cleanStatus === 'Não aprovada' && !cleanResultado) {
			throw validationError('Informe o resultado da análise para não aprovar a sugestão.');
		}
		if (cleanResultado.length > 2000) throw validationError('O resultado da análise deve ter no máximo 2000 caracteres.');

		const update = {
			status: cleanStatus,
			comentario: cleanComentario,
			responsavel_id: responsavelId.trim()
		};
		if (cleanStatus === 'Aprovada') {
			update.tipo_ocorrencia = cleanTipo;
			update.prioridade = cleanPrioridade;
			update.resultado_analise = cleanResultado;
		} else if (cleanStatus === 'Não aprovada') {
			update.resultado_analise = cleanResultado;
		}

		const { data, error } = await database
			.from('sugestoes_manutencao')
			.update(update)
			.eq('id', suggestionId)
			.eq('status', current.status)
			.select('id, ambiente_id, nome, sujestao, status, criadoem, comentario, tipo_ocorrencia, resultado_analise, prioridade, responsavel_id, aprovado_em, atendimento_inicio, finalizada_em, ambientes(nome, local), ocorrencias_manutencao(id)')
			.maybeSingle();
		if (error) throw error;
		if (!data) throw validationError('A sugestão foi atualizada por outra pessoa. Recarregue a fila e tente novamente.');
		return mapSuggestion(data);
	}

	async function listHistorico(id) {
		if (!database) throw new Error('Supabase não configurado.');
		const suggestionId = Number(id);
		if (!Number.isSafeInteger(suggestionId) || suggestionId <= 0) {
			throw validationError('Identificador da sugestão inválido.');
		}

		const { data, error } = await database
			.from('historico_manutencao')
			.select('id, status_anterior, status_novo, responsavel_id, observacao, acao, criadoem')
			.eq('sugestao_id', suggestionId)
			.order('criadoem');
		if (error) throw error;
		return (data || []).map((event) => ({
			id: event.id,
			statusAnterior: event.status_anterior,
			status: event.status_novo,
			responsavelId: event.responsavel_id,
			observacao: event.observacao || '',
			acao: event.acao,
			criadoEm: event.criadoem
		}));
	}

	return { listSugestoes, createSugestao, updateSugestaoStatus, listHistorico };
}

const service = createManutencaoService(supabase);

module.exports = {
	...service,
	createManutencaoService,
	occurrenceTypes,
	priorities,
	transitions
};
