
import React from 'react';
import GithubIcon from './icons/GithubIcon';
import GoogleIcon from './icons/GoogleIcon';
import CodeIcon from './icons/CodeIcon';

interface LoginProps {
  onLogin: (provider: 'Google' | 'GitHub') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <CodeIcon className="w-12 h-12 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100">Welcome to MCP Deploy</h1>
          <p className="mt-2 text-slate-400">Your one-click deployment platform for MCP Servers.</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => onLogin('GitHub')}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-800 transition-colors"
          >
            <GithubIcon className="w-5 h-5 mr-3" />
            Continue with GitHub
          </button>
          <button
            onClick={() => onLogin('Google')}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-800 transition-colors"
          >
            <GoogleIcon className="w-5 h-5 mr-3" />
            Continue with Google
          </button>
        </div>
        <p className="text-xs text-center text-slate-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Login;
