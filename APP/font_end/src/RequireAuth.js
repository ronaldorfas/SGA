import { Navigate, useLocation } from 'react-router-dom';
import { getAuthSession } from './authSession';

function RequireAuth({ profiles, children }) {
	const location = useLocation();
	const session = getAuthSession();

	if (!session) {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}
	if (profiles && !profiles.includes(session.user.perfil)) {
		return <Navigate to="/Relatorio" replace />;
	}
	return children;
}

export default RequireAuth;
