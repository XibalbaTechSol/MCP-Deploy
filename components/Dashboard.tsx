import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MCPServer, User, ServerStatus } from '../types';
import CreateServerModal from './CreateServerModal';
import PromoteServerModal from './PromoteServerModal';
import ServerDetailPanel from './ServerDetailPanel';
import PlusIcon from './icons/PlusIcon';
import CubeIcon from './icons/CubeIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import BoltIcon from './icons/BoltIcon';
import ArrowDownTrayIcon from './icons/ArrowDownTrayIcon';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import MagnifyingGlassIcon from './icons/MagnifyingGlassIcon';
import PlayIcon from './icons/PlayIcon';
import StopIcon from './icons/StopIcon';
import TrashIcon from './icons/TrashIcon';
import CodeIcon from './icons/CodeIcon';

interface DashboardProps {
  user: User;
  servers: MCPServer[];
  logs: { [key: string]: string[] };
  onCreateServer: (name: string, template: string) => void;
  onDeleteServer: (id: string) => void;
  onStartServer: (id: string) => void;
  onStopServer: (id: string) => void;
}

const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);
const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 MB';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const statusClasses: { [key in ServerStatus]: { bg: string, text: string, dot: string } } = {
  [ServerStatus.RUNNING]: { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-500' },
  [ServerStatus.STOPPED]: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' },
  [ServerStatus.CREATING]: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-500 animate-pulse' },
  [ServerStatus.STARTING]: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-500 animate-pulse' },
  [ServerStatus.STOPPING]: { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-500 animate-pulse' },
  [ServerStatus.DELETING]: { bg: 'bg-rose-500/10', text: 'text-rose-400', dot: 'bg-rose-500 animate-pulse' },
};

const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: number | string;
    color: string;
    isLoading: boolean;
}> = ({ icon, title, value, color, isLoading }) => {
    const colorClasses: { [key: string]: string } = {
        green: 'bg-green-500/10 text-green-400',
        red: 'bg-red-500/10 text-red-400',
        cyan: 'bg-cyan-500/10 text-cyan-400',
        slate: 'bg-slate-600/20 text-slate-300'
    };
    return (
        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 flex items-center space-x-4">
            <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-400">{title}</p>
                {isLoading ? (
                    <div className="h-7 w-20 bg-slate-700 rounded animate-pulse mt-1"></div>
                ) : (
                    <p className="text-3xl font-bold text-slate-100">{value}</p>
                )}
            </div>
        </div>
    );
};

const useUptime = (startedAt?: string) => {
  const [uptime, setUptime] = useState('0s');

  useEffect(() => {
    if (!startedAt) {
      setUptime('-');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(startedAt);
      const diffSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);

      const d = Math.floor(diffSeconds / (3600*24));
      const h = Math.floor(diffSeconds % (3600*24) / 3600);
      const m = Math.floor(diffSeconds % 3600 / 60);
      const s = Math.floor(diffSeconds % 60);
      
      let uptimeString = '';
      if (d > 0) uptimeString += `${d}d `;
      if (h > 0) uptimeString += `${h}h `;
      if (m > 0 && d === 0) uptimeString += `${m}m `;
      if (h === 0 && d === 0) uptimeString += `${s}s`;
      
      setUptime(uptimeString.trim());
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  return uptime;
};

interface ServerRowProps {
  server: MCPServer;
  onSelect: (server: MCPServer) => void;
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
  onPromote: (server: MCPServer) => void;
}

const ServerRow: React.FC<ServerRowProps> = ({ server, onSelect, onDelete, onStart, onStop, onPromote }) => {
  const uptime = useUptime(server.startedAt);
  const statusStyle = statusClasses[server.status];
  const memUsage = server.metrics ? (server.metrics.memory.used / server.metrics.memory.total) * 100 : 0;
  const isTransient = [ServerStatus.CREATING, ServerStatus.DELETING, ServerStatus.STARTING, ServerStatus.STOPPING].includes(server.status);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm(`Are you sure you want to delete "${server.name}"?`)) {
        onDelete(server.id);
    }
  }

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStart(server.id);
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStop(server.id);
  };
  
  const handlePromote = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPromote(server);
  }

  return (
    <tr 
      className="bg-slate-800 hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-slate-700 last:border-b-0"
      onClick={() => onSelect(server)}
    >
      <td className="p-4 whitespace-nowrap">
        <div className="font-semibold text-slate-100">{server.name}</div>
        <div className="text-xs text-slate-400">{server.template}</div>
      </td>
      <td className="p-4 whitespace-nowrap">
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
            <span className={`w-2 h-2 mr-1.5 rounded-full ${statusStyle.dot}`}></span>
            {server.status}
        </div>
      </td>
      <td className="p-4 whitespace-nowrap font-mono text-xs text-cyan-400">{server.url}</td>
      <td className="p-4 whitespace-nowrap text-sm text-slate-300">{uptime}</td>
      <td className="p-4 whitespace-nowrap">
        <div className="w-24">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">CPU</span>
                <span className="text-slate-200">{server.metrics?.cpu.toFixed(1) ?? '0.0'}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5"><div className="bg-cyan-500 h-1.5 rounded-full" style={{width: `${server.metrics?.cpu ?? 0}%`}}></div></div>
        </div>
      </td>
      <td className="p-4 whitespace-nowrap">
        <div className="w-24">
            <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Mem</span>
                <span className="text-slate-200">{memUsage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{width: `${memUsage}%`}}></div></div>
        </div>
      </td>
      <td className="p-4 whitespace-nowrap text-sm text-slate-300 font-mono text-right">{formatNumber(server.functionCalls)}</td>
      <td className="p-4 whitespace-nowrap text-sm text-slate-300 font-mono text-right">{formatBytes(server.totalDataOut)}</td>
       <td className="p-4 whitespace-nowrap text-right">
            <div className="flex items-center justify-end space-x-2">
                {server.status === ServerStatus.RUNNING && (
                    <button onClick={handleStop} disabled={isTransient} className="p-2 text-slate-400 hover:text-orange-400 disabled:opacity-50" title="Stop"><StopIcon className="w-5 h-5"/></button>
                )}
                {server.status === ServerStatus.STOPPED && (
                    <button onClick={handleStart} disabled={isTransient} className="p-2 text-slate-400 hover:text-green-400 disabled:opacity-50" title="Start"><PlayIcon className="w-5 h-5"/></button>
                )}
                <button onClick={handlePromote} disabled={isTransient || server.status !== ServerStatus.RUNNING} className="p-2 text-slate-400 hover:text-cyan-400 disabled:opacity-50" title="Promote"><CodeIcon className="w-5 h-5"/></button>
                <button onClick={handleDelete} disabled={isTransient} className="p-2 text-slate-400 hover:text-red-400 disabled:opacity-50" title="Delete"><TrashIcon className="w-5 h-5"/></button>
            </div>
        </td>
    </tr>
  )
}


