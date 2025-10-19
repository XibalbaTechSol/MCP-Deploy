import React, { useState, useEffect } from 'react';
import { GithubTemplate } from '../types';
import StarIcon from './icons/StarIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import ReadmeModal from './ReadmeModal';
import { MOCK_TEMPLATES } from '../data/mockData';

interface CreateServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, template: string) => void;
}

const formatStars = (stars: number): string => {
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1)}k`;
  }
  return stars.toString();
};

// TemplateCard sub-component
const TemplateCard: React.FC<{
  template: GithubTemplate;
  isSelected: boolean;
  onSelect: (template: GithubTemplate) => void;
  onViewReadme: (template: GithubTemplate) => void;
}> = ({ template, isSelected, onSelect, onViewReadme }) => {
  const borderColor = isSelected ? 'border-cyan-500 ring-2 ring-cyan-500' : 'border-slate-600';
  return (
    <div className={`bg-slate-700/50 p-4 rounded-lg border ${borderColor} flex flex-col justify-between transition-all hover:border-cyan-400 hover:bg-slate-700`}>
      <div>
        <div className="flex justify-between items-start gap-4">
            <h4 className="font-bold text-slate-100 truncate flex-1">
                <span className="text-slate-400 font-normal">{template.owner} / </span>
                {template.name}
            </h4>
            <div className="flex items-center text-sm text-yellow-400 flex-shrink-0">
                <StarIcon className="w-4 h-4 mr-1" />
                <span>{formatStars(template.stars)}</span>
            </div>
        </div>
        <p className="text-sm text-slate-400 mt-2 line-clamp-2" title={template.description}>{template.description}</p>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
         <button 
            type="button" 
            onClick={() => onViewReadme(template)}
            className="p-2 text-slate-300 hover:text-cyan-400 text-sm flex items-center"
         >
             <BookOpenIcon className="w-4 h-4 mr-1.5"/>
             View README
        </button>
        <button 
            type="button" 
            onClick={() => onSelect(template)}
            className={`px-3 py-1.5 text-sm font-semibold text-white rounded-md transition-colors shadow-md ${isSelected ? 'bg-cyan-500 cursor-default' : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/10'}`}
        >
            {isSelected ? 'Selected' : 'Select'}
        </button>
      </div>
    </div>
  );
};


const CreateServerModal: React.FC<CreateServerModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<GithubTemplate | null>(null);
  const [templates, setTemplates] = useState<GithubTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [readmeModalState, setReadmeModalState] = useState<{isOpen: boolean; repoUrl: string; readmeUrl: string}>({isOpen: false, repoUrl: '', readmeUrl: ''});

  useEffect(() => {
    if (isOpen) {
      // Reset state for a fresh modal
      setName('');
      setSelectedTemplate(null);
      setIsSubmitting(false);
      
      const fetchTemplates = async () => {
        setIsLoading(true);
        setError(null);
        setTemplates([]);
        try {
          const [repoRes, contentsRes] = await Promise.all([
            fetch('https://api.github.com/repos/vercel/next.js'),
            fetch('https://api.github.com/repos/vercel/next.js/contents/examples')
          ]);

          if (!repoRes.ok) {
            throw new Error(`Failed to fetch repo details (status: ${repoRes.status})`);
          }
          if (!contentsRes.ok) {
            throw new Error(`Failed to fetch template list (status: ${contentsRes.status})`);
          }

          const repoData = await repoRes.json();
          const contents = await contentsRes.json();
          
          const templateDirs = contents.filter((item: any) => item.type === 'dir');

          const liveTemplates: GithubTemplate[] = templateDirs.map((dir: any) => {
            const rawName = dir.name
              .split('-')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            
            // Find matching mock template for curated description (will likely fail, using fallback)
            const mockTemplate = MOCK_TEMPLATES.find(t => t.rawName === rawName);
            const description = mockTemplate?.description || `A Next.js example project demonstrating ${rawName}.`;

            return {
              id: `gh-${dir.name}`,
              name: rawName,
              owner: repoData.owner.login,
              description,
              stars: repoData.stargazers_count,
              repoUrl: dir.html_url,
              readmeUrl: `https://raw.githubusercontent.com/vercel/next.js/canary/examples/${dir.name}/README.md`,
              rawName: rawName,
            };
          });

          setTemplates(liveTemplates);

        } catch (err: any) {
          console.error(err);
          setError(`Could not load templates from GitHub. Failed to fetch repo details: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      };

      fetchTemplates();
    }
  }, [isOpen]);


  const handleTemplateSelection = (template: GithubTemplate) => {
    setSelectedTemplate(template);
    // Pre-fill the server name based on the selected template
    setName(`${template.rawName.toLowerCase().replace(/\s/g, '-')}-server`);
  };
  
  const handleViewReadme = (template: GithubTemplate) => {
    setReadmeModalState({isOpen: true, repoUrl: template.repoUrl, readmeUrl: template.readmeUrl});
  }

  const handleCloseReadme = () => {
    setReadmeModalState({isOpen: false, repoUrl: '', readmeUrl: ''});
  }
  
  const handleSubmit = () => {
    if (!name.trim() || !selectedTemplate || isSubmitting) {
        return;
    }
    setIsSubmitting(true);
    onCreate(name.trim(), selectedTemplate.rawName);
    onClose();
  };


  if (!isOpen) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
        <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl p-6 border border-slate-700 h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h2 className="text-2xl font-bold text-slate-100">Create New MCP Server</h2>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-3xl leading-none">&times;</button>
            </div>
            <div className="mb-4 flex-shrink-0">
                <label htmlFor="server-name" className="block text-sm font-medium text-slate-400 mb-1">1. Enter a Server Name</label>
                <input
                    type="text"
                    id="server-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
                    placeholder="e.g., my-github-connector"
                    required
                />
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
                <label className="block text-sm font-medium text-slate-400 mb-2">2. Choose a Template</label>
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="w-16 h-16 border-4 border-cyan-500 border-dashed rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-full text-center">
                        <p className="text-red-400">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map(template => (
                            <TemplateCard 
                                key={template.id}
                                template={template}
                                isSelected={selectedTemplate?.id === template.id}
                                onSelect={handleTemplateSelection}
                                onViewReadme={handleViewReadme}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="mt-6 flex justify-end space-x-3 flex-shrink-0">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">
                    Cancel
                </button>
                <button 
                    type="button"
                    onClick={handleSubmit}
                    disabled={!name.trim() || !selectedTemplate || isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors shadow-lg shadow-cyan-600/20 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    {isSubmitting ? 'Creating...' : 'Create Server'}
                </button>
            </div>
        </div>
    </div>
    <ReadmeModal 
        isOpen={readmeModalState.isOpen}
        onClose={handleCloseReadme}
        repoUrl={readmeModalState.repoUrl}
        readmeUrl={readmeModalState.readmeUrl}
    />
    </>
  );
};

export default CreateServerModal;