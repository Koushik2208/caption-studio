import {
  createTikTokStyleCaptions,
  type Caption,
  type TikTokToken,
} from "@remotion/captions";

export type CaptionPage = {
  text: string;
  tokens: TikTokToken[];
  startMs: number;
  from: number;
  durationInFrames: number;
};

const COMBINE_TOKENS_WITHIN_MS = 800;
const MAX_CHARS_PER_PAGE = 20;
const MIN_PAGE_DURATION_MS = 400;

type RawPage = { text: string; startMs: number; tokens: TikTokToken[] };

const tokensToPage = (tokens: TikTokToken[]): RawPage => ({
  text: tokens
    .map((t) => t.text)
    .join("")
    .trim(),
  startMs: tokens[0].fromMs,
  tokens,
});

// createTikTokStyleCaptions groups only by TIME, so any page can still run
// long in characters — split those into sub-pages, rebuilding startMs from
// the first token of each new group.
const splitByCharBudget = (pages: RawPage[]): RawPage[] => {
  const result: RawPage[] = [];

  for (const page of pages) {
    if (page.text.length <= MAX_CHARS_PER_PAGE) {
      result.push(page);
      continue;
    }

    let group: TikTokToken[] = [];
    let groupChars = 0;

    for (const token of page.tokens) {
      const tokenChars = token.text.trim().length;
      if (group.length > 0 && groupChars + tokenChars > MAX_CHARS_PER_PAGE) {
        result.push(tokensToPage(group));
        group = [];
        groupChars = 0;
      }
      group.push(token);
      groupChars += tokenChars;
    }
    if (group.length > 0) {
      result.push(tokensToPage(group));
    }
  }

  return result;
};

// Pages under ~400ms flash by unreadably fast during quick speech - merge
// them into a neighbor instead (previous page if one exists, else the next).
const mergeShortPages = (pages: RawPage[]): RawPage[] => {
  const merged = pages.map((page) => ({ ...page, tokens: [...page.tokens] }));

  let i = 0;
  while (merged.length > 1 && i < merged.length) {
    const page = merged[i];
    const lastToken = page.tokens[page.tokens.length - 1];
    const durationMs = lastToken.toMs - page.startMs;

    if (durationMs >= MIN_PAGE_DURATION_MS) {
      i++;
      continue;
    }

    if (i > 0) {
      const prev = merged[i - 1];
      prev.tokens.push(...page.tokens);
      prev.text = tokensToPage(prev.tokens).text;
      merged.splice(i, 1);
    } else {
      const next = merged[i + 1];
      next.tokens.unshift(...page.tokens);
      next.startMs = page.startMs;
      next.text = tokensToPage(next.tokens).text;
      merged.splice(i, 1);
    }
  }

  return merged;
};

// Contiguous pages: each page ends exactly where the next begins, so no
// frame is ever left without an active caption.
const toContiguousFramePages = (pages: RawPage[], fps: number): CaptionPage[] =>
  pages.map((page, index) => {
    const from = Math.round((page.startMs / 1000) * fps);
    const nextPage = pages[index + 1];
    const lastToken = page.tokens[page.tokens.length - 1];
    const nextFrom = nextPage
      ? Math.round((nextPage.startMs / 1000) * fps)
      : Math.round((lastToken.toMs / 1000) * fps);

    return {
      text: page.text,
      tokens: page.tokens,
      startMs: page.startMs,
      from,
      durationInFrames: Math.max(1, nextFrom - from),
    };
  });

// Break down multi-word captions (such as lines from standard SRT files)
// into word-level tokens with proportionally distributed timestamps so
// createTikTokStyleCaptions and karaoke active-word tracking work word-by-word.
export const ensureWordLevelCaptions = (captions: Caption[]): Caption[] => {
  const result: Caption[] = [];
  for (const caption of captions) {
    const rawText = caption.text;
    const trimmed = rawText.trim();
    if (!trimmed) continue;

    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length <= 1) {
      result.push(caption);
      continue;
    }

    const duration = Math.max(1, caption.endMs - caption.startMs);
    const totalChars = words.reduce((acc, w) => acc + w.length, 0);
    let currentStart = caption.startMs;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordFraction = totalChars > 0 ? word.length / totalChars : 1 / words.length;
      const wordDuration = Math.max(1, Math.round(duration * wordFraction));
      const isLast = i === words.length - 1;
      const endMs = isLast ? caption.endMs : Math.min(caption.endMs, currentStart + wordDuration);

      const formattedText = i === 0 ? word : ` ${word}`;

      result.push({
        text: formattedText,
        startMs: currentStart,
        endMs,
        timestampMs: currentStart,
        confidence: caption.confidence ?? null,
      });

      currentStart = endMs;
    }
  }
  return result;
};

// Pipeline order: empty-text filter -> word-level tokenization -> createTikTokStyleCaptions ->
// char-budget split -> min-duration merge -> contiguous frame conversion.
export const processCaptions = (
  captions: Caption[],
  fps: number,
): CaptionPage[] => {
  const wordLevelCaptions = ensureWordLevelCaptions(captions);
  const nonEmptyCaptions = wordLevelCaptions.filter((caption) => caption.text.trim().length > 0);

  const { pages } = createTikTokStyleCaptions({
    captions: nonEmptyCaptions,
    combineTokensWithinMilliseconds: COMBINE_TOKENS_WITHIN_MS,
  });

  const split = splitByCharBudget(pages);
  const merged = mergeShortPages(split);
  return toContiguousFramePages(merged, fps);
};
