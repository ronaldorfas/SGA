import { useEffect, useState } from 'react';
import { apiFetch } from './api';
import calculateIndicators from './calcularIndicadores';
import BotaoVoltar from './Botao_voltar';
import './Indicadores.css';

function formatPercentage(value) {
	if (value === null) return '—';
	return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)}%`;
}

async function readList(path, resourceName) {
	const response = await apiFetch(path);
	let result;
	try {
		result = await response.json();
	} catch {
		throw new Error(`A API retornou uma resposta inválida ao carregar ${resourceName}.`);
	}

	if (!response.ok) {
		throw new Error(result.erro || `Não foi possível carregar ${resourceName}.`);
	}
	if (!Array.isArray(result)) {
		throw new Error(`A API retornou um formato inválido para ${resourceName}.`);
	}
	return result;
}

function Indicadores() {
	const [indicators, setIndicators] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		async function loadIndicators() {
			try {
				const [allocations, suggestions] = await Promise.all([
					readList('/api/alocacoes-ambiente', 'as alocações'),
					readList('/api/sugestoes-manutencao', 'as solicitações de manutenção')
				]);
				setIndicators(calculateIndicators(allocations, suggestions));
			} catch (loadError) {
				setError(loadError.message);
			} finally {
				setLoading(false);
			}
		}

		loadIndicators();
	}, []);

	const concentration = indicators?.allocationConcentration;
	const completion = indicators?.maintenanceCompletion;

	return (
		<main className="indicators-page">
			<BotaoVoltar />
			<header className="indicators-header">
				<div>
					<p className="indicators-kicker">SISTEMA DE GESTÃO DE AMBIENTES / ANÁLISE</p>
					<h1>Indicadores do SGA</h1>
					<p>Leitura do histórico de alocações e solicitações de manutenção registradas.</p>
				</div>
			</header>

			<section className="indicators-content" aria-labelledby="indicators-title">
				<div className="indicators-heading">
					<div>
						<p className="indicators-kicker">VISÃO GERAL</p>
						<h2 id="indicators-title">Indicadores calculados a partir dos registros</h2>
					</div>
				</div>

				{loading && <p className="indicators-message">Carregando dados dos indicadores...</p>}
				{error && <p className="indicators-message indicators-error" role="alert">{error} Verifique se a API e o Supabase estão configurados.</p>}

				{!loading && !error && indicators && <div className="indicators-grid">
					<article className="indicator-card">
						<p className="indicator-label">CONCENTRAÇÃO DE ALOCAÇÕES</p>
						<strong className="indicator-value">{formatPercentage(concentration.percentage)}</strong>
						<p className="indicator-highlight">
							{concentration.leadingEnvironment
								? `${concentration.leadingEnvironment.name}: ${concentration.leadingEnvironment.total} de ${concentration.totalAllocations} alocações`
								: 'Nenhuma alocação registrada'}
						</p>
						<dl className="indicator-details">
							<div><dt>Fórmula</dt><dd>Alocações do ambiente líder ÷ total de alocações × 100</dd></div>
							<div><dt>Fonte</dt><dd>Registros de <code>alocacoes_ambiente</code>, agrupados por ambiente.</dd></div>
							<div><dt>Interpretação</dt><dd>Quanto maior o percentual, maior a concentração das alocações registradas em um único ambiente. Não representa a ocupação de todos os horários disponíveis.</dd></div>
						</dl>
					</article>

					<article className="indicator-card">
						<p className="indicator-label">CONCLUSÃO DE MANUTENÇÃO</p>
						<strong className="indicator-value">{formatPercentage(completion.percentage)}</strong>
						<p className="indicator-highlight">
							{completion.totalSuggestions
								? `${completion.completedSuggestions} de ${completion.totalSuggestions} solicitações concluídas`
								: 'Nenhuma solicitação registrada'}
						</p>
						<dl className="indicator-details">
							<div><dt>Fórmula</dt><dd>Solicitações com status “Finalizada” ÷ total de solicitações × 100</dd></div>
							<div><dt>Fonte</dt><dd>Registros de <code>sugestoes_manutencao</code> e seus status atuais.</dd></div>
							<div><dt>Interpretação</dt><dd>Percentual de solicitações registradas que estão marcadas como concluídas. Não mede tempo de atendimento nem SLA.</dd></div>
						</dl>
					</article>
				</div>}

				{!loading && !error && <p className="indicators-note">
					Os indicadores usam todos os registros disponíveis e não aplicam filtro temporal. As alocações ainda não têm data/período de vigência, e os status de manutenção representam o estado atual, não o histórico de mudanças.
				</p>}
			</section>
		</main>
	);
}

export default Indicadores;
