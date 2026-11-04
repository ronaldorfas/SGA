import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession, getAuthSession } from './authSession';
import './Relatorio.css';

const reportOptions = [
	{ value: 'ambientes', label: 'Relatório de ambientes', description: 'Consulte a utilização dos ambientes por aula, dia e horário.', path: '/relatorio-ambientes', profiles: ['coordenador', 'secretaria', 'manutencao'] },
	{ value: 'turmas', label: 'Relatório de turmas', description: 'Visualize turmas cadastradas, cursos, turnos e matérias.', path: '/relatorio-turmas', profiles: ['coordenador', 'secretaria', 'docente'] },
	{ value: 'atribuicoes', label: 'Relatório de atribuições', description: 'Filtre as aulas por professor, turma, ambiente, curso e tipo de curso.', path: '/relatorio-atribuicoes', profiles: ['coordenador', 'secretaria'] },
	{ value: 'banco-sugestoes', label: 'Relatório de manutenção', description: 'Consulte todas as sugestões de manutenção enviadas.', path: '/sugestao-manutencao/dashboard', profiles: ['manutencao'] },
	{ value: 'alocacoes', label: 'Relatório de alocações', description: 'Confira a distribuição de ambientes por turma.', path: '/relatorio-alocacoes', profiles: ['coordenador', 'secretaria', 'manutencao'] },
	{ value: 'indicadores', label: 'Indicadores do SGA', description: 'Acompanhe a concentração de alocações e a conclusão das solicitações de manutenção.', path: '/indicadores', profiles: ['coordenador', 'secretaria', 'manutencao'] },
];

const profileActions = [
	{ profile: 'Docente', actions: [
		{ label: 'Solicitação de ambiente', path: '/Solicitação_de_Ambiente' },
	] },
		{ profile: 'Coordenador', actions: [
		{ label: 'Alocação de ambiente', path: '/Alocação_de_ambiente' },
		{ label: 'Atribuição de aula', path: '/Atribuição_de_turma' },
		{ label: 'Cadastro de turma/docente', path: '/Cadastro_de_turma_doscente' },
	] },
	{ profile: 'Secretaria', actions: [
		{ label: 'Cadastro de turma/docente', path: '/Cadastro_de_turma_doscente' },
	] },
	{ profile: 'Manutenção', actions: [
		{ label: 'Direcionamento de manutenção', path: '/Direcionamento_de_manutenção' },
	] },
];

const profileLabels = {
	docente: 'Docente',
	coordenador: 'Coordenador',
	secretaria: 'Secretaria',
	manutencao: 'Manutenção',
};

function Relatorio() {
	const navigate = useNavigate();
	const session = getAuthSession();
	const perfil = session.user.perfil;
	const availableReports = reportOptions.filter((report) => report.profiles.includes(perfil));
	const [selectedReport, setSelectedReport] = useState(availableReports[0]?.value || '');
	const currentReport = availableReports.find((report) => report.value === selectedReport);
	const visibleProfiles = profileActions.filter((group) => {
		if (perfil === 'docente') return group.profile === 'Docente';
		if (perfil === 'coordenador') return group.profile === 'Coordenador';
		if (perfil === 'secretaria') return group.profile === 'Secretaria';
		return group.profile === 'Manutenção';
	});

	return (
		<main className="reports-page">
			<header className="reports-header">
				<div>
					<p className="reports-kicker">SISTEMA DE GESTÃO DE AMBIENTES</p>
					<h1>Painel de relatórios</h1>
					<p className="reports-user">Perfil: {profileLabels[perfil]}</p>
				</div>
				<nav className="profile-actions" aria-label="Ações por perfil">
					{visibleProfiles.map((profile) => (
						<div className="profile-group" key={profile.profile}>
							<div className="action-list">
								{profile.actions.map((action) => (
									<button type="button" key={action.path} onClick={() => navigate(action.path)}>{action.label} <span aria-hidden="true">↗</span></button>
								))}
							</div>
						</div>
					))}
				</nav>
				<button className="reports-exit" type="button" onClick={() => { clearAuthSession(); navigate('/'); }}>Sair <span aria-hidden="true">↗</span></button>
			</header>

			<section className="reports-content" aria-labelledby="reports-title">
				<section className="report-selector" aria-labelledby="selector-title">
					<label htmlFor="report-type" id="selector-title">Tipo de relatório</label>
					<select id="report-type" value={selectedReport} onChange={(event) => setSelectedReport(event.target.value)} disabled={availableReports.length === 0}>
						{availableReports.map((report) => <option value={report.value} key={report.value}>{report.label}</option>)}
					</select>
					<div className="report-preview" aria-live="polite">
						{currentReport ? <>
							<p className="preview-label">RELATÓRIO SELECIONADO</p>
							<h3>{currentReport.label}</h3>
							<p>{currentReport.description}</p>
							<button className="open-report" type="button" onClick={() => navigate(currentReport.path)}>Abrir relatório <span aria-hidden="true">↗</span></button>
						</> : <p>Use as ações do seu perfil para acessar as funcionalidades disponíveis.</p>}
					</div>
				</section>
			</section>
		</main>
	);
}

export default Relatorio;
