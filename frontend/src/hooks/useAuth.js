import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  const signIn = async (email, password) => {
    try {
      const response = await axios.post('https://primefit-production-e300.up.railway.app/auth/token', {
        username: email,
        password: password,
      }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const token = response.data.access_token;
      localStorage.setItem('token', token);
      setToken(token);
      await fetchUser(token); // buscar dados do perfil após login

      return true;
    } catch (err) {
      console.error('Erro no login:', err);
      return false;
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const fetchUser = async (tokenParam) => {
    try {
      const res = await axios.get('https://primefit-production-e300.up.railway.app/api/profiles/me', {
        headers: {
          Authorization: `Bearer ${tokenParam || token}`,
        },
      });
      setUser(res.data);
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      signOut();
    }
  };

  // Carregar token do localStorage na inicialização
  useEffect(() => {
    if (token) {
      fetchUser(token);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
