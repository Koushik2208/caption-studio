import { useNavigate } from 'react-router-dom';
import { useLayout } from '../context/LayoutContext';
import { useProject } from '../context/ProjectContext';

// Shared by ImportPage's tool panel and ImportCanvasOverlay's upload
// dropzone, so file selection behaves identically no matter which UI
// triggered it.
export const useImportUpload = () => {
  const navigate = useNavigate();
  const { setMedia, importSrt } = useProject();
  const { setIsTranscriptEditorOpen } = useLayout();

  const handleFileSelect = (file: File) => {
    setMedia(file);
  };

  const handleSrtUpload = async (file: File) => {
    try {
      await importSrt(file);
      navigate('/style');
      setIsTranscriptEditorOpen(true);
    } catch {
      // error is logged or handled in context
    }
  };

  const handleContinueWithoutCaptions = () => {
    navigate('/style');
  };

  return {
    handleFileSelect,
    handleSrtUpload,
    handleContinueWithoutCaptions,
  };
};

