import { useNavigate } from 'react-router-dom';
import { useLayout } from '../context/LayoutContext';
import { useProject } from '../context/ProjectContext';

// Shared by ImportPage's tool panel and ImportCanvasOverlay's upload
// dropzone, so file selection behaves identically no matter which UI
// triggered it.
export const useImportUpload = () => {
  const navigate = useNavigate();
  const { transcribe, transcribeStatus } = useProject();
  const { setIsTranscriptEditorOpen } = useLayout();
  const isTranscribing = transcribeStatus === 'uploading';

  const handleFileSelect = async (file: File) => {
    if (isTranscribing) return;
    try {
      await transcribe(file);
      navigate('/style');
      // Auto-open right after a fresh transcription (PLAN.md Part H, H4) so
      // Whisper mistakes get caught before the user starts styling - not
      // triggered by the cached-transcript restore path, only a real
      // transcribe() call.
      setIsTranscriptEditorOpen(true);
    } catch {
      // transcribeError is already surfaced in the panel below
    }
  };

  return { handleFileSelect, isTranscribing };
};
