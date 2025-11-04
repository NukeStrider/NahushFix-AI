import React, { useState } from 'react';
import { ImageFile, Tool, ToolCategory } from '../types';
import { editImageWithGemini } from '../services/geminiService';
import BeforeAfterSlider from './BeforeAfterSlider';
import Loader from './Loader';
import {
  SparklesIcon,
  UndoIcon,
  RedoIcon,
  DownloadIcon,
  SunIcon,
  FilterIcon,
  WandIcon,
  SharpenIcon,
  DehazeIcon,
} from './icons';

interface EditorProps {
  image: ImageFile;
  setImageFile: (image: ImageFile) => void;
  onBack: () => void;
}

const tools: Tool[] = [
  { id: 'auto-enhance', name: 'Auto Enhance', prompt: 'Professionally enhance this photo: improve lighting, colors, sharpness, and dynamic range. Make the result look natural and high-quality.', icon: SparklesIcon, category: 'Enhance' },
  { id: 'fix-lighting', name: 'Fix Lighting', prompt: 'Correct the lighting in this photo. Brighten the shadows and recover highlights to create a balanced exposure.', icon: SunIcon, category: 'Enhance' },
  { id: 'hdr-effect', name: 'HDR Effect', prompt: 'Apply a high-dynamic-range (HDR) effect to this photo, bringing out details in both the shadows and highlights for a dramatic and vivid look.', icon: SunIcon, category: 'Enhance' },
  { id: 'sharpen', name: 'Sharpen', prompt: 'Apply a subtle but effective sharpening to the details in this image. Make it look crisper without adding artifacts.', icon: SharpenIcon, category: 'Enhance' },
  { id: 'dehaze', name: 'Dehaze', prompt: 'Reduce the atmospheric haze or fog in this photo, increasing contrast and color saturation for a clearer image.', icon: DehazeIcon, category: 'Enhance' },
  { id: 'vintage-film', name: 'Vintage Film', prompt: 'Apply a warm, faded, vintage film look to this photo, with soft grain.', icon: FilterIcon, category: 'Filters' },
  { id: 'cinematic', name: 'Cinematic', prompt: 'Apply a cinematic color grade to this photo, with teal and orange tones for a dramatic feel.', icon: FilterIcon, category: 'Filters' },
  { id: 'cyberpunk', name: 'Cyberpunk', prompt: 'Give this photo a cyberpunk aesthetic with neon pinks, blues, and purples, and a gritty, high-contrast feel.', icon: FilterIcon, category: 'Filters' },
  { id: 'b-and-w', name: 'Black & White', prompt: 'Convert this photo to a high-contrast, dramatic black and white image.', icon: FilterIcon, category: 'Filters' },
  { id: 'smooth-skin', name: 'Smooth Skin', prompt: 'Identify any faces in this photo and apply subtle skin smoothing to reduce blemishes and wrinkles, while preserving natural skin texture.', icon: WandIcon, category: 'Cleanup' },
  { id: 'remove-blemishes', name: 'Remove Blemishes', prompt: 'Intelligently identify and remove small blemishes, spots, and imperfections from any skin in the photo, while keeping the natural texture.', icon: WandIcon, category: 'Cleanup' },
];

const categories: { name: ToolCategory; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { name: 'Enhance', icon: SunIcon },
    { name: 'Filters', icon: FilterIcon },
    { name: 'Cleanup', icon: WandIcon },
]

type EditorMode = 'auto' | 'prompt';

