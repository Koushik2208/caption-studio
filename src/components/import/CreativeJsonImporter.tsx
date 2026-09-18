import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../../context/ProjectContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import systemPromptMarkdown from '../../../CREATIVE_DIRECTOR_SYSTEM_PROMPT.md?raw';
import {
  parseCreativeProject,
  serializeCreativeProject,
  validateCreativeProject,
  createDefaultCreativeProject,
  resolveCreativeProjectMedia,
  type CreativeProject,
  type ValidationError,
} from '../../creative/index.js';

const SAMPLE_CREATIVE_JSON: CreativeProject = createDefaultCreativeProject({
  id: 'proj_photosynthesis_sample',
  name: 'How Photosynthesis Powers Life',
  fps: 30,
  durationInFrames: 300,
  input: {
    mode: 'idea',
    text: 'I want to make a video about photosynthesis.',
  },
  creativeIntent: {
    contentType: 'educational',
    tone: 'punchy',
    energy: 'high',
    pacing: 'fast',
    visualStyle: 'modern_bold',
  },
  beats: [
    {
      id: 'beat_01',
      type: 'hook',
      startFrame: 0,
      endFrame: 90,
      content: {
        text: 'Plants are basically solar-powered factories.',
        words: [
          { text: 'Plants', startMs: 0, endMs: 400 },
          { text: ' are', startMs: 400, endMs: 650 },
          { text: ' basically', startMs: 650, endMs: 1200 },
          { text: ' solar-powered', startMs: 1200, endMs: 2000 },
          { text: ' factories.', startMs: 2000, endMs: 3000 },
        ],
      },
      visual: {
        animation: 'signature',
        videoMotion: { type: 'zoom-in', intensity: 'medium' },
      },
      transition: {
        assetId: 'flash',
        startFrame: 0,
        durationInFrames: 8,
        opacity: 0.8,
      },
      sfx: {
        assetId: 'vine_boom',
        startFrame: 0,
        volume: 0.9,
      },
    },
    {
      id: 'beat_02',
      type: 'explanation',
      startFrame: 90,
      endFrame: 210,
      content: {
        text: 'They absorb carbon dioxide and pump out pure oxygen.',
        words: [
          { text: 'They', startMs: 3000, endMs: 3300 },
          { text: ' absorb', startMs: 3300, endMs: 3900 },
          { text: ' carbon', startMs: 3900, endMs: 4400 },
          { text: ' dioxide', startMs: 4400, endMs: 5100 },
          { text: ' and', startMs: 5100, endMs: 5300 },
          { text: ' pump', startMs: 5300, endMs: 5700 },
          { text: ' out', startMs: 5700, endMs: 6000 },
          { text: ' pure', startMs: 6000, endMs: 6400 },
          { text: ' oxygen.', startMs: 6400, endMs: 7000 },
        ],
      },
      visual: {
        animation: 'wordStamp',
      },
      transition: {
        assetId: 'film_burn',
        startFrame: 90,
        durationInFrames: 12,
        opacity: 0.75,
      },
      sfx: {
        assetId: 'impact',
        startFrame: 90,
        volume: 0.7,
      },
    },
    {
      id: 'beat_03',
      type: 'conclusion',
      startFrame: 210,
      endFrame: 300,
      content: {
        text: 'Without them, every breath you take disappears.',
        words: [
          { text: 'Without', startMs: 7000, endMs: 7500 },
          { text: ' them,', startMs: 7500, endMs: 8000 },
          { text: ' every', startMs: 8000, endMs: 8400 },
          { text: ' breath', startMs: 8400, endMs: 8900 },
          { text: ' you', startMs: 8900, endMs: 9100 },
          { text: ' take', startMs: 9100, endMs: 9400 },
          { text: ' disappears.', startMs: 9400, endMs: 10000 },
        ],
      },
      visual: {
        animation: 'calmPhrase',
      },
      sfx: {
        assetId: 'whoosh_cinematic',
        startFrame: 210,
        volume: 0.6,
      },
    },
  ],
});

