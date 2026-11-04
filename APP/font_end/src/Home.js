import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Home.css';

function Home() {
	const navigate = useNavigate();
	const [now, setNow] = useState(new Date());

	useEffect(() => {
		const refreshClock = window.setInterval(() => setNow(new Date()), 60000);
		return () => window.clearInterval(refreshClock);
	}, []);

	const currentTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

	return (
		<main className="airport-dashboard">
			<header className="airport-header">
				<div className="brand-lockup">
					<span className="brand-mark" aria-hidden="true">⊞</span>
					<div>
						<p className="eyebrow">SISTEMA DE GESTÃO DE AMBIENTES</p>
						<h1>SENAI</h1>
					</div>
				</div>
				<button className="login-button" type="button" onClick={() => navigate('/login')}>
					<span aria-hidden="true">◉</span>
					Login
				</button>
			</header>

			<section className="dashboard-content" aria-labelledby="dashboard-title">
				<div className="welcome-copy">
					<p className="intro-text">Aulas em andamento às {currentTime}</p>
				</div>

				<div className="flight-board" role="table" aria-label="Programação de ambientes">
					<div className="board-heading" role="row">
						<span>HORÁRIO</span><span>DESTINO / TURMA</span><span>AMBIENTE</span><span>STATUS</span>
					</div>
					<p className="board-message">Entre no painel para consultar os dados de utilização dos ambientes.</p>
				</div>
			</section>

			<button className="maintenance-button" type="button" onClick={() => navigate('/sugestao-manutencao')}>
				<span className="wrench-icon" aria-hidden="true">⌁</span>
				<span><strong>Sugestão de manutenção</strong><small>Relate um problema no campus</small></span>
				<span className="arrow" aria-hidden="true">↗</span>
			</button>
		</main>
	);
}

export default Home;
