import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: 'upload_file',
      title: 'Import Assets',
      description: 'Upload MP4, MOV, MP3 files and import subtitles or Creative JSON instantly.',
    },
    {
      icon: 'palette',
      title: 'Caption Styling',
      description: 'Apply professional fonts, background highlights, and alignment properties.',
    },
    {
      icon: 'layers',
      title: 'Visual Composition',
      description: 'Layer dynamic frames, canvas backdrop, brand watermarks, and progress bars.',
    },
    {
      icon: 'ios_share',
      title: 'Direct Export',
      description: 'Render directly to 4K / Full HD MP4 or download raw SRT script data.',
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-canvas-margin bg-surface-container overflow-y-auto text-center">
      <div className="max-w-3xl w-full py-8 px-6 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl canvas-shadow flex flex-col items-center gap-6">
        {/* Brand Icon */}
        <div className="w-20 h-20 rounded-2xl bg-primary-container/10 text-primary flex items-center justify-center shadow-xs">
          <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            closed_caption
          </span>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-lg font-headline-lg font-bold text-on-surface">
            Welcome to Caption Studio
          </h1>
          <p className="text-body-md font-body-md text-on-surface-variant max-w-lg mx-auto">
            The clinical, high-precision creative environment. Style, compose, and finalize your video captions with surgical precision.
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => navigate('/import')}
          className="px-8 py-3.5 shadow-lg shadow-primary-container/20 text-body-md"
        >
          <span className="material-symbols-outlined font-normal text-md">add_circle</span>
          Create New Project
        </Button>

        <div className="h-px bg-outline-variant/40 w-full my-2"></div>

        {/* Features Grid */}
        <div className="w-full text-left">
          <h3 className="text-label-caps font-label-caps text-outline uppercase tracking-wider text-[11px] mb-4">
            Studio Workflows
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feat) => (
              <Card key={feat.title} className="flex gap-4 p-4 hover:border-primary/40">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined">{feat.icon}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="text-body-md font-bold text-on-surface">{feat.title}</h4>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
