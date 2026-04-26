import React, { useRef } from 'react';
import { MemeConcept, VisualEffect, MemeStyle } from '../types';
import { DraggableEye } from './DraggableEye';
import { Download } from 'lucide-react';

interface MemeDisplayProps {
  imageSrc: string;
  concept: MemeConcept;
}

export const MemeDisplay: React.FC<MemeDisplayProps> = ({ imageSrc, concept }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine CSS filter classes
  const getFilterClass = (effect: VisualEffect) => {
    switch (effect) {
      case VisualEffect.DEEP_FRY:
        return 'contrast-[2.0] saturate-[3.0] sepia-[0.3] hue-rotate-[-15deg] brightness-110';
      case VisualEffect.B_AND_W_SAD:
        return 'grayscale-[1] brightness-75 contrast-125';
      case VisualEffect.VHS:
        return 'contrast-[1.1] brightness-[1.1] saturate-[1.1] sepia-[0.3] blur-[0.5px]';
      case VisualEffect.GLITCH:
        // Base filter for glitch
        return 'contrast-125 saturate-150';
      default:
        return '';
    }
  };

  // Determine styles for the container specifically for Twitter-style captions
  const isCaptionStyle = !!concept.caption && !concept.topText && !concept.bottomText;

  const handleDownload = () => {
     // A simple download mechanism for the raw image, 
     // Implementing full DOM-to-Image client side without libraries is complex 
     // but we can offer to download the source image or prompt the user to screenshot.
     // For this MVP, we will rely on browser screenshots as "Download" logic is restricted without html2canvas.
     alert("Pro Tip: On mobile, long press to save. On desktop, use your screenshot tool (Win+Shift+S / Cmd+Shift+4) to capture the highest quality meme!");
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
      
      {/* Meme Rendering Area */}
      <div 
        ref={containerRef}
        className={`relative overflow-hidden bg-black shadow-2xl rounded-lg border-4 ${
          concept.style === MemeStyle.ABSURDIST ? 'border-purple-500' : 
          concept.style === MemeStyle.ROAST ? 'border-red-500' : 'border-zinc-800'
        }`}
      >
        {/* Caption Bar (Twitter Style) */}
        {isCaptionStyle && (
          <div className="bg-white p-4 text-left w-full border-b border-gray-200">
             <p className="text-black text-xl md:text-2xl font-sans font-semibold leading-tight">
               {concept.caption}
             </p>
          </div>
        )}

        {/* Image Container with Relative positioning for overlays */}
        <div className="relative w-full">
          
          {/* Main Image */}
          <img 
            src={imageSrc} 
            alt="Meme Source" 
            className={`w-full h-auto block relative z-10 ${getFilterClass(concept.visualEffect)}`}
          />

          {/* GLITCH EFFECT LAYERS */}
          {concept.visualEffect === VisualEffect.GLITCH && (
            <>
              {/* Cyan Shift Layer */}
              <img 
                src={imageSrc} 
                className="absolute inset-0 w-full h-full mix-blend-screen opacity-70 z-0 translate-x-[3px] pointer-events-none"
                style={{ filter: 'sepia(100%) saturate(500%) hue-rotate(130deg)' }} 
                alt=""
              />
              {/* Red Shift Layer */}
              <img 
                src={imageSrc} 
                className="absolute inset-0 w-full h-full mix-blend-screen opacity-70 z-0 -translate-x-[3px] pointer-events-none"
                style={{ filter: 'sepia(100%) saturate(500%) hue-rotate(-50deg)' }} 
                alt=""
              />
              {/* Scanline Glitch Blocks Overlay */}
               <div className="absolute inset-0 z-20 opacity-10 pointer-events-none" 
                   style={{ 
                     backgroundImage: `repeating-linear-gradient(transparent 0px, transparent 2px, #000 3px)`
                   }}
               />
            </>
          )}

          {/* VHS EFFECT OVERLAYS */}
          {concept.visualEffect === VisualEffect.VHS && (
            <>
              {/* Scanlines */}
              <div className="absolute inset-0 z-20 pointer-events-none opacity-20"
                   style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }}
              />
              {/* Vignette */}
              <div className="absolute inset-0 z-20 pointer-events-none"
                   style={{ background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)' }}
              />
              {/* Date Stamp (Optional retro touch) */}
              <div className="absolute bottom-4 left-4 z-30 font-mono text-yellow-500/80 text-lg tracking-widest pointer-events-none" style={{ textShadow: '2px 2px 0px black' }}>
                 PLAY {new Date().toLocaleDateString()}
              </div>
            </>
          )}

          {/* Deep Fry Noise Overlay (Optional extra texture) */}
          {concept.visualEffect === VisualEffect.DEEP_FRY && (
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay z-20"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
            />
          )}

          {/* Lens Flare Overlay */}
          {concept.visualEffect === VisualEffect.LENS_FLARE && (
             <div className="absolute inset-0 pointer-events-none mix-blend-screen bg-gradient-to-tr from-transparent via-red-500/20 to-yellow-200/40 z-20">
                <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-[60px] opacity-60"></div>
             </div>
          )}

          {/* Laser Eyes (Draggable) */}
          {concept.visualEffect === VisualEffect.LASER_EYES && (
            <>
               <DraggableEye initialX={100} initialY={100} containerRef={containerRef} />
               <DraggableEye initialX={160} initialY={100} containerRef={containerRef} />
            </>
          )}

          {/* Classic Impact Text Overlays */}
          {!isCaptionStyle && (
            <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none z-30">
              {concept.topText && (
                <h2 className="text-center text-4xl md:text-6xl font-meme text-white stroke-black px-2 break-words leading-none">
                  {concept.topText}
                </h2>
              )}
              {concept.bottomText && (
                <h2 className="text-center text-4xl md:text-6xl font-meme text-white stroke-black px-2 break-words leading-none mt-auto">
                  {concept.bottomText}
                </h2>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center text-zinc-400 text-sm px-2">
         <div className="flex gap-2 items-center">
            <span className={`px-2 py-1 rounded text-xs font-bold ${
                concept.style === MemeStyle.RELATABLE ? 'bg-blue-900 text-blue-200' :
                concept.style === MemeStyle.ROAST ? 'bg-red-900 text-red-200' :
                'bg-purple-900 text-purple-200'
            }`}>
              {concept.style}
            </span>
            <span>{concept.visualEffect !== 'NONE' && `+ ${concept.visualEffect.replace(/_/g, ' ')}`}</span>
         </div>
         <button 
           onClick={handleDownload}
           className="flex items-center gap-1 hover:text-white transition-colors"
         >
           <Download size={16} /> Save
         </button>
      </div>
      
      <p className="text-zinc-500 italic text-center text-sm border-l-2 border-zinc-800 pl-4 py-1">
        AI Logic: "{concept.explanation}"
      </p>
    </div>
  );
};