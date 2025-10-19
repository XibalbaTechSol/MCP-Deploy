
import React, { useState } from 'react';
import { MCPServer, ServerStatus, ServerMetrics } from '../types';
import CodeIcon from './icons/CodeIcon';
import TrashIcon from './icons/TrashIcon';
import PlayIcon from './icons/PlayIcon';
import StopIcon from './icons/StopIcon';
import CpuChipIcon from './icons/CpuChipIcon';
import CircleStackIcon from './icons/CircleStackIcon';
import SignalIcon from './icons/SignalIcon';
import XMarkIcon from './icons/XMarkIcon';
import CubeIcon from './icons/CubeIcon';
import ArrowUpRightIcon from './icons/ArrowUpRightIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import ArrowDownTrayIcon from './icons/ArrowDownTrayIcon';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';

interface ServerDetailPanelProps {
  server: MCPServer;
  logs: string[];
  onClose: () => void;
  onPromote: (server: MCPServer) => void;
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
  onStop: (id: string) => void;
}

type Tab = 'metrics' | 'logs' | 'info';

const statusClasses: { [key in ServerStatus]: { bg: string, text: string, dot: string } } = {
  [ServerStatus.RUNNING]: { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-500' },
  [ServerStatus.STOPPED]: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' },
  [ServerStatus.CREATING]: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-500 animate-pulse' },
  [ServerStatus.STARTING]: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-500 animate-pulse' },
  [ServerStatus.STOPPING]: { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-500 animate-pulse' },
  [ServerStatus.DELETING]: { bg: 'bg-rose-500/10', text: 'text-rose-400', dot: 'bg-rose-500 animate-pulse' },
};

const ServerMetricsDisplay: React.FC<{ metrics: ServerMetrics }> = ({ metrics }) => {
    const memoryUsage = (metrics.memory.used / metrics.memory.total) * 100;

    return (
        <div className="space-y-8">
            <div className="text-sm">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center text-slate-400">
                        <CpuChipIcon className="w-5 h-5 mr-2" />
                        <span>CPU Usage</span>
                    </div>
                    <span className="font-mono text-slate-200">{metrics.cpu.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" style={{ width: `${metrics.cpu}%` }}></div>
                </div>
            </div>
            <div className="text-sm">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center text-slate-400">
                        <CircleStackIcon className="w-5 h-5 mr-2" />
                        <span>Memory</span>
                    </div>
                    <span className="font-mono text-slate-200">{metrics.memory.used}MB / {metrics.memory.total}MB</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" style={{ width: `${memoryUsage}%` }}></div>
                </div>
            </div>
            <div className="text-sm">
               <div className="flex items-center text-slate-400 mb-3">
                    <SignalIcon className="w-5 h-5 mr-2" />
                    <span>Network Traffic</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center text-slate-400">
                           <ArrowDownTrayIcon className="w-5 h-5 mr-3 text-cyan-500"/>
                            <span>Inbound</span>
                        </div>
                        <p className="font-mono text-lg font-bold text-slate-100">
                            {metrics.network.inbound.toFixed(1)}
                            <span className="text-sm font-normal text-slate-400 ml-1">KB/s</span>
                        </p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center text-slate-400">
                           <ArrowUpTrayIcon className="w-5 h-5 mr-3 text-amber-500"/>
                            <span>Outbound</span>
                        </div>
                         <p className="font-mono text-lg font-bold text-slate-100">
                            {metrics.network.outbound.toFixed(1)}
                            <span className="text-sm font-normal text-slate-400 ml-1">KB/s</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ServerDetailPanel: React.FC<ServerDetailPanelProps> = ({ server, logs, onClose, onPromote, onDelete, onStart, onStop }) => {
  const statusStyle = statusClasses[server.status];
  const [activeTab, setActiveTab] = useState<Tab>('metrics');
  
  const isTransient = [
    ServerStatus.CREATING, ServerStatus.STARTING, ServerStatus.STOPPING, ServerStatus.DELETING
  ].includes(server.status);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${server.name}"? This action cannot be undone.`)) {
        onDelete(server.id);
    }
  }
  
  const renderTabContent = () => {
    switch(activeTab) {
      case 'metrics':
        return server.status === ServerStatus.RUNNING && server.metrics ? (
            <ServerMetricsDisplay metrics={server.metrics} />
        ) : (
            <div className="text-center py-12">
                <p className="text-slate-400">Metrics are only available for running servers.</p>
            </div>
        );
      case 'logs':
        return (
            <div className="bg-slate-900 rounded-md p-3 h-full overflow-y-auto">
                {logs.length > 0 ? (
                    <ul className="text-xs font-mono text-slate-400 space-y-1">
                        {logs.slice().reverse().map((log, index) => (
                            <li key={index} className="whitespace-pre-wrap">{log}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-xs font-mono text-slate-500">No log entries.</p>
                )}
            </div>
        );
      case 'info':
        return (
            <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                    <span className="text-slate-400">Server ID</span>
                    <span className="font-mono text-slate-200">{server.id}</span>
                </div>
                {server.containerId && <div className="flex justify-between">
                    <span className="text-slate-400">Container ID</span>
                    <span className="font-mono text-slate-200">{server.containerId}</span>
                </div>}
                <div className="flex justify-between">
                    <span className="text-slate-400">Template</span>
                    <span className="text-slate-200">{server.template}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Created At</span>
                    <span className="text-slate-200">{new Date(server.createdAt).toLocaleString()}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-slate-400">Function Calls</span>
                    <span className="font-mono text-slate-200">{server.functionCalls.toLocaleString()}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-slate-400">Data In</span>
                    <span className="font-mono text-slate-200">{server.totalDataIn.toFixed(2)} MB</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-slate-400">Data Out</span>
                    <span className="font-mono text-slate-200">{server.totalDataOut.toFixed(2)} MB</span>
                </div>
            </div>
        );
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose}></div>
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-slate-800 shadow-2xl z-50 border-l border-slate-700 flex flex-col">
        {/* Header */}
        <header className="p-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex justify-between items-center">
             <div>
                <h2 className="text-xl font-bold text-slate-100">{server.name}</h2>
                <div className="flex items-center mt-1">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        <span className={`w-2 h-2 mr-1.5 rounded-full ${statusStyle.dot}`}></span>
                        {server.status}
                    </div>
                     <a href={server.url} target="_blank" rel="noopener noreferrer" className="ml-4 flex items-center text-xs text-cyan-400 hover:text-cyan-300 font-mono">
                        {server.url} <ArrowUpRightIcon className="w-3 h-3 ml-1" />
                    </a>
                </div>
             </div>
             <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700"><XMarkIcon className="w-6 h-6" /></button>
          </div>
          <div className="mt-4 flex space-x-2">
            {server.status === ServerStatus.RUNNING && (
                <button onClick={() => onStop(server.id)} disabled={isTransient} className="flex items-center bg-slate-700 hover:bg-orange-600/50 text-orange-400 font-semibold py-2 px-3 rounded-lg text-sm transition-colors disabled:opacity-50">
                    <StopIcon className="w-4 h-4 mr-2"/> Stop
                </button>
            )}
            {server.status === ServerStatus.STOPPED && (
                <button onClick={() => onStart(server.id)} disabled={isTransient} className="flex items-center bg-slate-700 hover:bg-green-600/50 text-green-400 font-semibold py-2 px-3 rounded-lg text-sm transition-colors disabled:opacity-50">
                    <PlayIcon className="w-4 h-4 mr-2"/> Start
                </button>
            )}
            <button onClick={() => onPromote(server)} disabled={isTransient || server.status !== ServerStatus.RUNNING} className="flex items-center bg-slate-700 hover:bg-cyan-600/50 text-cyan-400 font-semibold py-2 px-3 rounded-lg text-sm transition-colors disabled:opacity-50">
                <CodeIcon className="w-4 h-4 mr-2"/> Promote
            </button>
            <div className="flex-grow"></div>
            <button onClick={handleDelete} disabled={isTransient} className="flex items-center bg-slate-700 hover:bg-red-600/50 text-red-400 font-semibold py-2 px-3 rounded-lg text-sm transition-colors disabled:opacity-50">
                <TrashIcon className="w-4 h-4 mr-2"/> Delete
            </button>
          </div>
        </header>
        
        {/* Tabs */}
        <div className="px-4 border-b border-slate-700 flex-shrink-0">
          <nav className="flex space-x-4">
            <button onClick={() => setActiveTab('metrics')} className={`py-3 px-1 text-sm font-medium border-b-2 ${activeTab === 'metrics' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}><CpuChipIcon className="w-5 h-5 inline-block mr-2"/>Metrics</button>
            <button onClick={() => setActiveTab('logs')} className={`py-3 px-1 text-sm font-medium border-b-2 ${activeTab === 'logs' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}><DocumentTextIcon className="w-5 h-5 inline-block mr-2"/>Logs</button>
            <button onClick={() => setActiveTab('info')} className={`py-3 px-1 text-sm font-medium border-b-2 ${activeTab === 'info' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}><InformationCircleIcon className="w-5 h-5 inline-block mr-2"/>Info</button>
          </nav>
        </div>

        {/* Content */}
        <main className="p-6 flex-grow overflow-y-auto">
            {renderTabContent()}
        </main>
      </div>
    </>
  );
};

export default ServerDetailPanel;
