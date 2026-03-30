import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(() => localStorage.getItem('aria_token'));

	useEffect(() => {
		if (!token) return;
		fetch('/api/users/me', {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(res => res.ok ? res.json() : Promise.reject())
			.then(data => setUser(data.user))
			.catch(() => {
				localStorage.removeItem('aria_token');
				setToken(null);
			});
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
		<AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
			{children}
		</AuthContext.Provider>
	);
}
