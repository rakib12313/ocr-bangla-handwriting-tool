import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DocumentData, OCRStatus } from '../types';
import { loadDocuments, saveDocuments } from '../services/storageService';

interface DocumentContextType {
  documents: DocumentData[];
  addDocument: (doc: DocumentData) => void;
  updateDocumentText: (id: string, text: string) => void;
  updateDocumentCanvas: (id: string, canvasData: string) => void;
  deleteDocument: (id: string) => void;
  getDocument: (id: string) => DocumentData | undefined;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);

  useEffect(() => {
    const loaded = loadDocuments();
    setDocuments(loaded.sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  useEffect(() => {
    if (documents.length > 0) {
      saveDocuments(documents);
    }
  }, [documents]);

  const addDocument = useCallback((doc: DocumentData) => {
    setDocuments(prev => [doc, ...prev]);
  }, []);

  const updateDocumentText = useCallback((id: string, text: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, extractedText: text } : doc
    ));
  }, []);

  const updateDocumentCanvas = useCallback((id: string, canvasData: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, canvasData } : doc
    ));
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  }, []);

  const getDocument = useCallback((id: string) => {
    return documents.find(doc => doc.id === id);
  }, [documents]);

  return (
    <DocumentContext.Provider value={{ documents, addDocument, updateDocumentText, updateDocumentCanvas, deleteDocument, getDocument }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
