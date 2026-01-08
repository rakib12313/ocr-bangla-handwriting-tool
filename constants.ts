// Models
export const OCR_MODEL = 'gemini-3-flash-preview';

// Prompts
export const BANGLA_OCR_SYSTEM_PROMPT = `
You are a highly accurate Bangla Handwriting OCR (Optical Character Recognition) engine.
Your task is to transcribe the handwriting in the provided image into digital Bangla text strictly.
1. Return ONLY the transcribed text.
2. Do not add any introductory or concluding remarks (e.g., "Here is the text").
3. Preserve the original formatting (line breaks) as much as possible.
4. If a word is illegible, insert "[???]" in its place.
5. Ensure high accuracy for distinct Bangla conjuncts (Juktakkhor).
`;

// Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  NEW_OCR: '/new',
  WHITEBOARD: '/whiteboard',
  DOCUMENT: '/document/:id',
};
