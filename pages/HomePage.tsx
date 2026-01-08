import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Zap, Shield } from 'lucide-react';
import { Button } from '../components/Button';
import { ROUTES } from '../constants';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16 sm:py-24">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Transform Bangla Handwriting into <br/>
          <span className="text-brand-600">Digital Text Instantly</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          SEBON uses advanced Gemini AI to recognize complex Bangla handwriting with high accuracy. 
          Digitize your notes, scripts, and documents in seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate(ROUTES.NEW_OCR)} 
            className="h-12 text-lg px-8"
          >
            Start Scanning
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="h-12 text-lg px-8"
          >
            View Library
          </Button>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-8 py-16 border-t border-slate-200">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Instant OCR</h3>
          <p className="text-slate-600">
            Powered by Gemini 2.0 Flash, experience lightning-fast processing of handwritten documents.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Smart Editor</h3>
          <p className="text-slate-600">
            Side-by-side view with a rich text editor designed for easy correction and formatting of Bangla text.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Local Privacy</h3>
          <p className="text-slate-600">
            Your documents are stored locally in your browser. We prioritize data privacy and security.
          </p>
        </div>
      </div>
    </div>
  );
};
