import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from './api';
import { setAuthSession } from './authSession';
import './Login.css';

function Login() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({ email: '', senha: '' });
	const [error, setError] = useState('');
	const [sending, setSending] = useState(false);

	function handleChange(event) {
		const { name, value } = event.target;
		setFormData((currentData) => ({ ...currentData, [name]: value }));
		setError('');
	}

	async function handleSubmit(event) {
		event.preventDefault();
		setSending(true);
		setError('');
		try {
			const response = await apiFetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: formData.email, password: formData.senha })
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.erro || 'Não foi possível entrar.');
			setAuthSession(result);
			navigate('/Relatorio', { replace: true });
		} catch (loginError) {
			setError(loginError.message || 'Não foi possível validar o login. Tente novamente.');
		} finally {
			setSending(false);
		}
	}

	return (
		<main className="login-page">
			<section className="login-panel" aria-labelledby="login-title">
				<div className="login-heading">
					<p className="login-kicker">SISTEMA DE GESTÃO DE AMBIENTES</p>
					<h1 id="login-title">Entrar no painel</h1>
					<p>Entre com sua conta autorizada para acessar as operações do campus.</p>
				</div>

				<form className="login-form" onSubmit={handleSubmit}>
					<label htmlFor="usuario-login">
						E-mail
						<input id="usuario-login" name="email" type="email" autoComplete="username" value={formData.email} onChange={handleChange} required />
					</label>
					<label htmlFor="senha-login">
						Senha
						<input id="senha-login" name="senha" type="password" autoComplete="current-password" value={formData.senha} onChange={handleChange} required />
					</label>
					<div className="login-footer">
						{error && <p className="login-error" role="alert">{error}</p>}
						<button className="login-submit" type="submit" disabled={sending}>{sending ? 'Validando...' : 'Entrar'} <span aria-hidden="true">↗</span></button>
					</div>
				</form>
			</section>
		</main>
	);
}

export default Login;
