import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { User, MCPServer, ServerStatus } from './types';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Header from './components/Header';
import Profile from './components/Profile';
import Settings from './components/Settings';
import { MOCK_USERS } from './data/mockData';

type Page = 'dashboard' | 'profile' | 'settings';

const API_URL = import.meta.env.VITE_API_URL;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/servers`);
      setServers(response.data);
    } catch (err) {
      setError('Failed to fetch servers.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchServers();

      const ws = new WebSocket(import.meta.env.VITE_WS_URL);

      ws.onmessage = event => {
        const message = JSON.parse(event.data);
        if (message.type === 'server_updated' || message.type === 'server_created' || message.type === 'server_deleted') {
          fetchServers();
        }
      };

      return () => {
        ws.close();
      };
    }
  }, [user, fetchServers]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API_URL}/me`).then(response => {
        setUser(response.data);
      });
    }
  }, []);

  const handleLogin = useCallback(async (email, password) => {
    console.log('Logging in with:', email, password);
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const userResponse = await axios.get(`${API_URL}/me`);
      setUser(userResponse.data);
      setCurrentPage('dashboard');
    } catch (err) {
      setError('Failed to login.');
    }
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const handleRegister = useCallback(async (email, password) => {
    try {
      await axios.post(`${API_URL}/register`, { email, password });
      handleLogin(email, password);
    } catch (err) {
      setError('Failed to register.');
    }
  }, [handleLogin]);
  
  const handleNavigate = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const handleCreateServer = useCallback(async (name: string, template: string) => {
    if (!user) return;
    try {
      await axios.post(`${API_URL}/servers`, { name, template });
      fetchServers();
    } catch (err) {
      setError('Failed to create server.');
    }
  }, [user, fetchServers]);

  const handleStopServer = useCallback(async (id: string) => {
    try {
      await axios.put(`${API_URL}/servers/${id}/stop`);
      fetchServers();
    } catch (err) {
      setError('Failed to stop server.');
    }
  }, [fetchServers]);

  const handleStartServer = useCallback(async (id: string) => {
    try {
      await axios.put(`${API_URL}/servers/${id}/start`);
      fetchServers();
    } catch (err) {
      setError('Failed to start server.');
    }
  }, [fetchServers]);

  const handleDeleteServer = useCallback(async (id: string) => {
    try {
      await axios.delete(`${API_URL}/servers/${id}`);
      fetchServers();
    } catch (err) {
      setError('Failed to delete server.');
    }
  }, [fetchServers]);

  const renderContent = () => {
    if (!user) return null;

    switch (currentPage) {
      case 'profile':
        return <Profile user={user} />;
      case 'settings':
        return <Settings />;
      case 'dashboard':
      default:
        return (
          <Dashboard
            user={user}
            servers={servers}
            onCreateServer={handleCreateServer}
            onDeleteServer={handleDeleteServer}
            onStartServer={handleStartServer}
            onStopServer={handleStopServer}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      {user ? (
        <>
          <Header user={user} onLogout={handleLogout} onNavigate={handleNavigate} />
          <main>
            {renderContent()}
          </main>
        </>
      ) : (
        <Login onLogin={handleLogin} onRegister={handleRegister} />
      )}
    </div>
  );
};

export default App;
