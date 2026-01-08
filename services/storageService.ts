import { DocumentData } from "../types";

const STORAGE_KEY = 'sebon_documents_v1';

export const saveDocuments = (docs: DocumentData[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch (e) {
    console.error("Failed to save documents to local storage", e);
  }
};

export const loadDocuments = (): DocumentData[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load documents", e);
    return [];
  }
};
