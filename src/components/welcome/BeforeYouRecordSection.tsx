import React, { useState } from 'react';

interface PromptCardData {
  id: string;
  label: string;
  title: string;
  description: string;
  prompt: string;
  isFeatured?: boolean;
  accentColor: {
    badge: string;
    border: string;
    shadow: string;
    button: string;
    icon: string;
  };
}

const PROMPT_CARDS: PromptCardData[] = [
  {
    id: 'find-my-angle',
    label: 'CREATIVE DIRECTION',
    title: 'Give Me Different Roads',
    description: 'When you have a topic but have no idea what angle to take.',
    isFeatured: true,
    accentColor: {
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
      border: 'border-indigo-200/80 hover:border-indigo-400',
      shadow: 'shadow-indigo-500/5 hover:shadow-indigo-500/15',
      button: 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-indigo-500/25 hover:shadow-indigo-500/40',
      icon: 'explore',
    },
    prompt: `I want to make a short-form video about:

[YOUR TOPIC]

I don't know what angle to take.

Don't write the video for me.

Instead, act like a creative director and give me 5 different directions for the same topic.

For each direction, show:

1. THE ANGLE
What is the interesting idea behind this version?

2. THE HOOK
What could make someone want to keep watching?

3. THE STORY
What should I actually talk about?

4. THE TENSION
What conflict, question, contrast, mistake, or uncertainty keeps the story moving?

5. THE PAYOFF
What should the viewer understand by the end?

6. THE DELIVERY
Should I tell it calmly, excitedly, conversationally, dramatically, humorously, etc.?

7. WHAT TO AVOID
What would make this version boring or too long?

Do not give me a finished script.

I want different roads I could take, then I will choose one and tell the story in my own words.`,
  },
  {
    id: 'tell-a-story',
    label: 'STORY',
    title: 'Find the Story',
    description: 'When you have a personal experience, lesson, mistake, or turning point.',
    accentColor: {
      badge: 'bg-purple-50 text-purple-700 border-purple-200/70',
      border: 'border-purple-100 hover:border-purple-300',
      shadow: 'shadow-purple-500/5 hover:shadow-purple-500/10',
      button: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20 hover:shadow-purple-500/35',
      icon: 'auto_stories',
    },
    prompt: `I want to create a short-form video about:

[YOUR TOPIC]

Don't write the script for me.

Instead, help me find the story inside this topic.

Give me 3 different storytelling directions:

1. THE MOMENT
Find the most interesting specific moment, turning point, mistake, realization, or experience I could build the video around.

2. THE STRUGGLE
Show me a possible journey:
- What was I trying to do?
- What went wrong?
- What did I struggle with?
- What changed?
- What did I learn?

3. THE LESSON
Find the deeper lesson or idea that could make this useful to someone else.

For each direction, give me:
- A possible hook idea
- What I should talk about
- What specific details I should remember
- Where the tension or curiosity comes from
- What the audience should take away

Do NOT write polished sentences for me.
Do NOT give me a ready-to-read script.

Teach me what to say and how to structure it, as if you were coaching me before I recorded the video.

Keep it conversational and simple.`,
  },
  {
    id: 'hook-lab',
    label: 'HOOK',
    title: 'Find Your Hook',
    description: 'When you know what you want to say but don\'t know how to start.',
    accentColor: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200/70',
      border: 'border-rose-100 hover:border-rose-300',
      shadow: 'shadow-rose-500/5 hover:shadow-rose-500/10',
      button: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20 hover:shadow-rose-500/35',
      icon: 'offline_bolt',
    },
    prompt: `I want to make a short-form video about:

[YOUR TOPIC]

Don't write the script.

Help me find the strongest ways I could OPEN this video.

Give me 7 different hook directions:

1. CONTRARIAN
Challenge something people commonly believe.

2. CURIOSITY
Create a question the viewer wants answered.

3. PROBLEM
Start with a problem the audience recognizes immediately.

4. STORY
Start inside an interesting moment rather than explaining the background.

5. RESULT
Start with an unexpected result, outcome, or transformation.

6. QUESTION
Ask a question that makes the right viewer stop and think.

7. SURPRISE
Start with something unexpected, unusual, or counterintuitive.

For each one, give me:
- The hook idea
- What I should talk about immediately after it
- What question should remain unanswered
- What the viewer should want to know next

Do NOT write a polished script.
Give me directions I can speak naturally in my own words.`,
  },
  {
    id: 'mistake-lesson',
    label: 'LESSON',
    title: 'Tell It the Hard Way',
    description: 'Turn something you learned the hard way into a story.',
    accentColor: {
      badge: 'bg-amber-50 text-amber-700 border-amber-200/70',
      border: 'border-amber-100 hover:border-amber-300',
      shadow: 'shadow-amber-500/5 hover:shadow-amber-500/10',
      button: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20 hover:shadow-amber-500/35',
      icon: 'lightbulb',
    },
    prompt: `I want to talk about:

[YOUR TOPIC]

Help me turn this into a personal story rather than a list of information.

Don't write my script.

Find 3 possible versions:

A. THE MISTAKE
What did I believe or do that turned out to be wrong?

B. THE TURNING POINT
What happened that made me change my thinking?

C. THE LESSON
What do I understand now that I didn't understand before?

For each version, tell me:

- Where the story should begin
- What moment I should spend the most time on
- What details would make it feel real
- What I should leave out
- Where the tension changes
- What the audience should learn from it

Help me tell the story by RELIVING the important moment, not reporting everything that happened.

Do not write a finished script.
Coach me on what to say.`,
  },
  {
    id: 'teach-simply',
    label: 'TEACH',
    title: 'Explain It Simply',
    description: 'When you want to teach an idea without sounding like you\'re reading a textbook.',
    accentColor: {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
      border: 'border-emerald-100 hover:border-emerald-300',
      shadow: 'shadow-emerald-500/5 hover:shadow-emerald-500/10',
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 hover:shadow-emerald-500/35',
      icon: 'school',
    },
    prompt: `I want to explain this topic in a short video:

[YOUR TOPIC]

Act like a communication coach helping me prepare, NOT a scriptwriter.

First, give me 3 different ways I could explain this topic:

1. STORY-FIRST
Start with a real situation or relatable moment.

2. EXAMPLE-FIRST
Start with a simple example that makes the idea obvious.

3. PROBLEM-FIRST
Start with a problem, explain why it happens, then reveal the idea.

For each direction, tell me:

- What I should say first
- What I should explain next
- What example I should use
- Where I should slow down or emphasize something
- What the audience might misunderstand
- What the final takeaway should be

Explain the structure to me like you're teaching a smart 12-year-old how to tell the story.

Do NOT write the sentences I should read.

Give me a speaking roadmap so I can explain it naturally in my own words.`,
  },
];

