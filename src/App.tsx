import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LayoutProvider } from './context/LayoutContext';
import { ProjectProvider } from './context/ProjectContext';
import { AppLayout } from './components/layout/AppLayout';
import { ToolLayout } from './components/layout/ToolLayout';
import { WelcomePage } from './pages/WelcomePage';
import { ImportPage } from './pages/ImportPage';
import { StylePage } from './pages/StylePage';
import { ExportPage } from './pages/ExportPage';
import { SettingsModal } from './components/common/SettingsModal';
import { TranscriptEditorModal } from './transcript/TranscriptEditorModal';
import { CodeEditorModal } from './motion/CodeEditorModal';

function App() {
  return (
    <LayoutProvider>
      <ProjectProvider>
        <Router>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route element={<AppLayout />}>
              {/* ToolLayout owns the single PreviewPlayer instance so it stays
                  mounted (and playback keeps running) while navigating between
                  these tabs - only the tool panel below swaps per route. */}
              <Route element={<ToolLayout />}>
                <Route path="import" element={<ImportPage />} />
                <Route path="style" element={<StylePage />} />
                <Route path="export" element={<ExportPage />} />
              </Route>
              {/* Fallback route indicating under construction */}
              <Route
                path="*"
                element={
                  <div className="flex flex-col items-center justify-center h-full bg-surface-container text-on-surface">
                    <span className="material-symbols-outlined text-6xl text-primary mb-4">construction</span>
                    <h1 className="text-headline-lg font-bold mb-2">Page Under Construction</h1>
                    <p className="text-body-md text-on-surface-variant">
                      This sub-feature is part of our upcoming releases. Stay tuned!
                    </p>
                  </div>
                }
              />
            </Route>
          </Routes>
          <SettingsModal />
          <TranscriptEditorModal />
          <CodeEditorModal />
        </Router>
      </ProjectProvider>
    </LayoutProvider>
  );
}

export default App;
