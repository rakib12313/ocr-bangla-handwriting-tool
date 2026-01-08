import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, Undo, Redo, Copy, Check } from 'lucide-react';
import { useHistory } from '../hooks/useHistory';

interface TextEditorProps {
  initialText: string;
  onChange: (text: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ initialText, onChange }) => {
  const { state: text, set: setText, undo, redo, canUndo, canRedo, reset } = useHistory(initialText);
  const [fontSize, setFontSize] = useState(18);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (initialText && initialText !== text) {
       reset(initialText);
    }
  }, [initialText, reset]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onChange(newText);
  };

  const handleCopy = () => {
    // Normalize newlines for Windows/Word compatibility to prevent double spacing
    // Replace double newlines that look like single newlines in textarea with actual single newlines if needed,
    // or just ensure standard \n usage.
    // Here we treat \r\n as \n to be safe, and ensure we don't send weird formatting.
    const normalizedText = text.replace(/\r\n/g, '\n');
    navigator.clipboard.writeText(normalizedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-b-xl overflow-hidden transition-colors">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-1">
          <button 
            onClick={undo} 
            disabled={!canUndo}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300"
            title="Undo"
          >
            <Undo size={16} />
          </button>
          <button 
            onClick={redo} 
            disabled={!canRedo}
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-300"
            title="Redo"
          >
            <Redo size={16} />
          </button>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-2" />
          <button 
            onClick={() => setFontSize(Math.max(12, fontSize - 2))} 
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium min-w-[3ch] text-center">{fontSize}</span>
          <button 
            onClick={() => setFontSize(Math.min(32, fontSize + 2))} 
            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>
        
        <button 
          onClick={handleCopy}
          className="flex items-center text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 px-2 py-1 rounded hover:bg-brand-50 dark:hover:bg-slate-700 transition-colors"
        >
          {isCopied ? <Check size={14} className="mr-1.5" /> : <Copy size={14} className="mr-1.5" />}
          {isCopied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <textarea
        value={text}
        onChange={handleTextChange}
        style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}
        className="flex-1 w-full p-6 resize-none focus:outline-none focus:ring-0 font-bengali text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
        spellCheck={false}
        placeholder="Start typing or editing..."
      />
    </div>
  );
};
