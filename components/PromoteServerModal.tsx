import React, { useState, useCallback } from 'react';
import { MCPServer } from '../types';
import CopyIcon from './icons/CopyIcon';
import CheckIcon from './icons/CheckIcon';

interface PromoteServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: MCPServer;
}

type LLMProvider = 'gemini' | 'claude' | 'openai' | 'curl';

const TabButton: React.FC<{
    name: string;
    provider: LLMProvider;
    activeTab: LLMProvider;
    onClick: (provider: LLMProvider) => void;
}> = ({ name, provider, activeTab, onClick }) => {
    const isActive = provider === activeTab;
    return (
        <button
            onClick={() => onClick(provider)}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 transition-colors ${
                isActive
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:border-slate-500 hover:text-slate-200'
            }`}
        >
            {name}
        </button>
    );
};


const PromoteServerModal: React.FC<PromoteServerModalProps> = ({ isOpen, onClose, server }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<LLMProvider>('gemini');
  
  // Sanitize server name for CLI/code usage
  const safeName = server.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  const codeSnippets: { [key in LLMProvider]: { title: string, lang: string, content: string } } = {
    gemini: {
        title: 'Gemini CLI',
        lang: 'bash',
        content: `gemini mcp update ${safeName} --httpUrl "${server.url}"`
    },
    claude: {
        title: 'Claude (Python SDK)',
        lang: 'python',
        content: `import anthropic

client = anthropic.Anthropic(api_key="YOUR_ANTHROPIC_API_KEY")

# This is a conceptual tool definition for Claude.
# You would implement the call to your server's endpoint
# within your tool-handling logic.
mcp_server_tool = {
    "name": "${safeName}",
    "description": "Interacts with the ${server.name} MCP Server.",
    "input_schema": {
        "type": "object",
        "properties": {
            "endpoint": {
                "type": "string",
                "description": "The API endpoint path, e.g., '/users'."
            },
            "payload": {
                "type": "object",
                "description": "A JSON object for the request body."
            }
        },
        "required": ["endpoint"]
    }
}

print(f"Tool definition for Claude created for server: ${server.name}")
print(f"Target URL: ${server.url}")`
    },
    openai: {
        title: 'OpenAI (Python SDK)',
        lang: 'python',
        content: `from openai import OpenAI

client = OpenAI(api_key="YOUR_OPENAI_API_KEY")

# This is a conceptual function definition for OpenAI.
# You would implement the logic to call your server
# when this function is invoked by the model.
mcp_server_function = {
    "type": "function",
    "function": {
        "name": "${safeName}_handler",
        "description": "Calls the ${server.name} MCP Server.",
        "parameters": {
            "type": "object",
            "properties": {
                "endpoint": {
                    "type": "string",
                    "description": "The API endpoint path, e.g., '/files'."
                },
                "payload": {
                    "type": "object",
                    "description": "A JSON object for the request body."
                }
            },
            "required": ["endpoint"]
        }
    }
}

print(f"Function definition for OpenAI created for server: ${server.name}")
print(f"Target URL: ${server.url}")`
    },
    curl: {
        title: 'cURL',
        lang: 'bash',
        content: `# Example: Ping the server's health endpoint (assuming it exists)
curl -X GET "${server.url}/health" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"`
    }
  };
  
  const currentSnippet = codeSnippets[activeTab];

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(currentSnippet.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [currentSnippet]);

  const handleTabChange = (provider: LLMProvider) => {
    setActiveTab(provider);
    setCopied(false); // Reset copied state when tab changes
  }

  if (!isOpen) return null;

  return (
     <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
        <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl p-6 border border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-100">Promote to LLM</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-3xl leading-none">&times;</button>
            </div>
            <div>
                <p className="text-slate-400 mb-4">
                    Select a provider to get the appropriate command or code snippet to connect <span className="font-bold text-slate-200">{server.name}</span>.
                </p>
                
                <div className="flex border-b border-slate-700 mb-4">
                    <TabButton name="Gemini" provider="gemini" activeTab={activeTab} onClick={handleTabChange} />
                    <TabButton name="Claude" provider="claude" activeTab={activeTab} onClick={handleTabChange} />
                    <TabButton name="OpenAI" provider="openai" activeTab={activeTab} onClick={handleTabChange} />
                    <TabButton name="cURL" provider="curl" activeTab={activeTab} onClick={handleTabChange} />
                </div>

                <div className="bg-slate-900 rounded-md p-4 relative">
                    <pre className="text-cyan-300 text-sm whitespace-pre-wrap break-all">
                        <code>{currentSnippet.content}</code>
                    </pre>
                    <button
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-300 transition-colors"
                        title={copied ? "Copied!" : "Copy to clipboard"}
                    >
                        {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
                    </button>
                </div>
                 <div className="mt-6 flex justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors shadow-lg shadow-cyan-600/20">
                        Done
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default PromoteServerModal;