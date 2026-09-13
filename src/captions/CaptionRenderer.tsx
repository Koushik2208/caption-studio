import { useCallback, useEffect, useState } from "react";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useDelayRender,
  useVideoConfig,
} from "remotion";
import type { Caption } from "@remotion/captions";
import type { FrameContentInset } from "../frames/types";
import { processCaptions } from "./processCaptions";
import { CalmPhrase } from "./styles/CalmPhrase";
import { OutlineDraw } from "./styles/OutlineDraw";
import { Signature } from "./styles/Signature";
import { SlideUp } from "./styles/SlideUp";
import { Typewriter } from "./styles/Typewriter";
import type { CaptionStyleOverrides, CaptionStyleVariant } from "./styles/types";

export type CaptionMode = "energetic" | "calm";

type CaptionRendererProps = {
  captions?: Caption[];
  captionsSrc?: string;
  hideBeforeMs?: number;
  getCaptionMode?: (startMs: number) => CaptionMode;
  styleVariant?: CaptionStyleVariant;
  styleOverrides?: CaptionStyleOverrides;
  frameContentInset?: FrameContentInset;
};

const defaultCaptionMode: CaptionMode = "energetic";

export const CaptionRenderer: React.FC<CaptionRendererProps> = ({
  captions: providedCaptions,
  captionsSrc = "captions/voice.json",
  hideBeforeMs = 0,
  getCaptionMode = () => defaultCaptionMode,
  styleVariant,
  styleOverrides,
  frameContentInset,
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

  // Synchronize font rendering in both browser player and headless export
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) {
      return;
    }
    const fontHandle = delayRender("Waiting for caption font assets");
    document.fonts.ready
      .then(() => {
        continueRender(fontHandle);
      })
      .catch((err) => {
        console.warn("Font loading wait warning:", err);
        continueRender(fontHandle);
      });
  }, [styleOverrides?.fontFamily, styleOverrides?.fontWeight, delayRender, continueRender]);

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
              <CalmPhrase page={page} overrides={styleOverrides} contentInset={frameContentInset} />
            ) : variant === "typewriter" ? (
              <Typewriter page={page} overrides={styleOverrides} contentInset={frameContentInset} />
            ) : variant === "slideUp" ? (
              <SlideUp page={page} overrides={styleOverrides} contentInset={frameContentInset} />
            ) : variant === "outlineDraw" ? (
              <OutlineDraw page={page} overrides={styleOverrides} contentInset={frameContentInset} />
            ) : (
              <Signature page={page} overrides={styleOverrides} contentInset={frameContentInset} />
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
