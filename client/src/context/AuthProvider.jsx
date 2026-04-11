import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(() => localStorage.getItem('aria_token'));
	const [authReady, setAuthReady] = useState(false);

	useEffect(() => {
		async function init() {
			if (!token) {
				setAuthReady(true);
				return;
			}
			try {
				const res = await fetch('/api/users/me', {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (res.ok) {
					const data = await res.json();
					setUser(data.user);
				} else {
					localStorage.removeItem('aria_token');
					setToken(null);
				}
			} catch {
				localStorage.removeItem('aria_token');
				setToken(null);
			} finally {
				setAuthReady(true);
			}
		}
		init();
	}, [token]);

	function login(userData, jwt) {
		localStorage.setItem('aria_token', jwt);
		setToken(jwt);
		setUser(userData);
	}

	function logout() {
		localStorage.removeItem('aria_token');
		setToken(null);
		setUser(null);
	}

	function updateUser(updatedUser) {
		setUser(updatedUser);
	}

	return (
		<AuthContext.Provider value={{ user, token, authReady, login, logout, updateUser }}>
			{children}
		</AuthContext.Provider>
	);
}
