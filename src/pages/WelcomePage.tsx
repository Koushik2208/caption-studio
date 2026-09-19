import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BeforeYouRecordSection } from '../components/welcome/BeforeYouRecordSection';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#FAFAFC] text-[#1E2024] font-sans antialiased overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR                                                             */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-[#FAFAFC]/85 backdrop-blur-md border-b border-gray-200/60 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#4F46E5] to-[#6366F1] flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13zm5.75 3a.75.75 0 0 0-.75.75v5.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5H10.5V9.25a.75.75 0 0 0-.75-.75z" />
                <path d="M10 8.5L16 12L10 15.5V8.5Z" />
              </svg>
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-gray-900">
              Caption Studio
            </span>
          </div>

          {/* Navigation links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a
              href="#storytelling"
              className="hover:text-indigo-600 transition-colors py-1 cursor-pointer"
            >
              Story Framework
            </a>
            <a
              href="#before-you-record"
              className="hover:text-indigo-600 transition-colors py-1 cursor-pointer"
            >
              Before You Record
            </a>
            <a
              href="#workflow"
              className="hover:text-indigo-600 transition-colors py-1 cursor-pointer"
            >
              Workflow
            </a>
            <a
              href="#inspire"
              className="hover:text-indigo-600 transition-colors py-1 cursor-pointer"
            >
              Inspire
            </a>
          </nav>

          {/* Open App CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/import')}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
            >
              <span>Open App</span>
              <svg
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-current stroke-2 fill-none"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="relative pt-8 pb-16 sm:pt-14 sm:pb-24 overflow-hidden">
        {/* Soft atmospheric background glow */}
        <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-purple-100/70 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-10 -z-10 w-80 h-80 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* Handwritten note & curved arrow */}
              <div className="relative mb-2 sm:mb-3 pl-6">
                <span className="font-handwriting text-xl sm:text-2xl text-gray-700 tracking-wide inline-block -rotate-2">
                  Turn your ideas into scroll-stopping stories
                </span>
                {/* SVG curved arrow pointing to headline */}
                <svg
                  className="absolute -bottom-4 left-0 w-8 h-8 text-gray-700 pointer-events-none"
                  viewBox="0 0 50 50"
                  fill="none"
                >
                  <path
                    d="M 12 4 Q 4 20 18 36"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 10 32 L 18 36 L 22 28"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-black tracking-tight text-gray-950 leading-[1.08] mb-5 sm:mb-6">
                Better Stories. <br />
                Bolder Captions. <br />
                <span className="bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
                  More You.
                </span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg text-gray-600 max-w-xl font-medium leading-relaxed mb-8">
                Caption Studio helps you turn your ideas, transcripts or videos into engaging, beautifully styled UGC content.
              </p>

              {/* Primary CTA + No-install note */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/import')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-base sm:text-lg font-bold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/45 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 cursor-pointer"
                >
                  <span>Start Creating</span>
                  <svg
                    className="w-5 h-5 stroke-current stroke-2 fill-none"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>

              <div className="text-xs font-semibold text-gray-400 -mt-6 mb-8 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>No install needed. Just ideas.</span>
              </div>

              {/* Feature Trio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 border-t border-gray-200/80 w-full">
                {/* Item 1 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      bolt
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-gray-900">Import your SRT</h2>
                    <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">
                      (or use any transcript)
                    </p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      auto_awesome
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-gray-900">AI Creative Direction</h2>
                    <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">
                      Smart beats & emphasis
                    </p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_circle
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-gray-900">Preview & Export</h2>
                    <p className="text-[11px] text-gray-500 font-medium leading-tight mt-0.5">
                      Fast 4K / HD video render
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: 9:16 Creator Video Mockup + Chips & Annotations */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
              
              {/* Sticky Note (Top Left of phone mockup) */}
              <div className="absolute -top-5 sm:-top-6 left-2 sm:-left-6 z-20 bg-[#FEF08A] text-[#854D0E] shadow-lg rounded-md px-3.5 py-2 -rotate-6 border border-yellow-300 select-none">
                <span className="font-handwriting text-lg sm:text-xl font-bold leading-none block">
                  Same idea.
                </span>
                <span className="font-handwriting text-lg sm:text-xl font-bold leading-none block mt-0.5">
                  More impact.
                </span>
              </div>

              {/* Floating Feature Badges (Right side) */}
              <div className="hidden sm:flex flex-col gap-2.5 absolute -right-4 lg:-right-6 top-12 z-20 pointer-events-none">
                <div className="bg-white/95 backdrop-blur-md text-gray-800 text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 transform translate-x-1 hover:translate-x-0 transition-transform">
                  <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-[11px] font-black">
                    Aa
                  </span>
                  <span>Clean captions</span>
                </div>
                <div className="bg-white/95 backdrop-blur-md text-gray-800 text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 transform translate-x-3 hover:translate-x-0 transition-transform">
                  <span className="w-5 h-5 rounded-md bg-yellow-50 text-yellow-600 flex items-center justify-center text-[11px] font-black">
                    🪄
                  </span>
                  <span>Highlight keywords</span>
                </div>
                <div className="bg-white/95 backdrop-blur-md text-gray-800 text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 transform translate-x-2 hover:translate-x-0 transition-transform">
                  <span className="w-5 h-5 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center text-[11px] font-black">
                    ✨
                  </span>
                  <span>Add motion & effects</span>
                </div>
                <div className="bg-white/95 backdrop-blur-md text-gray-800 text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2 transform translate-x-1 hover:translate-x-0 transition-transform">
                  <span className="w-5 h-5 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center text-[11px] font-black">
                    🎨
                  </span>
                  <span>Make it yours</span>
                </div>
              </div>

              {/* Creator Hand-drawn note (Bottom Right) */}
              <div className="hidden sm:block absolute -bottom-10 -right-4 lg:-right-10 z-20 max-w-[170px] select-none text-right">
                <svg
                  className="w-7 h-7 text-gray-700 ml-auto mb-1 pointer-events-none rotate-12"
                  viewBox="0 0 50 50"
                  fill="none"
                >
                  <path
                    d="M 38 4 Q 46 20 32 36"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 40 32 L 32 36 L 28 28"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-handwriting text-lg text-gray-700 font-bold leading-tight block">
                  Create content people actually watch (and remember)
                </span>
              </div>

              {/* 9:16 Video Mockup Container */}
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[9/16] rounded-[2.5rem] bg-gray-900 p-2.5 shadow-2xl shadow-gray-900/25 border-4 border-gray-800/80 overflow-hidden group">
                {/* Phone Notch/Speaker Indicator */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/70 rounded-full z-20 backdrop-blur-md flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1e2024] mr-2" />
                  <div className="w-8 h-1 bg-gray-700/60 rounded-full" />
                </div>

                {/* Video Content Canvas */}
                <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-gray-950 flex flex-col justify-end select-none">
                  {/* Creator Photo Background */}
                  <img
                    src="/assets/creator_hero_portrait.jpg"
                    alt="Creator talking directly to camera"
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                    }}
                  />

                  {/* Gradient overlay for caption readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none" />

                  {/* Dynamic Caption Element on video */}
                  <div className="relative z-10 px-4 pb-14 text-center">
                    <div className="inline-block transform -rotate-1">
                      <div className="text-white font-black text-xl sm:text-2xl tracking-wide uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-none">
                        IT'S NOT JUST
                      </div>
                      <div className="mt-1">
                        <span className="inline-block bg-[#FACC15] text-black font-black text-2xl sm:text-3xl px-2.5 py-0.5 rounded shadow-lg uppercase tracking-wider">
                          A WEBSITE...
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Video Scrubber & Play Bar */}
                  <div className="relative z-10 px-4 pb-3 pt-2 bg-gradient-to-t from-black/80 to-transparent">
                    {/* Progress Bar */}
                    <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden mb-2 relative">
                      <div className="bg-indigo-500 h-full w-[35%] rounded-full relative">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow" />
                      </div>
                    </div>

                    {/* Controls & Timestamp */}
                    <div className="flex items-center justify-between text-white/90 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        <span>0:12 / 0:45</span>
                      </div>
                      <span className="text-[10px] text-white/60 tracking-wider">9:16 UGC</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. STORYTELLING FRAMEWORK SECTION                                         */}
      {/* ========================================================================= */}
      <section
        id="storytelling"
        className="relative py-20 sm:py-28 bg-gradient-to-b from-[#F5F3FF]/70 via-[#FFF7ED]/50 to-[#F0FDF4]/60 border-y border-gray-200/50"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Section Header with Creator Storytelling Principle */}
          <div className="relative text-center max-w-2xl mx-auto mb-16 sm:mb-20">
            {/* Left handwritten annotation */}
            <div className="hidden sm:block absolute -top-10 -left-12 text-left select-none -rotate-6">
              <span className="font-handwriting text-2xl text-purple-900/80 font-bold block">
                A simple storytelling flow
              </span>
              <svg className="w-6 h-6 text-purple-900/70 ml-6" viewBox="0 0 50 50" fill="none">
                <path d="M 12 4 Q 4 20 18 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 10 32 L 18 36 L 22 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Right handwritten annotation */}
            <div className="hidden sm:block absolute -top-12 -right-16 text-right select-none rotate-3">
              <span className="font-handwriting text-xl text-gray-700 font-bold block leading-tight max-w-[200px]">
                A structure used by great storytellers, creators & speakers
              </span>
              <svg className="w-6 h-6 text-gray-700 ml-auto mr-4" viewBox="0 0 50 50" fill="none">
                <path d="M 38 4 Q 46 20 32 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 40 32 L 32 36 L 28 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-950 mb-4">
              Turn Your Ideas Into <br className="hidden sm:inline" />
              Stories People Care About
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed">
              Great content isn't just what you say. It's <span className="font-bold text-gray-900">how</span> you say it. Use a simple, proven structure to make your message stick.
            </p>
          </div>

          {/* 4 Connected Framework Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            
            {/* Step 1: Hook */}
            <div className="flex flex-col items-center text-center bg-white/90 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-rose-100 shadow-xl shadow-rose-500/5 hover:-translate-y-1.5 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-2xl shadow-inner mb-4">
                🧲
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-1">
                1. Hook
              </h3>
              <p className="text-xs text-gray-500 font-medium mb-5 min-h-[32px]">
                Grab attention in the first few seconds.
              </p>
              
              {/* Creator Quote / Tip Box */}
              <div className="w-full bg-[#FFF5F5] rounded-2xl p-4 text-left border border-rose-100/80 mt-auto">
                <span className="text-rose-400 font-serif text-2xl leading-none block -mb-2">“</span>
                <p className="text-xs text-gray-700 font-medium italic leading-relaxed">
                  Ask a question, show a surprising fact, or make a bold statement.
                </p>
              </div>
            </div>

            {/* Step 2: Conflict */}
            <div className="flex flex-col items-center text-center bg-white/90 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-amber-100 shadow-xl shadow-amber-500/5 hover:-translate-y-1.5 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-2xl shadow-inner mb-4">
                ⚡
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-1">
                2. Conflict
              </h3>
              <p className="text-xs text-gray-500 font-medium mb-5 min-h-[32px]">
                Show the problem, challenge or frustration.
              </p>

              {/* Creator Quote / Tip Box */}
              <div className="w-full bg-[#FFFBEB] rounded-2xl p-4 text-left border border-amber-100/80 mt-auto">
                <span className="text-amber-400 font-serif text-2xl leading-none block -mb-2">“</span>
                <p className="text-xs text-gray-700 font-medium italic leading-relaxed">
                  Make it relatable. This is where people feel seen.
                </p>
              </div>
            </div>

            {/* Step 3: Journey */}
            <div className="flex flex-col items-center text-center bg-white/90 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-purple-100 shadow-xl shadow-purple-500/5 hover:-translate-y-1.5 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center text-2xl shadow-inner mb-4">
                🗺️
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-1">
                3. Journey
              </h3>
              <p className="text-xs text-gray-500 font-medium mb-5 min-h-[32px]">
                Take them through your process, story or lessons.
              </p>

              {/* Creator Quote / Tip Box */}
              <div className="w-full bg-[#FAF5FF] rounded-2xl p-4 text-left border border-purple-100/80 mt-auto">
                <span className="text-purple-400 font-serif text-2xl leading-none block -mb-2">“</span>
                <p className="text-xs text-gray-700 font-medium italic leading-relaxed">
                  <span className="font-bold text-gray-900">Be real.</span> Share challenges, what you tried and what you learned.
                </p>
              </div>
            </div>

            {/* Step 4: Outcome */}
            <div className="flex flex-col items-center text-center bg-white/90 backdrop-blur-sm p-6 sm:p-7 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-500/5 hover:-translate-y-1.5 transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-inner mb-4">
                🏆
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-1">
                4. Outcome
              </h3>
              <p className="text-xs text-gray-500 font-medium mb-5 min-h-[32px]">
                End with the result, insight or next step.
              </p>

              {/* Creator Quote / Tip Box */}
              <div className="w-full bg-[#ECFDF5] rounded-2xl p-4 text-left border border-emerald-100/80 mt-auto">
                <span className="text-emerald-400 font-serif text-2xl leading-none block -mb-2">“</span>
                <p className="text-xs text-gray-700 font-medium italic leading-relaxed">
                  Give a clear takeaway. Inspire them to take action (or think differently).
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. BEFORE YOU RECORD SECTION (Storytelling Prompts)                       */}
      {/* ========================================================================= */}
      <BeforeYouRecordSection />

      {/* ========================================================================= */}
      {/* 5. WORKFLOW SECTION                                                       */}
      {/* ========================================================================= */}
      <section
        id="workflow"
        className="relative py-20 sm:py-28 bg-[#FAFAFC] overflow-hidden"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          {/* Header */}
          <div className="relative text-center max-w-xl mx-auto mb-16">
            {/* Handwritten doodle */}
            <div className="hidden sm:block absolute -top-8 -left-10 text-left select-none -rotate-3">
              <span className="font-handwriting text-2xl text-gray-700 font-bold block">
                Same tools. <br />
                A more creative you.
              </span>
              <svg className="w-6 h-6 text-gray-700 ml-12 -mt-1" viewBox="0 0 50 50" fill="none">
                <path d="M 12 4 Q 4 20 18 36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 10 32 L 18 36 L 22 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-950 mb-3">
              Your Workflow, Supercharged
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-medium">
              Use the tools you already know. Bring them together in Caption Studio.
            </p>
          </div>

          {/* 3 Step Connected Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Step 1: Clipchamp / Editor SRT */}
            <div className="relative bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-lg shadow-gray-200/40 flex flex-col items-start hover:border-indigo-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  video_file
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-950 mb-2">
                1. Get your transcript
              </h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Export SRT from tools like Microsoft Clipchamp (or any editor).
              </p>
            </div>

            {/* Step 2: ChatGPT / Creative Plan */}
            <div className="relative bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-lg shadow-gray-200/40 flex flex-col items-start hover:border-emerald-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  psychology
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-950 mb-2">
                2. Generate creative JSON
              </h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Use ChatGPT to turn your transcript into a dynamic creative plan.
              </p>
            </div>

            {/* Step 3: Caption Studio */}
            <div className="relative bg-white rounded-3xl p-6 sm:p-7 border-2 border-indigo-500/80 shadow-xl shadow-indigo-500/10 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-5 shadow-md shadow-indigo-500/30">
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  play_circle
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-950 mb-2">
                3. Bring it to life
              </h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Import, edit, preview and export directly in Caption Studio.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FINAL CTA SECTION                                                      */}
      {/* ========================================================================= */}
      <section
        id="inspire"
        className="relative py-20 sm:py-28 bg-gradient-to-b from-[#FAFAFC] via-indigo-50/40 to-[#F5F3FF] overflow-hidden text-center"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
          
          {/* Left handwritten annotation */}
          <div className="hidden md:block absolute bottom-8 left-4 text-left select-none -rotate-6">
            <span className="font-handwriting text-2xl text-gray-700 font-bold block leading-tight">
              Different ideas. <br />
              Infinite possibilities. ↗
            </span>
          </div>

          {/* Right handwritten annotation + smiley */}
          <div className="hidden md:block absolute bottom-8 right-6 text-right select-none rotate-3">
            <span className="font-handwriting text-2xl text-gray-800 font-black block leading-tight">
              Storytell. <br />
              Create. <br />
              Share. <br />
              Repeat.
            </span>
            <span className="text-3xl block mt-2">🙂</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-950 mb-4">
            Got something to say?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 font-medium mb-10 max-w-lg mx-auto">
            Turn it into something people remember.
          </p>

          {/* Big Action Button */}
          <div className="inline-flex flex-col items-center relative">
            {/* Sparkle decorative doodles */}
            <div className="absolute -left-7 top-1/2 -translate-y-1/2 text-indigo-400 text-xl font-bold select-none">
              ˗ˏˋ
            </div>
            <div className="absolute -right-7 top-1/2 -translate-y-1/2 text-indigo-400 text-xl font-bold select-none">
              ˎˊ˗
            </div>

            <button
              onClick={() => navigate('/import')}
              className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-lg sm:text-xl font-black shadow-2xl shadow-indigo-500/35 hover:shadow-indigo-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-200 cursor-pointer"
            >
              <span>Start Creating Now</span>
              <svg
                className="w-6 h-6 stroke-current stroke-2 fill-none"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
            <p className="text-xs font-semibold text-gray-400 mt-4">
              Turn ideas into content people remember.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="w-full bg-white border-t border-gray-200/70 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-black">
              C
            </div>
            <span className="font-bold text-gray-800">Caption Studio</span>
            <span>— UGC Storytelling & Caption Engine</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/import')}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Studio
            </button>
            <a href="#storytelling" className="hover:text-indigo-600 transition-colors">
              Story Framework
            </a>
            <a href="#before-you-record" className="hover:text-indigo-600 transition-colors">
              Before You Record
            </a>
            <a href="#workflow" className="hover:text-indigo-600 transition-colors">
              Workflow
            </a>
          </div>

          <div>
            <span>Crafted for creators & storytellers</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
