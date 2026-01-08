import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, Zap, Shield, Sparkles, PenTool, LayoutTemplate } from 'lucide-react';
import { Button } from '../components/Button';
import { ROUTES } from '../constants';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center py-20 sm:py-32 space-y-8 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-brand-200 bg-brand-50 text-brand-700 text-sm font-medium mb-4 animate-slide-up">
            <Sparkles size={16} className="mr-2" />
            <span>Powered by Gemini 2.0 Flash AI</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight animate-slide-up" style={{animationDelay: '0.1s'}}>
            Digitize Bangla <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">
              Handwriting Instantly
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
            Transform handwritten notes, scripts, and documents into editable digital text. 
            Experience the next generation of OCR Workspace designed for Bangla.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{animationDelay: '0.3s'}}>
            <Button 
              onClick={() => navigate(ROUTES.NEW_OCR)} 
              className="h-14 text-lg px-8 rounded-full shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all duration-300 hover:-translate-y-1"
            >
              Start Scanning
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(ROUTES.DASHBOARD)}
              className="h-14 text-lg px-8 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300"
            >
              View Library
            </Button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 py-16 animate-slide-up" style={{animationDelay: '0.4s'}}>
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-white" />}
            color="bg-gradient-to-br from-amber-400 to-orange-500"
            title="Instant OCR"
            description="Experience lightning-fast processing with Gemini AI, preserving line breaks and formatting."
          />
          <FeatureCard 
            icon={<LayoutTemplate className="w-6 h-6 text-white" />}
            color="bg-gradient-to-br from-blue-400 to-brand-600"
            title="Smart Workspace"
            description="Edit text side-by-side with your original image using our specialized Bangla editor."
          />
          <FeatureCard 
            icon={<PenTool className="w-6 h-6 text-white" />}
            color="bg-gradient-to-br from-emerald-400 to-teal-600"
            title="Interactive Canvas"
            description="Draw diagrams, flowcharts, and add logic gates directly alongside your notes."
          />
        </div>

        {/* Stats / Trust Section */}
        <div className="py-16 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">Trusted Privacy & Security</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-70">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-slate-400" />
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Local Storage</span>
                </div>
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-slate-400" />
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Gemini AI Engine</span>
                </div>
                 <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Export Ready</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, color: string, title: string, description: string }> = ({ icon, color, title, description }) => {
  return (
    <div className="group bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
};
