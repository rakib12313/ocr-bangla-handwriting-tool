import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DocumentProvider } from './context/DocumentContext';
import { ThemeProvider } from './context/ThemeContext';
import { ModelProvider } from './context/ModelContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { NewScanPage } from './pages/NewScanPage';
import { DocumentPage } from './pages/DocumentPage';
import { WhiteboardPage } from './pages/WhiteboardPage';
import { ROUTES } from './constants';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ModelProvider>
        <DocumentProvider>
          <HashRouter>
            <Layout>
              <Routes>
                <Route path={ROUTES.HOME} element={<HomePage />} />
                <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                <Route path={ROUTES.NEW_OCR} element={<NewScanPage />} />
                <Route path={ROUTES.WHITEBOARD} element={<WhiteboardPage />} />
                <Route path="/document/:id" element={<DocumentPage />} />
                <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
              </Routes>
            </Layout>
          </HashRouter>
        </DocumentProvider>
      </ModelProvider>
    </ThemeProvider>
  );
};

export default App;
