import { useEffect, useState } from "react";
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
import { SplitReveal } from "./styles/SplitReveal";
import { WordStamp } from "./styles/WordStamp";
import { BlurResolve } from "./styles/BlurResolve";
import { SentenceBlock } from "./styles/SentenceBlock";
import type { CaptionStyleOverrides, CaptionStyleVariant } from "./styles/types";

export type CaptionMode = "energetic" | "calm";

type CaptionRendererProps = {
  captions?: Caption[] | null;
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
  captionsSrc,
  hideBeforeMs = 0,
  getCaptionMode = () => defaultCaptionMode,
  styleVariant,
  styleOverrides,
  frameContentInset,
}) => {
  const { fps } = useVideoConfig();
  const [fetchedCaptions, setFetchedCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender } = useDelayRender();

  // Only fetch external captions if captionsSrc was explicitly supplied AND no providedCaptions exist
  useEffect(() => {
    if (providedCaptions || !captionsSrc) return;
    let cancelled = false;
    const handle = delayRender("Loading captions");
    fetch(staticFile(captionsSrc))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Caption[]) => {
        if (!cancelled) setFetchedCaptions(data);
        continueRender(handle);
      })
      .catch((err) => {
        console.warn("Could not fetch captions from static source:", err);
        continueRender(handle);
      });

    return () => {
      cancelled = true;
      continueRender(handle);
    };
  }, [providedCaptions, captionsSrc, delayRender, continueRender]);

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
  if (!captions || captions.length === 0) {
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
            ) : variant === "splitReveal" ? (
              <SplitReveal page={page} overrides={styleOverrides} contentInset={frameContentInset} />
            ) : variant === "wordStamp" ? (
              <WordStamp page={page} overrides={styleOverrides} contentInset={frameContentInset} />
            ) : variant === "blurResolve" ? (
              <BlurResolve page={page} overrides={styleOverrides} contentInset={frameContentInset} />
            ) : variant === "sentenceBlock" ? (
              <SentenceBlock page={page} overrides={styleOverrides} contentInset={frameContentInset} />
            ) : (
              <Signature page={page} overrides={styleOverrides} contentInset={frameContentInset} />
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
