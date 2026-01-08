import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDocuments } from '../context/DocumentContext';
import { ROUTES } from '../constants';
import { FileText, Plus, Calendar, ChevronRight, PenTool } from 'lucide-react';
import { Button } from '../components/Button';

export const DashboardPage: React.FC = () => {
  const { documents } = useDocuments();
  const navigate = useNavigate();

  if (documents.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <FileText className="w-12 h-12 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No documents yet</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Your scanned documents and drawings will appear here.
        </p>
        <div className="flex justify-center gap-3">
            <Button onClick={() => navigate(ROUTES.NEW_OCR)} icon={<Plus size={20} />}>
            New Scan
            </Button>
            <Button variant="outline" onClick={() => navigate(ROUTES.WHITEBOARD)} icon={<PenTool size={20} />}>
            New Diagram
            </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Your Library</h2>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(ROUTES.WHITEBOARD)} icon={<PenTool size={18} />}>
                New Diagram
            </Button>
            <Button onClick={() => navigate(ROUTES.NEW_OCR)} icon={<Plus size={18} />}>
                New Scan
            </Button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {documents.map((doc) => (
            <Link 
              key={doc.id} 
              to={`/document/${doc.id}`}
              className="block hover:bg-slate-50 transition-colors"
            >
              <div className="p-5 flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 flex items-center justify-center">
                  {doc.originalImageUrl ? (
                     <img src={doc.originalImageUrl} alt="" className="w-full h-full object-cover opacity-80" />
                  ) : (
                     <PenTool className="text-slate-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-slate-900 truncate mb-1">{doc.title}</h3>
                  <p className="text-sm text-slate-500 font-bengali truncate">
                    {doc.extractedText ? doc.extractedText.substring(0, 100) : "Diagram/Whiteboard File"}
                  </p>
                </div>

                <div className="hidden sm:flex flex-col items-end gap-1 text-right">
                  <div className="flex items-center text-xs text-slate-400">
                    <Calendar size={12} className="mr-1" />
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </div>
                  {doc.originalImageUrl ? (
                    <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                        OCR Scan
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        Diagram
                    </span>
                  )}
                </div>

                <ChevronRight className="text-slate-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
