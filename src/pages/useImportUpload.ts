import { useNavigate } from 'react-router-dom';
import { useLayout } from '../context/LayoutContext';
import { useProject } from '../context/ProjectContext';

// Shared by ImportPage's tool panel and ImportCanvasOverlay's upload
// dropzone, so file selection behaves identically no matter which UI
// triggered it.
export const useImportUpload = () => {
  const navigate = useNavigate();
  const { setMedia, importSrt, transcribe, transcribeStatus, mediaFile } = useProject();
  const { setIsTranscriptEditorOpen } = useLayout();
  const isTranscribing = transcribeStatus === 'uploading';

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

  const handleTranscribe = async () => {
    if (!mediaFile || isTranscribing) return;
    try {
      await transcribe(mediaFile);
      navigate('/style');
      setIsTranscriptEditorOpen(true);
    } catch {
      // transcribeError is already surfaced in the panel below
    }
  };

  const handleContinueWithoutCaptions = () => {
    navigate('/style');
  };

  return {
    handleFileSelect,
    handleSrtUpload,
    handleTranscribe,
    handleContinueWithoutCaptions,
    isTranscribing,
  };
};
