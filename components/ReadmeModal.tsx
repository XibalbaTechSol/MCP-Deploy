import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ReadmeModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoUrl: string;
  readmeUrl: string;
}

const ReadmeModal: React.FC<ReadmeModalProps> = ({ isOpen, onClose, repoUrl, readmeUrl }) => {
  const [readmeContent, setReadmeContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      setReadmeContent('');
      fetch(readmeUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch README (status: ${response.status})`);
          }
          return response.text();
        })
        .then(text => {
          setReadmeContent(text);
        })
        .catch((err: any) => {
          console.error(err);
          setError(`Could not load README: ${err.message}.`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, readmeUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] transition-opacity" onClick={onClose}>
        <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl h-[80vh] flex flex-col p-6 border border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-2xl font-bold text-slate-100">README</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-3xl leading-none">&times;</button>
            </div>
            <div className="bg-slate-900 rounded-md p-4 overflow-y-auto flex-grow prose-sm">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                       <div className="w-12 h-12 border-4 border-cyan-500 border-dashed rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-400">
                      <p>{error}</p>
                      <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline mt-2 inline-block">View on GitHub</a>
                    </div>
                ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4 pb-2 border-b border-slate-600" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3 mt-6 pb-2 border-b border-slate-700" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2 mt-4" {...props} />,
                        p: ({node, ...props}) => <p className="mb-4 leading-relaxed" {...props} />,
                        a: ({node, ...props}) => <a className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="pl-2" {...props} />,
                        code: ({node, inline, className, children, ...props}) => {
                          return !inline ? (
                            <pre className="bg-slate-950 p-3 rounded-md overflow-x-auto my-4 text-sm">
                              <code className={className} {...props}>
                                {children}
                              </code>
                            </pre>
                          ) : (
                            <code className="bg-slate-700 text-amber-300 rounded-md px-1.5 py-0.5 font-mono text-sm" {...props}>
                              {children}
                            </code>
                          )
                        },
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-600 pl-4 italic text-slate-400 my-4" {...props} />,
                        hr: ({node, ...props}) => <hr className="border-slate-700 my-6" {...props} />,
                        table: ({node, ...props}) => <table className="w-full my-4 border-collapse text-sm" {...props} />,
                        thead: ({node, ...props}) => <thead className="border-b-2 border-slate-600" {...props} />,
                        th: ({node, ...props}) => <th className="px-4 py-2 text-left font-semibold" {...props} />,
                        tr: ({node, ...props}) => <tr className="border-t border-slate-700 hover:bg-slate-800/50" {...props} />,
                        td: ({node, ...props}) => <td className="px-4 py-2" {...props} />,
                      }}
                    >
                        {readmeContent}
                    </ReactMarkdown>
                )}
            </div>
             <div className="mt-6 flex justify-end flex-shrink-0 space-x-3">
                <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">
                  View on GitHub
                </a>
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors shadow-lg shadow-cyan-600/20">
                    Close
                </button>
            </div>
        </div>
    </div>
  );
};

export default ReadmeModal;