const Editor: React.FC<EditorProps> = ({ image, setImageFile, onBack }) => {
  const [historyIndex, setHistoryIndex] = useState(image.history.length - 1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('Enhance');
  const [mode, setMode] = useState<EditorMode>('auto');
  const [prompt, setPrompt] = useState('');

  const processEdit = async (editFunction: () => Promise<string>) => {
    setIsLoading(true);
    setError(null);
    try {
      const resultUrl = await editFunction();
      const newHistory = [...image.history.slice(0, historyIndex + 1), resultUrl];
      setImageFile({ ...image, history: newHistory });
      setHistoryIndex(newHistory.length - 1);
    } catch (e) {
      console.error("Edit failed:", e);
      const message = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Edit failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyTool = async (tool: Tool) => {
    const currentImageSource = image.history[historyIndex];
    processEdit(() => editImageWithGemini(currentImageSource, tool.prompt));
  };

  const handleApplyPrompt = async () => {
    if (!prompt.trim()) return;
    const currentImageSource = image.history[historyIndex];
    processEdit(() => editImageWithGemini(currentImageSource, prompt));
  };


  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < image.history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleExport = () => {
    const link = document.createElement('a');
    link.href = image.history[historyIndex];
    link.download = `nahushfix-edit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentImage = image.history[historyIndex];
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < image.history.length - 1;

  return (
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6 flex flex-col h-full fade-in">
      {isLoading && <Loader message="Nahush AI is applying your edit..." />}
      
      <header className="w-full flex justify-between items-center mb-4 flex-shrink-0">
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm md:text-base"
        >
          &larr; Back to Gallery
        </button>
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={handleUndo} disabled={!canUndo || isLoading} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><UndoIcon className="w-5 h-5 md:w-6 md:h-6"/></button>
          <button onClick={handleRedo} disabled={!canRedo || isLoading} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><RedoIcon className="w-5 h-5 md:w-6 md:h-6"/></button>
        </div>
        <button
          onClick={handleExport}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm md:text-base"
        >
          <DownloadIcon className="w-5 h-5"/> Export
        </button>
      </header>

      <div className="flex-grow flex flex-col md:flex-row gap-4 md:gap-6 min-h-0">
        <main
          className="flex-grow bg-black/20 rounded-lg flex items-center justify-center p-2 relative"
        >
          <div className="w-full h-full" style={{ aspectRatio: image.aspectRatio }}>
             {historyIndex > 0 ? (
                <BeforeAfterSlider before={image.history[0]} after={currentImage} />
              ) : (
                <img src={currentImage} alt="Current" className="max-w-full max-h-full w-full h-full object-contain rounded-md" />
              )}
          </div>
        </main>
        
        <aside className="w-full md:w-80 lg:w-96 bg-gray-800/50 p-4 rounded-lg flex flex-col flex-shrink-0">
            <div className="flex justify-center border-b border-white/10 mb-4 flex-shrink-0">
                <button onClick={() => setMode('auto')} className={`px-4 py-2 text-sm font-medium transition-all duration-300 w-full ${mode === 'auto' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/60 hover:text-white'}`}>
                    Auto Boost
                </button>
                <button onClick={() => setMode('prompt')} className={`px-4 py-2 text-sm font-medium transition-all duration-300 w-full ${mode === 'prompt' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/60 hover:text-white'}`}>
                    Prompt Boost
                </button>
            </div>
            {error && <p className="text-red-400 text-center my-2 text-sm flex-shrink-0">{error}</p>}
            
            {mode === 'auto' ? (
              <div className="flex flex-col flex-grow min-h-0">
                <div className="flex justify-around border-b border-white/10 mb-4 flex-shrink-0">
                    {categories.map(cat => (
                        <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`px-3 py-2 text-sm font-medium transition-all duration-300 ${activeCategory === cat.name ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/60 hover:text-white'}`}>
                            {cat.name}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-3 overflow-y-auto">
                    {tools.filter(t => t.category === activeCategory).map(tool => (
                        <button 
                            key={tool.id}
                            onClick={() => handleApplyTool(tool)}
                            disabled={isLoading}
                            className="p-2 bg-gray-900/70 border-2 border-transparent hover:border-cyan-400 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed aspect-square"
                        >
                            <tool.icon className="w-7 h-7 sm:w-8 sm:h-8"/>
                            <span className="text-[10px] sm:text-xs text-center">{tool.name}</span>
                        </button>
                    ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col flex-grow">
                 <h2 className="text-xl font-semibold text-white mb-2 text-center">Prompt Boost</h2>
                 <p className="text-sm text-white/60 mb-4 text-center">Describe the change you want to see.</p>
                 <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full flex-grow p-3 bg-gray-900/70 border-2 border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors resize-none mb-4"
                    placeholder="e.g., 'make the sky a dramatic purple sunset'"
                    rows={5}
                    disabled={isLoading}
                 />
                 <button
                    onClick={handleApplyPrompt}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <SparklesIcon className="w-5 h-5"/> Apply Prompt
                 </button>
              </div>
            )}
        </aside>
      </div>
    </div>
  );
};

export default Editor;