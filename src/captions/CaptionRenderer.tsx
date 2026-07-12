import { useCallback, useEffect, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import type { Caption } from "@remotion/captions";
import { processCaptions } from "./processCaptions";
import { CalmPhrase } from "./styles/CalmPhrase";
import { OutlineDraw } from "./styles/OutlineDraw";
import { Signature } from "./styles/Signature";
import { SlideUp } from "./styles/SlideUp";
import { Typewriter } from "./styles/Typewriter";
import type { CaptionStyleOverrides, CaptionStyleVariant } from "./styles/types";

export type CaptionMode = "energetic" | "calm";

type CaptionRendererProps = {
  // When provided, these are rendered directly and captionsSrc is never
  // fetched - used by callers with captions already in memory (e.g. Caption
  // Studio's live preview, where captions arrive from app state, not a file).
  captions?: Caption[];
  captionsSrc?: string;
  hideBeforeMs?: number; // skip pages already covered by a HookScene's own big-text captions
  getCaptionMode?: (startMs: number) => CaptionMode; // per-scene captionMode lookup (PLAN.md B5)
  // When provided, forces every page to render as this style component
  // instead of using getCaptionMode - this is Caption Studio's Style tab
  // picking one of the three variants in src/captions/styles/ directly,
  // rather than the faceless-app per-scene energetic/calm switching.
  styleVariant?: CaptionStyleVariant;
  styleOverrides?: CaptionStyleOverrides;
};

const defaultCaptionMode: CaptionMode = "energetic";

export const CaptionRenderer: React.FC<CaptionRendererProps> = ({
  captions: providedCaptions,
  captionsSrc = "captions/voice.json",
  hideBeforeMs = 0,
  getCaptionMode = () => defaultCaptionMode,
  styleVariant,
  styleOverrides,
}) => {
  const { fps } = useVideoConfig();
  const [fetchedCaptions, setFetchedCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() =>
    providedCaptions ? null : delayRender("Loading captions"),
  );

  const fetchCaptions = useCallback(async () => {
    if (handle === null) return;
    try {
      const response = await fetch(staticFile(captionsSrc));
      const data: Caption[] = await response.json();
      setFetchedCaptions(data);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [captionsSrc, continueRender, cancelRender, handle]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  const captions = providedCaptions ?? fetchedCaptions;
  if (!captions) {
    return null;
  }

  const pages = processCaptions(captions, fps).filter((page) => page.startMs >= hideBeforeMs);

  return (
    <AbsoluteFill>
      {pages.map((page, index) => {
        const variant =
          styleVariant ?? (getCaptionMode(page.startMs) === "calm" ? "calmPhrase" : "signature");

        return (
          <Sequence
            key={`${page.from}-${index}`}
            from={page.from}
            durationInFrames={page.durationInFrames}
          >
            {variant === "calmPhrase" ? (
              <CalmPhrase page={page} overrides={styleOverrides} />
            ) : variant === "typewriter" ? (
              <Typewriter page={page} overrides={styleOverrides} />
            ) : variant === "slideUp" ? (
              <SlideUp page={page} overrides={styleOverrides} />
            ) : variant === "outlineDraw" ? (
              <OutlineDraw page={page} overrides={styleOverrides} />
            ) : (
              <Signature page={page} overrides={styleOverrides} />
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
