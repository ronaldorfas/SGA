import { useEffect, useState } from 'react';
import { apiFetch } from './api';
import './Direcionamento_de_manutenção.css';
import BotaoVoltar from './Botao_voltar';

const columns = [
	{ status: 'Pendente de análise', title: 'Pendente de análise' },
	{ status: 'Em análise', title: 'Em análise' },
	{ status: 'Não aprovada', title: 'Não aprovada' },
	{ status: 'Aprovada', title: 'Aprovada' },
	{ status: 'Em atendimento', title: 'Em atendimento' },
	{ status: 'Finalizada', title: 'Finalizada' },
];

const nextStatuses = {
	'Pendente de análise': ['Em análise'],
	'Em análise': ['Aprovada', 'Não aprovada'],
	'Aprovada': ['Em atendimento'],
	'Em atendimento': ['Finalizada'],
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
	'Outro',
];

function formatDate(value) {
	if (!value) return 'Data indisponível';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return 'Data indisponível';
	return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function Direcionamento_de_manutenção() {
	const [suggestions, setSuggestions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [savingId, setSavingId] = useState(null);
	const [selectedStatuses, setSelectedStatuses] = useState({});
	const [histories, setHistories] = useState({});
	const [openHistoryId, setOpenHistoryId] = useState(null);
	const [loadingHistoryId, setLoadingHistoryId] = useState(null);

	useEffect(() => {
		async function loadSuggestions() {
			try {
				const response = await apiFetch('/api/sugestoes-manutencao');
				const result = await response.json();
				if (!response.ok) throw new Error(result.erro || 'Não foi possível carregar as sugestões.');
				setSuggestions(Array.isArray(result) ? result : []);
			} catch (loadError) {
				setError(loadError.message);
			} finally {
				setLoading(false);
			}
		}

		loadSuggestions();
	}, []);

	async function updateSuggestion(suggestion, event) {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		setSavingId(suggestion.id);
		setError('');
		try {
			const response = await apiFetch(`/api/sugestoes-manutencao/${suggestion.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					status: formData.get('status'),
					comentario: formData.get('comentario'),
					resultadoAnalise: formData.get('resultadoAnalise'),
					tipoOcorrencia: formData.get('tipoOcorrencia'),
					prioridade: formData.get('prioridade'),
				}),
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.erro || 'Não foi possível salvar o direcionamento.');
			setSuggestions((currentSuggestions) => currentSuggestions.map((item) => item.id === result.id ? result : item));
			setSelectedStatuses((current) => ({ ...current, [suggestion.id]: nextStatuses[result.status]?.[0] || '' }));
			setHistories((current) => {
				const updated = { ...current };
				delete updated[suggestion.id];
				return updated;
			});
		} catch (saveError) {
			setError(saveError.message);
		} finally {
			setSavingId(null);
		}
	}

	async function toggleHistory(suggestionId) {
		if (openHistoryId === suggestionId) {
			setOpenHistoryId(null);
			return;
		}
		setOpenHistoryId(suggestionId);
		if (histories[suggestionId]) return;

		setLoadingHistoryId(suggestionId);
		try {
			const response = await apiFetch(`/api/sugestoes-manutencao/${suggestionId}/historico`);
			const result = await response.json();
			if (!response.ok) throw new Error(result.erro || 'Não foi possível carregar o histórico.');
			setHistories((current) => ({ ...current, [suggestionId]: result }));
		} catch (historyError) {
			setError(historyError.message);
			setOpenHistoryId(null);
		} finally {
			setLoadingHistoryId(null);
		}
	}

	return (
		<main className="maintenance-routing">
			<BotaoVoltar />
			<header className="routing-header">
				<div>
					<p className="routing-kicker">CENTRAL DE OPERAÇÕES / MANUTENÇÃO</p>
					<h1>Triagem e ocorrências</h1>
					<p>Analise as sugestões, registre as decisões e acompanhe as ocorrências aprovadas.</p>
				</div>
				<div className="routing-total"><strong>{suggestions.length}</strong><span>solicitações recebidas</span></div>
			</header>

			<section className="routing-list" aria-labelledby="routing-title">
				<div className="routing-list-heading">
					<div>
						<p className="routing-kicker">FLUXO DE ATENDIMENTO</p>
						<h2 id="routing-title">Fila de manutenção</h2>
					</div>
					<span className="routing-live">● HISTÓRICO DE AÇÕES REGISTRADO</span>
				</div>

				{loading && <p className="routing-message">Carregando solicitações...</p>}
				{error && <p className="routing-message routing-error" role="alert">{error}</p>}
				{!loading && !error && suggestions.length === 0 && <p className="routing-message">Nenhuma solicitação registrada.</p>}
				{!loading && suggestions.length > 0 && <div className="routing-columns">
					{columns.map((column) => {
						const columnSuggestions = suggestions.filter((suggestion) => suggestion.status === column.status);
						return (
							<section className="routing-column" key={column.status} aria-labelledby={`column-${column.status}`}>
								<header className="routing-column-header">
									<h3 id={`column-${column.status}`}>{column.title}</h3>
									<strong>{columnSuggestions.length}</strong>
								</header>
								{columnSuggestions.length === 0 && <p className="empty-column">Nenhuma solicitação</p>}
								{columnSuggestions.map((suggestion) => {
									const choices = nextStatuses[suggestion.status] || [];
									const selectedStatus = selectedStatuses[suggestion.id] || choices[0] || '';
									const requiresAnalysis = selectedStatus === 'Aprovada' || selectedStatus === 'Não aprovada';
									return (
										<article className="routing-card" key={suggestion.id}>
											<div className="routing-card-meta">
												<span className="routing-id">#{suggestion.id}</span>
												<time dateTime={suggestion.criadoEm}>{formatDate(suggestion.criadoEm)}</time>
											</div>
											<h4>{suggestion.sugestao}</h4>
											<p><strong>Solicitante</strong>{suggestion.nome}</p>
											<p><strong>Local</strong>{suggestion.local}</p>
											{suggestion.ocorrenciaId && <p><strong>Ocorrência</strong>#{suggestion.ocorrenciaId}</p>}
											{suggestion.tipoOcorrencia && <p><strong>Tipo</strong>{suggestion.tipoOcorrencia}</p>}
											{suggestion.prioridade && <p><strong>Prioridade</strong>{suggestion.prioridade}</p>}
											{suggestion.resultadoAnalise && <p><strong>Análise</strong>{suggestion.resultadoAnalise}</p>}

											{choices.length > 0 && <form className="routing-update-form" onSubmit={(event) => updateSuggestion(suggestion, event)} key={`${suggestion.id}-${suggestion.status}`}>
												<label htmlFor={`status-${suggestion.id}`}>Próxima etapa
													<select
														id={`status-${suggestion.id}`}
														name="status"
														value={selectedStatus}
														onChange={(event) => setSelectedStatuses((current) => ({ ...current, [suggestion.id]: event.target.value }))}
													>
														{choices.map((status) => <option value={status} key={status}>{status}</option>)}
													</select>
												</label>
												{selectedStatus === 'Aprovada' && <>
													<label htmlFor={`tipo-${suggestion.id}`}>Tipo da ocorrência
														<select id={`tipo-${suggestion.id}`} name="tipoOcorrencia" required defaultValue={suggestion.tipoOcorrencia || ''}>
															<option value="">Selecione</option>
															{occurrenceTypes.map((type) => <option value={type} key={type}>{type}</option>)}
														</select>
													</label>
													<label htmlFor={`prioridade-${suggestion.id}`}>Prioridade
														<select id={`prioridade-${suggestion.id}`} name="prioridade" required defaultValue={suggestion.prioridade || ''}>
															<option value="">Selecione</option>
															{['Baixa', 'Média', 'Alta', 'Urgente'].map((priority) => <option value={priority} key={priority}>{priority}</option>)}
														</select>
													</label>
												</>}
												{requiresAnalysis && <label htmlFor={`resultado-${suggestion.id}`}>Resultado da análise
													<textarea id={`resultado-${suggestion.id}`} name="resultadoAnalise" rows="2" maxLength="2000" required defaultValue={suggestion.resultadoAnalise || ''} />
												</label>}
												<label htmlFor={`comentario-${suggestion.id}`}>Observação / ação realizada
													<textarea id={`comentario-${suggestion.id}`} name="comentario" rows="3" maxLength="2000" required placeholder="Registre o que foi analisado ou executado" />
												</label>
												<button type="submit" disabled={savingId === suggestion.id}>{savingId === suggestion.id ? 'Salvando...' : 'Registrar etapa'}</button>
											</form>}
											<button className="routing-history-toggle" type="button" onClick={() => toggleHistory(suggestion.id)}>
												{openHistoryId === suggestion.id ? 'Ocultar histórico' : 'Ver histórico'}
											</button>
											{openHistoryId === suggestion.id && <ol className="routing-history">
												{loadingHistoryId === suggestion.id && <li>Carregando histórico...</li>}
												{histories[suggestion.id]?.map((entry) => <li key={entry.id}>
													<strong>{entry.acao}</strong>
													<time dateTime={entry.criadoEm}>{formatDate(entry.criadoEm)}</time>
													{entry.responsavelId && <span>Responsável: {entry.responsavelId}</span>}
													{entry.observacao && <p>{entry.observacao}</p>}
												</li>)}
											</ol>}
										</article>
									);
								})}
							</section>
						);
					})}
				</div>}
			</section>
		</main>
	);
}

export default Direcionamento_de_manutenção;
