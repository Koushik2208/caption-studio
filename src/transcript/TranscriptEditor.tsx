import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { FONT_PRESETS } from '../captions/styles/presets';
import { getWordTokenId } from '../captions/styles/wordOverrides';

const COLOR_SWATCHES = ['#ffffff', '#ffd23f', '#e8262b', '#0066ff', '#00e676', '#1a1c1d'];

const WEIGHT_LABELS: Record<number, string> = {
  400: 'Regular (400)',
  500: 'Medium (500)',
  600: 'SemiBold (600)',
  700: 'Bold (700)',
  800: 'ExtraBold (800)',
  900: 'Black (900)',
};

export type ScaleOption = {
  value: number;
  name: string;
  percentage: string;
  description: string;
};

const SCALE_OPTIONS: ScaleOption[] = [
  { value: 0.8, name: 'Small', percentage: '80%', description: 'Subordinate / supporting words' },
  { value: 1.0, name: 'Default', percentage: '100%', description: 'Preset caption baseline' },
  { value: 1.25, name: 'Large', percentage: '125%', description: 'Emphasis / key phrase' },
  { value: 1.5, name: 'Display', percentage: '150%', description: 'Hero / punch word' },
];

export const TranscriptEditor: React.FC = () => {
  const {
    captions,
    updateCaptionText,
    presetName,
    wordOverrides,
    setMultipleWordOverrides,
    resetWordOverrides,
    textColor: globalTextColor,
  } = useProject();

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftText, setDraftText] = useState('');
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());
  const [lastClickedWordId, setLastClickedWordId] = useState<string | null>(null);
  const [fontMenuOpen, setFontMenuOpen] = useState(false);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);
  const fontMenuRef = useRef<HTMLDivElement | null>(null);
  const sizeMenuRef = useRef<HTMLDivElement | null>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (fontMenuRef.current && !fontMenuRef.current.contains(target)) {
        setFontMenuOpen(false);
      }
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(target)) {
        setSizeMenuOpen(false);
      }
    };
    if (fontMenuOpen || sizeMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [fontMenuOpen, sizeMenuOpen]);

  const currentPreset = useMemo(
    () => FONT_PRESETS.find((p) => p.name === presetName) ?? FONT_PRESETS[0],
    [presetName],
  );

  const selectedIdsArray = Array.from(selectedWordIds);

  const firstSelectedWordOverride = selectedIdsArray.length > 0 ? wordOverrides[selectedIdsArray[0]] : undefined;

  // Determine active preset/font for selected words
  const activeSelectedFontPreset = useMemo(() => {
    if (firstSelectedWordOverride?.fontFamily) {
      return (
        FONT_PRESETS.find((p) => p.fontFamily === firstSelectedWordOverride.fontFamily) ??
        currentPreset
      );
    }
    return currentPreset;
  }, [firstSelectedWordOverride?.fontFamily, currentPreset]);

  const availableWeights = useMemo(
    () => (activeSelectedFontPreset.availableWeights ?? [activeSelectedFontPreset.fontWeight]) as readonly number[],
    [activeSelectedFontPreset],
  );

  if (!captions || captions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-body-sm text-on-surface-variant">
        No transcript yet - import media to generate captions.
      </div>
    );
  }

  const visibleTokens = captions
    .map((caption, index) => {
      const wordId = getWordTokenId(caption);
      const override = wordOverrides[wordId];
      return { caption, index, wordId, override };
    })
    .filter(({ caption }) => caption.text.trim().length > 0);

  const startEditing = (index: number, currentText: string) => {
    setEditingIndex(index);
    setDraftText(currentText);
    setSelectedWordIds(new Set());
    setFontMenuOpen(false);
    setSizeMenuOpen(false);
  };

  const commitEdit = () => {
    if (editingIndex !== null) {
      updateCaptionText(editingIndex, draftText);
    }
    setEditingIndex(null);
  };

  const cancelEdit = () => setEditingIndex(null);

  const handleWordClick = (
    e: React.MouseEvent,
    wordId: string,
  ) => {
    if (editingIndex !== null) return;

    if (e.shiftKey && lastClickedWordId) {
      // Range selection
      const lastIdx = visibleTokens.findIndex((t) => t.wordId === lastClickedWordId);
      const currentIdx = visibleTokens.findIndex((t) => t.wordId === wordId);
      if (lastIdx !== -1 && currentIdx !== -1) {
        const start = Math.min(lastIdx, currentIdx);
        const end = Math.max(lastIdx, currentIdx);
        const newSet = new Set(selectedWordIds);
        for (let i = start; i <= end; i++) {
          newSet.add(visibleTokens[i].wordId);
        }
        setSelectedWordIds(newSet);
        return;
      }
    }

    if (e.metaKey || e.ctrlKey) {
      // Toggle single word
      const newSet = new Set(selectedWordIds);
      if (newSet.has(wordId)) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      setSelectedWordIds(newSet);
      setLastClickedWordId(wordId);
      return;
    }

    // Normal click: select single word
    if (selectedWordIds.size === 1 && selectedWordIds.has(wordId)) {
      // Already selected
    } else {
      setSelectedWordIds(new Set([wordId]));
    }
    setLastClickedWordId(wordId);
  };

  const handleWordDoubleClick = (index: number, text: string) => {
    startEditing(index, text);
  };

  const clearSelection = () => {
    setSelectedWordIds(new Set());
    setLastClickedWordId(null);
    setFontMenuOpen(false);
    setSizeMenuOpen(false);
  };

  // Inspect current typography states among selected words
  const allSelectedAreItalic =
    selectedIdsArray.length > 0 &&
    selectedIdsArray.every((id) => {
      const ovr = wordOverrides[id];
      const effectiveStyle = ovr?.fontStyle ?? (ovr?.fontFamily ? (FONT_PRESETS.find(p => p.fontFamily === ovr.fontFamily)?.fontStyle ?? 'normal') : currentPreset.fontStyle);
      return effectiveStyle === 'italic';
    });

  const toggleItalic = () => {
    if (selectedIdsArray.length === 0) return;
    const nextStyle = allSelectedAreItalic ? 'normal' : 'italic';
    setMultipleWordOverrides(selectedIdsArray, { fontStyle: nextStyle });
  };

  const handleSelectFont = (targetPreset: (typeof FONT_PRESETS)[number]) => {
    if (selectedIdsArray.length === 0) return;
    const overridePatch: { fontFamily: string; fontStyle?: 'normal' | 'italic' } = {
      fontFamily: targetPreset.fontFamily,
    };
    if (targetPreset.fontStyle === 'italic') {
      overridePatch.fontStyle = 'italic';
    }
    setMultipleWordOverrides(selectedIdsArray, overridePatch);
    setFontMenuOpen(false);
  };

  const handleSelectScale = (scale: ScaleOption) => {
    if (selectedIdsArray.length === 0) return;
    setMultipleWordOverrides(selectedIdsArray, {
      fontSize: scale.value === 1.0 ? undefined : scale.value,
    });
    setSizeMenuOpen(false);
  };

  const currentSelectedColor = firstSelectedWordOverride?.color ?? globalTextColor ?? '#ffffff';
  const currentSelectedSize = firstSelectedWordOverride?.fontSize ?? 1.0;
  const currentSelectedWeight = firstSelectedWordOverride?.fontWeight ?? activeSelectedFontPreset.fontWeight;

  const currentScaleOption = SCALE_OPTIONS.find((s) => s.value === currentSelectedSize) ?? SCALE_OPTIONS[1];

  const hasAnyOverrides = selectedIdsArray.some((id) => Boolean(wordOverrides[id]));

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-outline-variant px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-label-caps font-label-caps tracking-wider text-outline">TRANSCRIPT</h3>
          <p className="mt-0.5 text-body-sm text-on-surface-variant">
            {visibleTokens.length} words • click to select, double-click to edit text
          </p>
        </div>
      </div>

      {/* Word-Level Typography Contextual Toolbar: [ Font ] [ Italic ] [ Color ] [ Size ] [ Weight ] [ Reset ] */}
      {selectedIdsArray.length > 0 && (
        <div className="shrink-0 border-b border-primary/20 bg-surface-container-high/90 px-3 py-2 backdrop-blur-sm relative z-20">
          <div className="flex flex-wrap items-center gap-2">
            {/* Selection badge & deselect */}
            <div className="flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
              <span className="text-[11px] font-semibold text-primary font-mono">
                {selectedIdsArray.length} {selectedIdsArray.length === 1 ? 'word' : 'words'}
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="text-on-surface-variant hover:text-on-surface text-xs leading-none p-0.5 rounded cursor-pointer"
                title="Clear selection"
                aria-label="Clear selection"
              >
                ✕
              </button>
            </div>

            <div className="h-4 w-px bg-outline-variant/60" />

            {/* 1. Font Control (Compact Popover Menu with 8 Presets) */}
            <div className="relative" ref={fontMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setFontMenuOpen(!fontMenuOpen);
                  setSizeMenuOpen(false);
                }}
                className="h-7 px-2.5 flex items-center gap-1.5 text-xs font-medium border border-outline-variant/70 rounded-md bg-surface text-on-surface hover:border-primary/60 hover:bg-surface-container-low transition-all cursor-pointer shadow-2xs"
                title="Select font family for word(s)"
                aria-label="Word font family"
                aria-expanded={fontMenuOpen}
              >
                <span
                  className="truncate max-w-[100px]"
                  style={{
                    fontFamily: activeSelectedFontPreset.fontFamily,
                    fontStyle: activeSelectedFontPreset.fontStyle,
                  }}
                >
                  {firstSelectedWordOverride?.fontFamily
                    ? (FONT_PRESETS.find((p) => p.fontFamily === firstSelectedWordOverride.fontFamily)?.name ?? 'Custom Font')
                    : activeSelectedFontPreset.name}
                </span>
                <span className="text-[9px] text-outline">▾</span>
              </button>

              {fontMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-44 py-1 bg-surface-container-highest border border-outline-variant/80 rounded-xl shadow-xl z-50 overflow-hidden custom-scrollbar max-h-64 overflow-y-auto">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-outline font-label-caps border-b border-outline-variant/40">
                    Font Pairing
                  </div>
                  {FONT_PRESETS.map((p) => {
                    const isSelected =
                      firstSelectedWordOverride?.fontFamily === p.fontFamily ||
                      (!firstSelectedWordOverride?.fontFamily && currentPreset.name === p.name);

                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleSelectFont(p)}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white font-medium'
                            : 'text-on-surface hover:bg-surface-container-low'
                        }`}
                      >
                        <span
                          className="truncate"
                          style={{
                            fontFamily: p.fontFamily,
                            fontStyle: p.fontStyle,
                          }}
                        >
                          {p.name}
                        </span>
                        {isSelected && <span className="text-[11px] font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Italic Toggle */}
            <button
              type="button"
              onClick={toggleItalic}
              title={allSelectedAreItalic ? 'Remove italic (set normal)' : 'Apply italic'}
              aria-label="Toggle italic"
              aria-pressed={allSelectedAreItalic}
              className={`h-7 px-2.5 flex items-center justify-center rounded-md font-sans italic text-xs font-bold transition-all cursor-pointer ${
                allSelectedAreItalic
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-surface border border-outline-variant/70 text-on-surface hover:border-primary/60 hover:bg-surface-container-low'
              }`}
            >
              I
            </button>

            {/* 3. Color Override */}
            <div className="flex items-center gap-1 bg-surface border border-outline-variant/70 px-1.5 py-0.5 rounded-md">
              <label
                className="relative w-5 h-5 rounded overflow-hidden border border-outline-variant cursor-pointer shrink-0 shadow-2xs hover:border-primary transition-colors"
                title="Custom color"
              >
                <input
                  type="color"
                  value={currentSelectedColor}
                  onChange={(e) => setMultipleWordOverrides(selectedIdsArray, { color: e.target.value })}
                  className="absolute -top-2 -left-2 w-9 h-9 cursor-pointer border-0 p-0"
                  aria-label="Pick custom word color"
                />
              </label>

              <div className="flex items-center gap-1">
                {COLOR_SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setMultipleWordOverrides(selectedIdsArray, { color: hex })}
                    className={`w-4 h-4 rounded border transition-transform hover:scale-115 active:scale-90 cursor-pointer ${
                      currentSelectedColor.toLowerCase() === hex.toLowerCase()
                        ? 'border-primary ring-1 ring-primary'
                        : 'border-outline-variant/60'
                    }`}
                    style={{ backgroundColor: hex }}
                    title={hex}
                    aria-label={`Select color ${hex}`}
                  />
                ))}
              </div>
            </div>

            {/* 4. Font Size Scale Hierarchy Control: [ Small 80% | Default 100% | Large 125% | Display 150% ] */}
            <div className="relative" ref={sizeMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setSizeMenuOpen(!sizeMenuOpen);
                  setFontMenuOpen(false);
                }}
                className="h-7 px-2.5 flex items-center gap-1.5 text-xs font-medium border border-outline-variant/70 rounded-md bg-surface text-on-surface hover:border-primary/60 hover:bg-surface-container-low transition-all cursor-pointer shadow-2xs"
                title="Scale hierarchy contrast for word(s)"
                aria-label="Word scale hierarchy"
                aria-expanded={sizeMenuOpen}
              >
                <span>{currentScaleOption.name}</span>
                <span className="text-[10px] text-outline font-mono">({currentScaleOption.percentage})</span>
                <span className="text-[9px] text-outline">▾</span>
              </button>

              {sizeMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 py-1 bg-surface-container-highest border border-outline-variant/80 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-outline font-label-caps border-b border-outline-variant/40">
                    Scale Hierarchy
                  </div>
                  {SCALE_OPTIONS.map((scale) => {
                    const isSelected = currentSelectedSize === scale.value;
                    return (
                      <button
                        key={scale.value}
                        type="button"
                        onClick={() => handleSelectScale(scale)}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-white font-medium'
                            : 'text-on-surface hover:bg-surface-container-low'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold">{scale.name}</span>
                          <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-outline'}`}>
                            {scale.description}
                          </span>
                        </div>
                        <span className={`font-mono text-[11px] font-bold ${isSelected ? 'text-white' : 'text-primary'}`}>
                          {scale.percentage}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. Font Weight */}
            <div className="flex items-center">
              <select
                value={currentSelectedWeight}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMultipleWordOverrides(selectedIdsArray, { fontWeight: val });
                }}
                disabled={availableWeights.length <= 1}
                className="h-7 px-2 text-[11px] border border-outline-variant/70 rounded-md bg-surface text-on-surface focus:outline-none focus:border-primary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                title={availableWeights.length <= 1 ? `${activeSelectedFontPreset.name} supports single weight` : 'Word font weight'}
                aria-label="Word font weight"
              >
                {availableWeights.map((w) => (
                  <option key={w} value={w}>
                    {WEIGHT_LABELS[w] ?? `${w}`}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Reset Overrides */}
            <button
              type="button"
              onClick={() => resetWordOverrides(selectedIdsArray)}
              disabled={!hasAnyOverrides}
              className={`h-7 px-2.5 text-[11px] font-medium rounded-md border transition-all cursor-pointer ${
                hasAnyOverrides
                  ? 'border-error/40 bg-surface text-error hover:bg-error/10 hover:border-error'
                  : 'border-outline-variant/40 bg-surface/50 text-outline opacity-50 cursor-not-allowed'
              }`}
              title="Reset typography to preset defaults"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Transcript Words Canvas */}
      <div
        className="custom-scrollbar flex-1 overflow-y-auto p-4"
        onClick={(e) => {
          // Deselect when clicking blank canvas background
          if (e.target === e.currentTarget && selectedWordIds.size > 0) {
            clearSelection();
          }
        }}
      >
        <div className="flex flex-wrap gap-x-1.5 gap-y-2 leading-relaxed items-center">
          {visibleTokens.map(({ caption, index, wordId, override }) => {
            const isEditing = editingIndex === index;
            const isSelected = selectedWordIds.has(wordId);
            const tokenPreset = override?.fontFamily
              ? FONT_PRESETS.find((p) => p.fontFamily === override.fontFamily)
              : currentPreset;
            const effectiveFontFamily = override?.fontFamily ?? currentPreset.fontFamily;
            const isItalic = (override?.fontStyle ?? tokenPreset?.fontStyle ?? 'normal') === 'italic';
            const hasOverride = Boolean(override && Object.keys(override).length > 0);

            if (isEditing) {
              return (
                <input
                  key={wordId}
                  autoFocus
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  onFocus={(e) => e.currentTarget.select()}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitEdit();
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      cancelEdit();
                    }
                  }}
                  style={{
                    width: `${Math.max(2, draftText.length + 1)}ch`,
                    fontFamily: effectiveFontFamily,
                  }}
                  className="rounded border border-primary bg-surface px-1 text-body-md text-on-surface outline-none shadow-xs"
                />
              );
            }

            return (
              <span
                key={wordId}
                role="button"
                tabIndex={0}
                onClick={(e) => handleWordClick(e, wordId)}
                onDoubleClick={() => handleWordDoubleClick(index, caption.text.trim())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    startEditing(index, caption.text.trim());
                  } else if (e.key === 'Escape') {
                    clearSelection();
                  }
                }}
                style={{
                  fontFamily: effectiveFontFamily,
                  fontStyle: isItalic ? 'italic' : 'normal',
                  fontWeight: override?.fontWeight ?? undefined,
                  color: isSelected ? undefined : override?.color ?? undefined,
                  fontSize: override?.fontSize ? `${override.fontSize}em` : undefined,
                }}
                className={`relative cursor-pointer rounded px-1 py-0.5 text-body-md transition-colors select-none ${
                  isSelected
                    ? 'bg-primary text-white font-medium ring-2 ring-primary/40 shadow-xs'
                    : 'text-on-surface hover:bg-primary-container/40'
                }`}
                title={
                  hasOverride
                    ? `Overridden: ${[
                        override?.fontFamily
                          ? `Font: ${FONT_PRESETS.find((p) => p.fontFamily === override.fontFamily)?.name ?? 'Custom'}`
                          : null,
                        override?.fontStyle ? `Style: ${override.fontStyle}` : null,
                        override?.color ? `Color: ${override.color}` : null,
                        override?.fontSize
                          ? `Scale: ${SCALE_OPTIONS.find((s) => s.value === override.fontSize)?.name ?? `${override.fontSize}x`} (${Math.round((override.fontSize ?? 1) * 100)}%)`
                          : null,
                        override?.fontWeight ? `Weight: ${override.fontWeight}` : null,
                      ]
                        .filter(Boolean)
                        .join(', ')} (Double click to edit text)`
                    : 'Click to select • Double-click to edit text'
                }
              >
                {caption.text.trim()}
                {hasOverride && !isSelected && (
                  <span
                    className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full bg-primary/60"
                    aria-hidden="true"
                  />
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
