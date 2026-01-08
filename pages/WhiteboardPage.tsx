import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../context/DocumentContext';
import { CanvasEditor } from '../components/CanvasEditor';
import { Button } from '../components/Button';
import { Save, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../constants';
import { OCRStatus } from '../types';

export const WhiteboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { addDocument } = useDocuments();
  const [canvasData, setCanvasData] = useState('[]');
  const [title, setTitle] = useState('New Diagram');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    const newDoc = {
      id: crypto.randomUUID(),
      title: title || 'Untitled Diagram',
      extractedText: '', // No text for whiteboard only
      canvasData: canvasData,
      createdAt: Date.now(),
      status: OCRStatus.COMPLETED,
    };

    addDocument(newDoc);
    
    // Simulate save delay
    setTimeout(() => {
        setIsSaving(false);
        navigate(ROUTES.DASHBOARD);
    }, 600);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-7xl mx-auto">
       <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate(ROUTES.HOME)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
            <div>
                <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0 placeholder-slate-400"
                    placeholder="Enter diagram title..."
                />
                <p className="text-xs text-slate-500">
                    Standalone Drawing & Logic Board
                </p>
            </div>
          </div>
          <Button onClick={handleSave} isLoading={isSaving} icon={<Save size={18} />}>
            Save to Library
          </Button>
       </div>

       <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <CanvasEditor onSave={setCanvasData} />
       </div>
    </div>
  );
};
