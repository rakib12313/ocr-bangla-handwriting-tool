import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocuments } from '../context/DocumentContext';
import { Button } from '../components/Button';
import { ArrowLeft, Save, Trash2, FileText, PenTool } from 'lucide-react';
import { ROUTES } from '../constants';
import { TextEditor } from '../components/TextEditor';
import { CanvasEditor } from '../components/CanvasEditor';

type Tab = 'text' | 'canvas';

export const DocumentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDocument, updateDocumentText, updateDocumentCanvas, deleteDocument } = useDocuments();
  const [doc, setDoc] = useState(getDocument(id || ''));
  const [activeTab, setActiveTab] = useState<Tab>('text');
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for edits
  const [currentText, setCurrentText] = useState('');
  const [currentCanvas, setCurrentCanvas] = useState('[]');

  useEffect(() => {
    if (id) {
      const foundDoc = getDocument(id);
      if (foundDoc) {
        setDoc(foundDoc);
        setCurrentText(foundDoc.extractedText);
        setCurrentCanvas(foundDoc.canvasData || '[]');
      } else {
        navigate(ROUTES.DASHBOARD);
      }
    }
  }, [id, getDocument, navigate]);

  const handleSave = () => {
    if (doc && id) {
      setIsSaving(true);
      updateDocumentText(id, currentText);
      updateDocumentCanvas(id, currentCanvas);
      setTimeout(() => setIsSaving(false), 600);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      if (id) {
        deleteDocument(id);
        navigate(ROUTES.DASHBOARD);
      }
    }
  };

  if (!doc) return null;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-xs">{doc.title}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Scanned on {new Date(doc.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button variant="danger" onClick={handleDelete} className="bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-200 border border-red-100 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 !px-3">
             <Trash2 size={18} />
          </Button>
          <Button onClick={handleSave} isLoading={isSaving} icon={<Save size={18} />}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Workspace Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        
        {/* Left: Source Image */}
        <div className="bg-slate-900 rounded-xl overflow-hidden flex flex-col shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Source Image</span>
          </div>
          <div className="flex-1 relative overflow-auto flex items-center justify-center p-4 bg-slate-900/50">
             <img 
               src={doc.originalImageUrl} 
               alt="Source" 
               className="max-w-full max-h-full object-contain shadow-lg"
             />
          </div>
        </div>

        {/* Right: Tabbed Editor */}
        <div className="bg-white dark:bg-slate-800 rounded-xl flex flex-col shadow-sm border border-slate-200 dark:border-slate-700 h-full overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 flex items-center justify-center py-3 text-sm font-medium transition-colors ${
                activeTab === 'text' 
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 border-t-2 border-brand-600 dark:border-brand-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText size={16} className="mr-2" />
              Extracted Text
            </button>
            <button
              onClick={() => setActiveTab('canvas')}
              className={`flex-1 flex items-center justify-center py-3 text-sm font-medium transition-colors ${
                activeTab === 'canvas' 
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 border-t-2 border-brand-600 dark:border-brand-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <PenTool size={16} className="mr-2" />
              Diagrams & Notes
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 relative min-h-0">
             {activeTab === 'text' ? (
               <TextEditor 
                 initialText={currentText} 
                 onChange={setCurrentText} 
               />
             ) : (
               <CanvasEditor 
                 initialData={currentCanvas}
                 onSave={setCurrentCanvas}
               />
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
