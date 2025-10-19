import React, { useState, useCallback, useEffect } from 'react';
import { User, MCPServer, ServerStatus } from './types';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Header from './components/Header';
import Profile from './components/Profile';
import Settings from './components/Settings';
import { MOCK_USERS, MOCK_DB } from './data/mockData';

type Page = 'dashboard' | 'profile' | 'settings';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  
  // Entire mock database state is managed here
  const [db, setDb] = useState(MOCK_DB);
  
  const [userServers, setUserServers] = useState<MCPServer[]>([]);

  useEffect(() => {
    // When user logs in or out, update the servers they can see
    if (user) {
      setUserServers(db.servers[user.email] || []);
    } else {
      setUserServers([]);
    }
  }, [user, db]);

  // Effect to simulate live metrics for running servers
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
        setDb(prevDb => {
            const userServers = prevDb.servers[user.email]?.map(server => {
                if (server.status === ServerStatus.RUNNING && server.metrics) {
                    const newCpu = Math.max(5, Math.min(95, server.metrics.cpu + (Math.random() - 0.5) * 5));
                    const newMemUsed = Math.max(128, Math.min(server.metrics.memory.total - 128, server.metrics.memory.used + (Math.random() - 0.5) * 50));
                    const newNetIn = Math.max(0, server.metrics.network.inbound + (Math.random() - 0.4) * 10);
                    const newNetOut = Math.max(0, server.metrics.network.outbound + (Math.random() - 0.4) * 50);
                    
                    const newFunctionCalls = server.functionCalls + Math.floor(Math.random() * 5);
                    const newDataIn = server.totalDataIn + (newNetIn * 3 / 1024); // convert KB/s over 3s to MB
                    const newDataOut = server.totalDataOut + (newNetOut * 3 / 1024); // convert KB/s over 3s to MB


                    return {
                        ...server,
                        metrics: {
                            cpu: parseFloat(newCpu.toFixed(1)),
                            memory: {
                                used: Math.round(newMemUsed),
                                total: server.metrics.memory.total,
                            },
                            network: {
                                inbound: parseFloat(newNetIn.toFixed(1)),
                                outbound: parseFloat(newNetOut.toFixed(1)),
                            },
                        },
                        functionCalls: newFunctionCalls,
                        totalDataIn: parseFloat(newDataIn.toFixed(2)),
                        totalDataOut: parseFloat(newDataOut.toFixed(2)),
                    };
                }
                return server;
            }) || [];

            return {
                ...prevDb,
                servers: { ...prevDb.servers, [user.email]: userServers },
            };
        });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [user]);

  const handleLogin = useCallback((provider: 'Google' | 'GitHub') => {
    console.log(`Logging in with ${provider}...`);
    // In a real app, you'd fetch user data. Here we use a mock.
    const loggedInUser = MOCK_USERS['investor@example.com'];
    setUser(loggedInUser);
    setCurrentPage('dashboard'); // Reset to dashboard on login
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
  }, []);
  
  const handleNavigate = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const handleCreateServer = useCallback((name: string, template: string) => {
    if (!user) return;

    const creationTime = new Date();
    const newServer: MCPServer = {
      id: `${user.email}-${Date.now()}`, // More unique ID
      name,
      status: ServerStatus.CREATING,
      url: `https://${name.toLowerCase().replace(/\s/g, '-')}.mcp.app`,
      template,
      createdAt: creationTime.toISOString(),
      functionCalls: 0,
      totalDataIn: 0,
      totalDataOut: 0,
    };

    setDb(prevDb => {
      const userServers = prevDb.servers[user.email] || [];
      const updatedServers = [newServer, ...userServers];
      const newLogEntry = `[${creationTime.toISOString()}] Server creation process initiated for '${name}'.`;
      
      return {
        ...prevDb,
        servers: { ...prevDb.servers, [user.email]: updatedServers },
        logs: { ...prevDb.logs, [newServer.id]: [newLogEntry] }
      };
    });
    
    // Simulate creation process
    setTimeout(() => {
        const containerId = Array(6).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        const step2Time = new Date();
        const step3Time = new Date(step2Time.getTime() + 1000);
        const completionTime = new Date(step3Time.getTime() + 1000);

        setDb(prevDb => {
            const serverLogs = prevDb.logs[newServer.id] || [];
            const updatedLogs = [
                ...serverLogs,
                `[${step2Time.toISOString()}] Provisioning Docker container...`,
                `[${step3Time.toISOString()}] Container ${containerId} created.`,
                `[${completionTime.toISOString()}] Server is now running.`
            ];
            
            const userServers = prevDb.servers[user.email]?.map(s => 
                s.id === newServer.id ? {...s, status: ServerStatus.RUNNING, containerId: containerId, startedAt: completionTime.toISOString(), metrics: { cpu: 10, memory: { used: 256, total: 1024 }, network: { inbound: 5, outbound: 100 } } } : s
            ) || [];

            return {
                ...prevDb,
                servers: { ...prevDb.servers, [user.email]: userServers },
                logs: { ...prevDb.logs, [newServer.id]: updatedLogs }
            }
        });
    }, 2500);
  }, [user]);

  const handleStopServer = useCallback((id: string) => {
    if (!user) return;

    const transitionTime = new Date();
    setDb(prevDb => {
      const userServers = prevDb.servers[user.email]?.map(s =>
        s.id === id ? { ...s, status: ServerStatus.STOPPING } : s
      ) || [];
      const updatedLogs = [...(prevDb.logs[id] || []), `[${transitionTime.toISOString()}] Stopping server...`];
      return { ...prevDb, servers: { ...prevDb.servers, [user.email]: userServers }, logs: { ...prevDb.logs, [id]: updatedLogs } };
    });

    setTimeout(() => {
      const completionTime = new Date();
      setDb(prevDb => {
        const userServers = prevDb.servers[user.email]?.map(s => {
          if (s.id === id) {
            const { metrics, startedAt, ...serverWithoutMetrics } = s;
            return { ...serverWithoutMetrics, status: ServerStatus.STOPPED };
          }
          return s;
        }) || [];
        const updatedLogs = [...(prevDb.logs[id] || []), `[${completionTime.toISOString()}] Server stopped.`];
        return { ...prevDb, servers: { ...prevDb.servers, [user.email]: userServers }, logs: { ...prevDb.logs, [id]: updatedLogs } };
      });
    }, 1500);
  }, [user]);

  const handleStartServer = useCallback((id: string) => {
    if (!user) return;
    
    const transitionTime = new Date();
    setDb(prevDb => {
      const userServers = prevDb.servers[user.email]?.map(s =>
        s.id === id ? { ...s, status: ServerStatus.STARTING } : s
      ) || [];
      const updatedLogs = [...(prevDb.logs[id] || []), `[${transitionTime.toISOString()}] Starting server...`];
      return { ...prevDb, servers: { ...prevDb.servers, [user.email]: userServers }, logs: { ...prevDb.logs, [id]: updatedLogs } };
    });

    setTimeout(() => {
       const completionTime = new Date();
      setDb(prevDb => {
        const userServers = prevDb.servers[user.email]?.map(s =>
          s.id === id ? { ...s, status: ServerStatus.RUNNING, startedAt: completionTime.toISOString(), metrics: { cpu: 10, memory: { used: 256, total: 1024 }, network: { inbound: 5, outbound: 100 } } } : s
        ) || [];
        const updatedLogs = [...(prevDb.logs[id] || []), `[${completionTime.toISOString()}] Server is now running.`];
        return { ...prevDb, servers: { ...prevDb.servers, [user.email]: userServers }, logs: { ...prevDb.logs, [id]: updatedLogs } };
      });
    }, 1500);
  }, [user]);

  const handleDeleteServer = useCallback((id: string) => {
    if (!user) return;
    
    const transitionTime = new Date();
    setDb(prevDb => {
        const userServers = prevDb.servers[user.email]?.map(s => 
            s.id === id ? {...s, status: ServerStatus.DELETING} : s
        ) || [];
        const updatedLogs = [...(prevDb.logs[id] || []), `[${transitionTime.toISOString()}] Deleting server...`];
        return {...prevDb, servers: {...prevDb.servers, [user.email]: userServers}, logs: {...prevDb.logs, [id]: updatedLogs}};
    });

    setTimeout(() => {
        setDb(prevDb => {
            const userServers = prevDb.servers[user.email]?.filter(server => server.id !== id) || [];
            const newLogs = {...prevDb.logs};
            delete newLogs[id];
            
            return {
              ...prevDb,
              servers: { ...prevDb.servers, [user.email]: userServers },
              logs: newLogs
            };
        });
    }, 1500);
  }, [user]);

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
            servers={userServers}
            logs={db.logs}
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
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
