import React, { useState, useEffect } from 'react';
import { LaunchSection } from '../types';
import { 
  LayoutDashboard, 
  Filter, 
  PenTool, 
  Image as ImageIcon, 
  Megaphone, 
  CheckSquare, 
  FolderOpen, 
  BarChart2, 
  ChevronRight,
  Download
} from 'lucide-react';

interface LaunchResultProps {
  rawText: string;
}

// Helper icons mapping based on section index or keywords
const getIconForSection = (title: string, index: number) => {
  if (title.includes('VISÃO GERAL')) return <LayoutDashboard size={18} />;
  if (title.includes('FUNIL')) return <Filter size={18} />;
  if (title.includes('COPY')) return <PenTool size={18} />;
  if (title.includes('CRIATIVOS')) return <ImageIcon size={18} />;
  if (title.includes('TRÁFEGO')) return <Megaphone size={18} />;
  if (title.includes('OPERACIONAL')) return <CheckSquare size={18} />;
  if (title.includes('PASTAS')) return <FolderOpen size={18} />;
  if (title.includes('MÉTRICAS')) return <BarChart2 size={18} />;
  return <ChevronRight size={18} />;
};

const LaunchResult: React.FC<LaunchResultProps> = ({ rawText }) => {
  const [sections, setSections] = useState<LaunchSection[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    // Parse the raw text based on the specific markers requested in the system prompt
    // The prompt asks for output starting with "1️⃣", "2️⃣", etc.
    
    // We split by a regex looking for the numeric emojis and a title line
    const regex = /(\d️⃣ .+)(?:\n|$)/g;
    
    // Find all matches for headers
    const matches = [...rawText.matchAll(regex)];
    const parsedSections: LaunchSection[] = [];

    if (matches.length > 0) {
      matches.forEach((match, index) => {
        const title = match[1].trim(); // e.g., "1️⃣ VISÃO GERAL DO LANÇAMENTO"
        const start = match.index! + match[0].length;
        const end = matches[index + 1] ? matches[index + 1].index! : rawText.length;
        const content = rawText.slice(start, end).trim();

        parsedSections.push({
          id: `sec-${index}`,
          title,
          content,
          icon: 'default' 
        });
      });
      setSections(parsedSections);
    } else {
        // Fallback if formatting isn't perfect
        setSections([{
            id: 'full-text',
            title: 'Estratégia Completa',
            content: rawText,
            icon: 'default'
        }]);
    }
  }, [rawText]);

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([rawText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "launch-strategy.txt";
    document.body.appendChild(element);
    element.click();
  };

  if (!sections.length) return null;

  return (
    <div className="flex flex-col h-full bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900/50 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">Estratégia Gerada</h3>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-full"
        >
          <Download size={14} />
          Exportar TXT
        </button>
      </div>

      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-900/30 border-r border-slate-700 overflow-y-auto custom-scrollbar">
          <nav className="flex flex-col p-2 space-y-1">
            {sections.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-3 w-full px-3 py-3 text-left text-sm rounded-lg transition-all ${
                  activeTab === idx
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className={activeTab === idx ? 'text-indigo-200' : 'text-slate-500'}>
                  {getIconForSection(section.title, idx)}
                </span>
                <span className="font-medium truncate">{section.title.replace(/^\d️⃣\s*/, '')}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/20 custom-scrollbar">
          <div className="max-w-3xl mx-auto animate-fadeIn">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-4">
              {sections[activeTab]?.title}
            </h2>
            <div className="prose prose-invert prose-slate max-w-none">
                {/* Simple Markdown-like rendering for text output */}
                <div className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed text-sm md:text-base">
                    {sections[activeTab]?.content}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchResult;