export const BeforeYouRecordSection: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    'find-my-angle': true, // Keep featured card expanded or previewable by default
  });

  const handleToggleExpand = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyPrompt = async (promptText: string, id: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(promptText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = promptText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 2500);
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
    }
  };

  const featuredCard = PROMPT_CARDS.find((card) => card.isFeatured) || PROMPT_CARDS[0];
  const gridCards = PROMPT_CARDS.filter((card) => !card.isFeatured);

  return (
    <section
      id="before-you-record"
      className="relative py-20 sm:py-28 bg-[#FAFAFC] border-b border-gray-200/50 overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -z-10 w-[700px] h-[400px] bg-indigo-50/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 -z-10 w-80 h-80 bg-purple-50/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="relative text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          {/* Handwritten Annotation (Top Left) */}
          <div className="hidden sm:block absolute -top-9 -left-10 text-left select-none -rotate-4">
            <span className="font-handwriting text-2xl text-indigo-900/80 font-bold block">
              Don't let AI write your story.
            </span>
            <span className="font-handwriting text-xl text-gray-600 block mt-0.5">
              Use it to figure out what it is ✍️
            </span>
          </div>

          {/* Category Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              mic
            </span>
            <span>Prep Before You Speak</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-950 mb-3">
            Before You Record
          </h2>
          <p className="text-lg sm:text-xl font-bold text-indigo-600 mb-3">
            You don't need a script. You need a direction.
          </p>
          <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed max-w-2xl mx-auto mb-6">
            Tell ChatGPT what you want to talk about, explore a few ways to tell it, then record it in your own words.
          </p>

          {/* Workflow Steps Pill Bar */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/80 shadow-md shadow-gray-200/40 text-xs sm:text-sm font-semibold text-gray-700">
            <span className="flex items-center gap-1.5 text-indigo-600 font-bold">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[11px]">1</span>
              Pick a prompt
            </span>
            <span className="text-gray-300">→</span>
            <span className="flex items-center gap-1.5 text-purple-600 font-bold">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[11px]">2</span>
              Paste in ChatGPT
            </span>
            <span className="text-gray-300">→</span>
            <span className="flex items-center gap-1.5 text-amber-600 font-bold">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[11px]">3</span>
              Choose angle
            </span>
            <span className="text-gray-300">→</span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px]">4</span>
              Start recording
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FEATURED PROMPT CARD (Find My Angle)                                      */}
        {/* ========================================================================= */}
        <div className="mb-8">
          <div className="relative bg-gradient-to-b from-white to-indigo-50/30 rounded-3xl p-6 sm:p-8 lg:p-10 border-2 border-indigo-200/90 shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/15 transition-all duration-300 group">
            
            {/* Featured Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                  ★ FEATURED ANGLE FINDER
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${featuredCard.accentColor.badge}`}>
                  {featuredCard.label}
                </span>
              </div>

              {/* Copy Prompt Button */}
              <button
                type="button"
                onClick={() => handleCopyPrompt(featuredCard.prompt, featuredCard.id)}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer ${
                  copiedId === featuredCard.id
                    ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                    : featuredCard.accentColor.button
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {copiedId === featuredCard.id ? 'check' : 'content_copy'}
                </span>
                <span>{copiedId === featuredCard.id ? 'Copied Prompt!' : 'Copy Prompt'}</span>
              </button>
            </div>

            {/* Title & Description */}
            <div className="max-w-3xl mb-6">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-950 mb-2 group-hover:text-indigo-900 transition-colors">
                "{featuredCard.title}"
              </h3>
              <p className="text-sm sm:text-base text-gray-600 font-medium">
                {featuredCard.description}
              </p>
            </div>

            {/* Expandable Prompt Text Box */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => handleToggleExpand(featuredCard.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer py-1"
                >
                  <span className="material-symbols-outlined text-sm transition-transform duration-200" style={{ transform: expandedCards[featuredCard.id] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                  </span>
                  <span>{expandedCards[featuredCard.id] ? 'Collapse Prompt Preview' : 'Expand Full ChatGPT Prompt'}</span>
                </button>
                <span className="text-[11px] text-gray-400 font-medium">
                  Replace <span className="text-indigo-600 font-bold font-mono">[YOUR TOPIC]</span> in ChatGPT
                </span>
              </div>

              {expandedCards[featuredCard.id] && (
                <div className="relative rounded-2xl bg-gray-900 text-gray-100 p-5 sm:p-6 font-mono text-xs sm:text-[13px] leading-relaxed border border-gray-800 shadow-inner overflow-x-auto whitespace-pre-wrap break-words">
                  {featuredCard.prompt.split('[YOUR TOPIC]').map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className="inline-block bg-[#FACC15] text-gray-950 font-black px-2 py-0.5 rounded mx-1 shadow-xs not-italic font-sans text-xs uppercase tracking-wider">
                          [YOUR TOPIC]
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4 PROMPT GRID                                                             */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {gridCards.map((card) => {
            const isCopied = copiedId === card.id;
            const isExpanded = !!expandedCards[card.id];

            return (
              <div
                key={card.id}
                className={`flex flex-col bg-white rounded-3xl p-6 sm:p-7 border shadow-lg transition-all duration-300 hover:-translate-y-1 ${card.accentColor.border} ${card.accentColor.shadow}`}
              >
                {/* Card Top: Label & Copy Button */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${card.accentColor.badge}`}>
                    {card.label}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(card.prompt, card.id)}
                    className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer shrink-0 ${
                      isCopied
                        ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                        : card.accentColor.button
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {isCopied ? 'check' : 'content_copy'}
                    </span>
                    <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-gray-950 mb-1.5">
                  "{card.title}"
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed mb-4 min-h-[38px]">
                  {card.description}
                </p>

                {/* Collapsible Prompt Toggle */}
                <div className="mt-auto pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleToggleExpand(card.id)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer py-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-gray-400">
                        chat_bubble_outline
                      </span>
                      <span>{isExpanded ? 'Hide prompt' : 'View prompt details'}</span>
                    </span>
                    <span
                      className="material-symbols-outlined text-sm text-gray-400 transition-transform duration-200"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      expand_more
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 rounded-2xl bg-gray-900 text-gray-100 p-4 font-mono text-xs leading-relaxed border border-gray-800 shadow-inner overflow-x-auto whitespace-pre-wrap break-words max-h-72 custom-scrollbar">
                      {card.prompt.split('[YOUR TOPIC]').map((part, i, arr) => (
                        <React.Fragment key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className="inline-block bg-[#FACC15] text-gray-950 font-black px-1.5 py-0.2 rounded mx-1 text-[10px] font-sans uppercase">
                              [YOUR TOPIC]
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* SUBTLE BOTTOM CALLOUT                                                     */}
        {/* ========================================================================= */}
        <div className="mt-14 sm:mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-50/80 border border-indigo-100 text-xs sm:text-sm font-semibold text-indigo-900/80 select-none">
            <span className="text-base">✨</span>
            <span>Your words. Your story. AI just helps you find the direction.</span>
          </div>
        </div>

      </div>
    </section>
  );
};