export const CreativeJsonImporter: React.FC = () => {
  const { loadCreativeProject, captions, mediaFile, srtFile } = useProject();
  const navigate = useNavigate();

  const [jsonText, setJsonText] = useState<string>('');
  const [validationResult, setValidationResult] = useState<{
    status: 'idle' | 'valid' | 'invalid';
    errors: ValidationError[];
    project?: CreativeProject;
  }>({ status: 'idle', errors: [] });
  const [showConfirmReplace, setShowConfirmReplace] = useState<boolean>(false);
  const [loadedSuccess, setLoadedSuccess] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // Debounced auto-validation (~300ms) on paste / change
  useEffect(() => {
    const trimmed = jsonText.trim();
    if (!trimmed) {
      setValidationResult({ status: 'idle', errors: [] });
      return;
    }

    const timer = setTimeout(() => {
      const res = parseCreativeProject(trimmed);
      if (res.isValid && res.data) {
        setValidationResult({
          status: 'valid',
          errors: [],
          project: res.data,
        });
      } else {
        setValidationResult({
          status: 'invalid',
          errors: res.errors,
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [jsonText]);

  const handleCopySystemPrompt = async () => {
    try {
      await navigator.clipboard.writeText(systemPromptMarkdown);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      console.error('Failed to copy system prompt to clipboard', err);
    }
  };

  const handleValidate = () => {
    if (!jsonText.trim()) {
      setValidationResult({
        status: 'invalid',
        errors: [{ path: '', message: 'Please paste a JSON document before validating', code: 'EMPTY_INPUT' }],
      });
      return;
    }

    const res = parseCreativeProject(jsonText);
    if (res.isValid && res.data) {
      setValidationResult({
        status: 'valid',
        errors: [],
        project: res.data,
      });
    } else {
      setValidationResult({
        status: 'invalid',
        errors: res.errors,
      });
    }
  };

  const handleFormatJson = () => {
    if (!jsonText.trim()) return;
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
    } catch {
      // If invalid JSON, trigger validation to show exact parse error
      handleValidate();
    }
  };

  const handleLoadSample = () => {
    const formatted = serializeCreativeProject(SAMPLE_CREATIVE_JSON, true);
    setJsonText(formatted);
    const res = validateCreativeProject(SAMPLE_CREATIVE_JSON);
    setValidationResult({
      status: 'valid',
      errors: [],
      project: res.data,
    });
    setLoadedSuccess(false);
  };

  const handleClear = () => {
    setJsonText('');
    setValidationResult({ status: 'idle', errors: [] });
    setShowConfirmReplace(false);
    setLoadedSuccess(false);
  };

  const executeLoad = (project: CreativeProject) => {
    loadCreativeProject(project);
    setShowConfirmReplace(false);
    setLoadedSuccess(true);
  };

  const handleLoadClick = () => {
    let projectToLoad = validationResult.project;

    if (!projectToLoad) {
      const res = parseCreativeProject(jsonText);
      if (!res.isValid || !res.data) {
        setValidationResult({ status: 'invalid', errors: res.errors });
        return;
      }
      projectToLoad = res.data;
      setValidationResult({ status: 'valid', errors: [], project: res.data });
    }

    // Check if replacing existing project state
    const hasExistingData = (captions && captions.length > 0) || !!mediaFile;
    if (hasExistingData && !showConfirmReplace) {
      setShowConfirmReplace(true);
      return;
    }

    executeLoad(projectToLoad);
  };

  const project = validationResult.project;
  const mediaResolution = project ? resolveCreativeProjectMedia(project, mediaFile, srtFile) : null;

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Top action row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant="secondary"
            onClick={handleCopySystemPrompt}
            className="text-[11px] h-7 px-2.5 flex items-center gap-1 font-medium bg-surface-container-high/60 hover:bg-surface-container-high"
            title="Copy Creative Director System Prompt to clipboard for ChatGPT"
          >
            <span className="material-symbols-outlined text-xs text-primary">
              {copiedPrompt ? 'check' : 'content_copy'}
            </span>
            <span>{copiedPrompt ? 'Prompt Copied!' : 'Copy System Prompt'}</span>
          </Button>
          <Button
            variant="secondary"
            onClick={handleLoadSample}
            className="text-[11px] h-7 px-2.5"
          >
            <span className="material-symbols-outlined text-xs mr-1">auto_awesome</span>
            Load Sample
          </Button>
          <Button
            variant="ghost"
            onClick={handleFormatJson}
            disabled={!jsonText.trim()}
            className="text-[11px] h-7 px-2 text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-xs mr-1">format_align_left</span>
            Prettify
          </Button>
        </div>

        {jsonText.trim() && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] text-outline hover:text-error transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">delete</span>
            Clear
          </button>
        )}
      </div>

      {/* Helper text explaining the prompt */}
      <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/80 px-1 -mt-1">
        <span className="material-symbols-outlined text-xs text-primary/80">lightbulb</span>
        <span>
          Paste prompt into ChatGPT along with your idea, transcript, or SRT to generate Creative JSON.
        </span>
      </div>

      {/* JSON Editor Textarea */}
      <div className="relative flex-1 min-h-[220px] rounded-xl border border-outline-variant/70 bg-surface-container-lowest overflow-hidden focus-within:border-primary/70 transition-colors">
        <textarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setLoadedSuccess(false);
          }}
          placeholder={`// Paste Creative JSON generated by ChatGPT here...
{
  "version": 1,
  "id": "proj_photosynthesis",
  "name": "Photosynthesis",
  "fps": 30,
  "durationInFrames": 300,
  "input": { "mode": "idea", "text": "Photosynthesis" },
  "beats": [ ... ]
}`}
          className="w-full h-full p-3 font-mono text-xs text-on-surface placeholder:text-outline/40 bg-transparent resize-none outline-none leading-relaxed selection:bg-primary/20"
          spellCheck={false}
        />
      </div>

      {/* Validation Status & Error Display */}
      {validationResult.status === 'invalid' && (
        <div className="p-3 rounded-xl bg-error/10 border border-error/30 flex flex-col gap-1.5 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-error font-bold text-xs">
            <span className="material-symbols-outlined text-sm">error</span>
            Validation Failed ({validationResult.errors.length}{' '}
            {validationResult.errors.length === 1 ? 'error' : 'errors'})
          </div>
          <div className="max-h-28 overflow-y-auto flex flex-col gap-1 pr-1 text-[11px]">
            {validationResult.errors.map((err, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-error/90 leading-tight">
                <span className="text-error/60 font-mono select-none">•</span>
                <div>
                  {err.path && <span className="font-mono font-bold text-error mr-1">[{err.path}]</span>}
                  <span>{err.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {validationResult.status === 'valid' && project && (
        <div className="p-3 rounded-xl bg-primary-container/10 border border-primary/30 flex flex-col gap-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Valid Creative Document (v{project.version})
            </div>
            <span className="text-[10px] text-outline font-mono">
              {project.durationInFrames} frames ({((project.durationInFrames / (project.fps || 30))).toFixed(1)}s)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] text-on-surface-variant">
            <div className="p-1.5 rounded-lg bg-surface-container/60 border border-outline-variant/30 flex flex-col">
              <span className="text-[9px] uppercase font-bold text-outline">Beats</span>
              <span className="font-bold text-on-surface">{project.beats.length}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-surface-container/60 border border-outline-variant/30 flex flex-col">
              <span className="text-[9px] uppercase font-bold text-outline">Animation</span>
              <span className="font-bold text-on-surface truncate capitalize">
                {project.globalSettings.animation}
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-surface-container/60 border border-outline-variant/30 flex flex-col">
              <span className="text-[9px] uppercase font-bold text-outline">Assets</span>
              <span className="font-bold text-on-surface truncate">
                {(project.assets?.transitions?.length || 0)} Tr / {(project.assets?.sfx?.length || 0)} SFX
              </span>
            </div>
          </div>

          {/* Media Resolution Status */}
          {!mediaFile ? (
            <div className="flex items-start gap-1.5 text-[11px] text-on-surface-variant/90 bg-surface-container-low/80 p-2 rounded-lg border border-outline-variant/40">
              <span className="material-symbols-outlined text-xs text-primary mt-0.5">info</span>
              <span>
                No video file currently loaded. Creative JSON will preview over chroma background until media is uploaded.
              </span>
            </div>
          ) : mediaResolution?.action === 'clear' ? (
            <div className="flex items-start gap-1.5 text-[11px] text-amber-200 bg-amber-500/10 p-2 rounded-lg border border-amber-500/30">
              <span className="material-symbols-outlined text-xs text-amber-400 mt-0.5">warning</span>
              <span>
                Creative JSON references "{mediaResolution.requiredAssetName}" which differs from loaded video "{mediaFile.name}". Current video will be detached on load to avoid showing unrelated footage.
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-1.5 text-[11px] text-primary/90 bg-primary/5 p-2 rounded-lg border border-primary/20">
              <span className="material-symbols-outlined text-xs text-primary mt-0.5">videocam</span>
              <span>
                {mediaResolution?.action === 'preserve' && mediaResolution.matchedAsset
                  ? `Preserving matching video "${mediaFile.name}".`
                  : `Preserving currently loaded video "${mediaFile.name}".`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Warning if replacing current project */}
      {showConfirmReplace && project && (
        <Card className="p-3 bg-error-container/10 border border-error/30 flex flex-col gap-2 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface">
            <span className="material-symbols-outlined text-sm text-error">warning</span>
            Replace current project?
          </div>
          <p className="text-[11px] text-on-surface-variant leading-snug">
            Loading this Creative JSON will overwrite your current project styles and captions with "{project.name}".
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Button
              variant="primary"
              className="flex-1 text-xs h-7"
              onClick={() => executeLoad(project)}
            >
              Confirm & Load
            </Button>
            <Button
              variant="ghost"
              className="text-xs h-7"
              onClick={() => setShowConfirmReplace(false)}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {loadedSuccess && (
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between text-xs text-primary font-medium animate-fadeIn">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">task_alt</span>
            <span>Creative Project loaded into workspace!</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/style')}
            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 ml-2"
          >
            Go to Style →
          </button>
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="flex items-center gap-2 mt-auto pt-1">
        <Button
          variant="secondary"
          onClick={handleValidate}
          disabled={!jsonText.trim()}
          className="flex-1 text-xs h-9"
        >
          <span className="material-symbols-outlined text-sm mr-1">rule</span>
          Validate JSON
        </Button>

        <Button
          variant="primary"
          onClick={handleLoadClick}
          disabled={!jsonText.trim() || validationResult.status === 'invalid'}
          className="flex-1 text-xs h-9 font-bold"
        >
          <span className="material-symbols-outlined text-sm mr-1">publish</span>
          Load Project
        </Button>
      </div>
    </div>
  );
};