const Dashboard: React.FC<DashboardProps> = ({ user, servers, logs, onCreateServer, onDeleteServer, onStartServer, onStopServer }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isPromoteModalOpen, setPromoteModalOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [serverForPromotion, setServerForPromotion] = useState<MCPServer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenPromoteModal = useCallback((server: MCPServer) => {
    setServerForPromotion(server);
    setPromoteModalOpen(true);
  }, []);
  
  const stats = useMemo(() => ({
    total: servers.length,
    running: servers.filter(s => s.status === ServerStatus.RUNNING).length,
    stopped: servers.filter(s => s.status === ServerStatus.STOPPED).length,
    totalCalls: servers.reduce((acc, s) => acc + s.functionCalls, 0),
    totalData: servers.reduce((acc, s) => acc + s.totalDataIn + s.totalDataOut, 0),
  }), [servers]);

  const filteredServers = useMemo(() => {
    return servers
      .filter(server => server.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter(server => statusFilter === 'All' || server.status === statusFilter);
  }, [servers, searchTerm, statusFilter]);

  const handleDeleteAndClosePanel = (id: string) => {
    onDeleteServer(id);
    setSelectedServer(null);
  }

  return (
    <>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <StatCard icon={<CubeIcon className="w-7 h-7" />} title="Total Servers" value={stats.total} color="slate" isLoading={isLoading} />
        <StatCard icon={<CheckCircleIcon className="w-7 h-7" />} title="Running" value={stats.running} color="green" isLoading={isLoading} />
        <StatCard icon={<XCircleIcon className="w-7 h-7" />} title="Stopped" value={stats.stopped} color="red" isLoading={isLoading} />
        <StatCard icon={<BoltIcon className="w-7 h-7" />} title="Function Calls" value={formatNumber(stats.totalCalls)} color="cyan" isLoading={isLoading} />
        <StatCard icon={<ArrowUpTrayIcon className="w-7 h-7" />} title="Data Transferred" value={formatBytes(stats.totalData)} color="slate" isLoading={isLoading} />
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">My MCP Servers</h1>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-cyan-600/20"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Create New Server
        </button>
      </div>

      <div className="mb-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
                <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Search servers by name..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
                />
            </div>
            <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none"
                style={{ backgroundPosition: 'right 0.75rem center', backgroundSize: '1.2em', backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat' }}
            >
                <option value="All">All Statuses</option>
                <option value={ServerStatus.RUNNING}>Running</option>
                <option value={ServerStatus.STOPPED}>Stopped</option>
                <option value={ServerStatus.CREATING}>Creating</option>
            </select>
        </div>
      </div>
      
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-800/50">
                <tr>
                    <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Server</th>
                    <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">URL</th>
                    <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Uptime</th>
                    <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">CPU</th>
                    <th scope="col" className="p-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Memory</th>
                    <th scope="col" className="p-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Calls</th>
                    <th scope="col" className="p-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Data Out</th>
                    <th scope="col" className="relative p-4"><span className="sr-only">Actions</span></th>
                </tr>
            </thead>
            <tbody>
                {isLoading ? (
                    <tr><td colSpan={9} className="text-center p-8">Loading servers...</td></tr>
                ) : filteredServers.length > 0 ? (
                    filteredServers.map(server => (
                        <ServerRow 
                            key={server.id} 
                            server={server}
                            onSelect={setSelectedServer}
                            onDelete={onDeleteServer}
                            onStart={onStartServer}
                            onStop={onStopServer}
                            onPromote={handleOpenPromoteModal}
                        />
                    ))
                ) : (
                    <tr>
                        <td colSpan={9}>
                            <div className="text-center py-16">
                                <h3 className="text-xl font-semibold">No servers match your criteria</h3>
                                <p className="text-slate-400 mt-2">Try adjusting your search or filter.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

    </div>
      <CreateServerModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={onCreateServer}
      />
      
      {serverForPromotion && (
        <PromoteServerModal
          isOpen={isPromoteModalOpen}
          onClose={() => setPromoteModalOpen(false)}
          server={serverForPromotion}
        />
      )}

      {selectedServer && (
        <ServerDetailPanel
          server={servers.find(s => s.id === selectedServer.id) || selectedServer}
          logs={logs[selectedServer.id] || []}
          onClose={() => setSelectedServer(null)}
          onDelete={handleDeleteAndClosePanel}
          onStart={onStartServer}
          onStop={onStopServer}
          onPromote={handleOpenPromoteModal}
        />
      )}
    </>
  );
};

export default Dashboard;