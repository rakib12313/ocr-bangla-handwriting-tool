import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../components/FileUpload';
import { Button } from '../components/Button';
import { performOCR } from '../services/geminiService';
import { useDocuments } from '../context/DocumentContext';
import { useModel } from '../context/ModelContext';
import { OCRStatus } from '../types';
import { ROUTES } from '../constants';
import { Sparkles, AlertCircle } from 'lucide-react';

const CLOUDINARY_CLOUD_NAME = 'da2sbo8ov';
const CLOUDINARY_UPLOAD_PRESET = 'OCR handwriting bangla';

export const NewScanPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addDocument } = useDocuments();
  const { model } = useModel();
  const navigate = useNavigate();

  const handleProcess = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // 1. Convert file to base64 for OCR processing
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        let imageUrl = base64String;

        // 2. Attempt Cloudinary Upload
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            
            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (uploadRes.ok) {
                const data = await uploadRes.json();
                imageUrl = data.secure_url;
            } else {
                console.warn('Cloudinary upload failed, falling back to local base64.');
            }
        } catch (uploadErr) {
            console.warn('Cloudinary upload error:', uploadErr);
        }

        // 3. Perform OCR with selected model
        try {
          const result = await performOCR(base64Data, file.type, model);
          
          const newDoc = {
            id: crypto.randomUUID(),
            title: file.name.split('.')[0] || 'Untitled Scan',
            originalImageUrl: imageUrl, 
            extractedText: result.text,
            createdAt: Date.now(),
            status: OCRStatus.COMPLETED,
            confidence: result.confidence
          };

          addDocument(newDoc);
          navigate(`/document/${newDoc.id}`);
        } catch (apiError: any) {
          setError(apiError.message || "Failed to process image with AI service.");
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setError("Failed to read file.");
        setIsLoading(false);
      };

    } catch (e: any) {
      setError(e.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">New Document Scan</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Upload a clear image of Bangla handwriting to begin.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
        <FileUpload 
          selectedFile={file} 
          onFileSelect={setFile} 
          onClear={() => { setFile(null); setError(null); }} 
        />
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg flex items-start gap-3 text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 italic">
             Using model: <span className="font-semibold text-brand-600">{model}</span>
          </p>
          <Button 
            disabled={!file} 
            isLoading={isLoading} 
            onClick={handleProcess}
            className="w-full sm:w-auto"
            icon={<Sparkles size={18} />}
          >
            {isLoading ? 'Processing...' : 'Extract Text'}
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-xl p-5">
        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Tips for best results:</h4>
        <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>Ensure good lighting and minimal shadows.</li>
          <li>Keep the paper flat and text aligned horizontally.</li>
          <li>High contrast (dark ink on white paper) works best.</li>
          <li>Capture only the text area, crop out background clutter.</li>
        </ul>
      </div>
    </div>
  );
};
