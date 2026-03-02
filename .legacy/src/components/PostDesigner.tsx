"use client";

import { useState, useRef, useLayoutEffect } from "react";
import html2canvas from "html2canvas";

const POST_WIDTH = 1080;
const POST_HEIGHT = 1250;

/**
 * PostContent: The source of truth for rendering.
 * Shared between the Live Preview and the Export Capture to ensure 100% fidelity.
 */
const PostContent = ({
  imageUrl,
  text,
  highlightText,
  logoUrl,
  bgColor,
  highlightColor,
  fontSize,
  lineHeight,
  textY,
  gradientCoverage,
  bottomBarHeight,
  logoSize,
  textAlign
}: any) => {
  const renderText = () => {
    if (!highlightText.trim() || !text.includes(highlightText)) {
      return <span>{text}</span>;
    }

    const escaped = highlightText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));

    return (
      <>
        {parts.map((part: string, i: number) =>
          part.toLowerCase() === highlightText.toLowerCase() ? (
            <span key={i} className="font-bold" style={{ color: highlightColor }}>
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div
      className="relative w-[1080px] h-[1250px] overflow-hidden flex flex-col"
      style={{ backgroundColor: bgColor }}
    >
      {/* 1. Background Image */}
      {imageUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* 2. Brand Identity */}
      <div className="absolute top-[50px] left-[50px] z-20">
        <img
          src={logoUrl}
          alt="Tazaad"
          className="object-contain"
          style={{ height: `${logoSize}px` }}
          crossOrigin="anonymous"
        />
      </div>

      {/* 3. Narrative Layer (Intense Adaptive Gradient + Text) */}
      <div
        className="absolute inset-0 z-10 flex flex-col p-[80px]"
        style={{
          alignItems: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center',
          justifyContent: textY === 50 ? 'center' : textY < 50 ? 'flex-start' : 'flex-end',
          paddingTop: textY < 50 ? `${Math.max(80, textY * 12.5)}px` : '80px',
          paddingBottom: textY > 50 ? `${Math.max(80, (100 - textY) * 12.5 + bottomBarHeight)}px` : `${100 + bottomBarHeight}px`,
          background: `linear-gradient(to bottom, 
            transparent 0%, 
            rgba(0,0,0,0) ${Math.max(0, textY - gradientCoverage * 0.6)}%, 
            rgba(0,0,0,${0.95 * (gradientCoverage / 100)}) ${textY}%, 
            rgba(0,0,0,1.0) 100%)`
        }}
      >
        <div
          dir="rtl"
          className="lateef-bold text-white leading-tight w-full"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: lineHeight,
            textAlign: textAlign as any,
            marginTop: textY === 50 ? '0' : textY < 50 ? '0' : 'auto',
            marginBottom: textY === 50 ? '0' : textY > 50 ? '0' : 'auto',
          }}
        >
          {renderText()}
        </div>
      </div>

      {/* 4. Bottom Identity Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-red-600 z-30"
        style={{ height: `${bottomBarHeight}px` }}
      />
    </div>
  );
};

export default function PostDesigner() {
  // --- State ---
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [highlightText, setHighlightText] = useState("");
  const [logoUrl, setLogoUrl] = useState("/tazaad-logo.svg");
  const [bgColor, setBgColor] = useState("#0f172a");
  const [highlightColor, setHighlightColor] = useState("#facc15");
  const [fontSize, setFontSize] = useState(82);
  const [lineHeight, setLineHeight] = useState(1.1);
  const [textY, setTextY] = useState(85); // Default to bottom area as requested
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [gradientCoverage, setGradientCoverage] = useState(85); // Deeper gradient
  const [logoSize, setLogoSize] = useState(80);
  const [bottomBarHeight, setBottomBarHeight] = useState(35);
  const [scale, setScale] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  // --- Refs ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);
  const masterArtboardRef = useRef<HTMLDivElement>(null);

  // --- Canva-style Fluid Scaling ---
  useLayoutEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;

      const padding = 80; // Margin around the artboard
      const availableW = clientWidth - padding;
      const availableH = clientHeight - padding;

      const scaleX = availableW / POST_WIDTH;
      const scaleY = availableH / POST_HEIGHT;

      // Scale to fit, but don't blow up too large for preview crispness
      const newScale = Math.min(scaleX, scaleY, 1);
      setScale(newScale);
    };

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);
    handleResize();

    return () => observer.disconnect();
  }, []);

  // --- Actions ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageUrl(URL.createObjectURL(file));
  };

  const handleDownload = async () => {
    if (!masterArtboardRef.current) return;
    setIsExporting(true);

    try {
      // 1. Mandatory "Settle" delay for React DOM sync
      await new Promise(resolve => setTimeout(resolve, 400));

      // 2. Wait for fonts and images in the MASTER artboard
      if (typeof document !== 'undefined' && 'fonts' in document) {
        await document.fonts.ready;
      }

      const imgs = Array.from(masterArtboardRef.current.querySelectorAll('img'));
      await Promise.all(imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
          // Force re-load to ensure CORS/Fetch logic kicks in within the capture context
          const currentSrc = img.src;
          img.src = '';
          img.src = currentSrc;
        });
      }));

      // 3. High-Res Snapshot (2X) from the HIDDEN master
      // We use the off-screen master artboard which is always 1:1 scale
      const canvas = await html2canvas(masterArtboardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: bgColor,
        width: POST_WIDTH,
        height: POST_HEIGHT,
      });

      const link = document.createElement("a");
      link.download = `tazaad-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export Error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const logos = [
    { name: "Default", url: "/tazaad-logo.svg" },
    { name: "Light", url: "/logo-white.svg" },
    { name: "Bold", url: "/logo-red.svg" },
  ];

  return (
    <div className="h-screen bg-[#050505] text-slate-300 font-sans overflow-hidden flex flex-col">
      {/* Top Header */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#0a0a0c] z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg shadow-red-600/20">T</div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none mb-1">Tazaad Post</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-[0.2em]">Designer v2.0</p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="px-5 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-red-600/10 active:scale-95 disabled:opacity-50"
        >
          {isExporting ? "Capturing..." : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Download PNG</>}
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Control Panel */}
        <aside className="w-80 border-r border-white/5 bg-[#0a0a0c] flex flex-col z-40">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

            {/* Visuals */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Visuals</label>
                <div className="h-[1px] flex-1 ml-4 bg-white/5"></div>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative h-28 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all overflow-hidden"
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {imageUrl ? (
                  <>
                    <img src={imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 transition-all" />
                    <div className="relative z-10 px-3 py-1 bg-black/60 rounded-lg text-[10px] font-bold text-white border border-white/10">Swap Texture</div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Background Image</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-600 uppercase">Overlay</span>
                  <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-6 h-6 rounded bg-transparent border-0 cursor-pointer" />
                    <span className="text-[9px] font-mono text-slate-500">{bgColor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-slate-600 uppercase">Identity</span>
                  <div className="flex items-center gap-1.5 h-10">
                    {logos.map(l => (
                      <button
                        key={l.url}
                        onClick={() => setLogoUrl(l.url)}
                        className={`flex-1 h-full rounded-lg border flex items-center justify-center transition-all ${logoUrl === l.url ? 'border-red-600 bg-red-600/10' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                      >
                        <img src={l.url} className={`h-3 w-auto ${l.name === 'Default' ? '' : 'brightness-200 opacity-60'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Narrative</label>
                <div className="h-[1px] flex-1 ml-4 bg-white/5"></div>
              </div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                dir="rtl"
                className="w-full h-32 bg-white/5 border border-white/5 rounded-2xl p-4 text-white placeholder-slate-700 focus:bg-white/10 focus:border-red-500/30 transition-all resize-none lateef-bold text-xl"
                placeholder="توهان جي لکڻ هتي..."
              />
              <input
                type="text"
                value={highlightText}
                onChange={e => setHighlightText(e.target.value)}
                dir="rtl"
                placeholder="Highlight Word"
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white lateef-bold text-lg focus:border-red-500/30 transition-all"
              />
            </div>

            {/* Typography */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Fine Tune</label>
                <div className="h-[1px] flex-1 ml-4 bg-white/5"></div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Text Size</span>
                    <span className="text-[10px] font-mono text-white">{fontSize}px</span>
                  </div>
                  <input type="range" min="40" max="180" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full accent-red-600 h-1 bg-white/10 rounded-full appearance-none" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Alignment</span>
                    <span className="text-[10px] font-mono text-white capitalize">{textAlign}</span>
                  </div>
                  <div className="flex gap-1.5 px-1">
                    <button onClick={() => setTextAlign('right')} className={`flex-1 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black uppercase tracking-tighter hover:bg-white/10 transition-all ${textAlign === 'right' ? 'bg-red-600/20 text-red-500 border-red-500/50' : ''}`}>Right (RTL)</button>
                    <button onClick={() => setTextAlign('center')} className={`flex-1 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black uppercase tracking-tighter hover:bg-white/10 transition-all ${textAlign === 'center' ? 'bg-red-600/20 text-red-500 border-red-500/50' : ''}`}>Center</button>
                    <button onClick={() => setTextAlign('left')} className={`flex-1 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black uppercase tracking-tighter hover:bg-white/10 transition-all ${textAlign === 'left' ? 'bg-red-600/20 text-red-500 border-red-500/50' : ''}`}>Left</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Line Height</span>
                    <span className="text-[10px] font-mono text-white">{lineHeight}</span>
                  </div>
                  <input type="range" min="0.8" max="2.0" step="0.05" value={lineHeight} onChange={e => setLineHeight(parseFloat(e.target.value))} className="w-full accent-red-600 h-1 bg-white/10 rounded-full appearance-none" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Vertical Pos</span>
                    <span className="text-[10px] font-mono text-white">{textY}%</span>
                  </div>
                  <div className="flex gap-1.5 px-1">
                    <button onClick={() => setTextY(15)} className="flex-1 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black uppercase tracking-tighter hover:bg-white/10 transition-all">Top</button>
                    <button onClick={() => setTextY(50)} className="flex-1 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black uppercase tracking-tighter hover:bg-white/10 transition-all text-red-500">Center</button>
                    <button onClick={() => setTextY(85)} className="flex-1 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black uppercase tracking-tighter hover:bg-white/10 transition-all">Bottom</button>
                  </div>
                  <input type="range" min="10" max="92" step="1" value={textY} onChange={e => setTextY(parseInt(e.target.value))} className="w-full accent-red-600 h-1 bg-white/10 rounded-full appearance-none" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-bold text-slate-600 uppercase">Gradient Reach</span>
                    <span className="text-[10px] font-mono text-white">{gradientCoverage}%</span>
                  </div>
                  <input type="range" min="20" max="100" step="5" value={gradientCoverage} onChange={e => setGradientCoverage(parseInt(e.target.value))} className="w-full accent-red-600 h-1 bg-white/10 rounded-full appearance-none" />
                </div>
                <div className="space-y-2 pt-2">
                  <span className="text-[9px] font-bold text-slate-600 uppercase block px-1 mb-2">Highlight Color</span>
                  <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                    <input type="color" value={highlightColor} onChange={e => setHighlightColor(e.target.value)} className="w-full h-8 rounded-lg bg-transparent border-0 cursor-pointer" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] font-bold text-slate-600 uppercase">Logo Size</span>
                      <span className="text-[10px] font-mono text-white">{logoSize}px</span>
                    </div>
                    <input type="range" min="40" max="200" value={logoSize} onChange={e => setLogoSize(parseInt(e.target.value))} className="w-full accent-red-600 h-1 bg-white/10 rounded-full appearance-none" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] font-bold text-slate-600 uppercase">Bottom Bar</span>
                      <span className="text-[10px] font-mono text-white">{bottomBarHeight}px</span>
                    </div>
                    <input type="range" min="0" max="100" value={bottomBarHeight} onChange={e => setBottomBarHeight(parseInt(e.target.value))} className="w-full accent-red-600 h-1 bg-white/10 rounded-full appearance-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleDownload}
                disabled={isExporting || !text}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isExporting ? (
                  "Downloading..."
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download Post
                  </>
                )}
              </button>
              <p className="text-[9px] text-center text-slate-600 mt-4 font-bold uppercase tracking-widest">High-Resolution PNG (1080x1250)</p>
            </div>
          </div>
        </aside>

        {/* Workbench Artboard */}
        <div ref={containerRef} className="flex-1 bg-[#050505] relative flex items-center justify-center p-8 overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{
            backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 1.5px)',
            backgroundSize: '40px 40px'
          }} />

          {/* THE ARTBOARD - CENTERED & SCALED */}
          <div
            ref={artboardRef}
            data-artboard
            className="bg-[#0f172a] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] border border-white/10 overflow-hidden origin-center"
            style={{
              width: POST_WIDTH,
              height: POST_HEIGHT,
              transform: `scale(${scale})`,
              transition: isExporting ? 'none' : 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <PostContent
              imageUrl={imageUrl}
              text={text}
              highlightText={highlightText}
              logoUrl={logoUrl}
              bgColor={bgColor}
              highlightColor={highlightColor}
              fontSize={fontSize}
              lineHeight={lineHeight}
              textY={textY}
              gradientCoverage={gradientCoverage}
              bottomBarHeight={bottomBarHeight}
              logoSize={logoSize}
              textAlign={textAlign}
            />
          </div>

          {/* Scale Indicator */}
          <div className="absolute bottom-6 right-6 flex items-center gap-3">
            <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-bold text-slate-500 border border-white/5">
              {Math.round(scale * 100)}%
            </div>
          </div>
          {/* 🛡️ HIDDEN MASTER ARTBOARD FOR EXPORT (DUAL-PIPELINE) */}
          {/* This renders off-screen at exactly 1:1 scale to ensure absolute export fidelity */}
          <div className="fixed top-[-9999px] left-[-9999px] pointer-events-none opacity-0 shrink-0">
            <div
              ref={masterArtboardRef}
              className="bg-[#0f172a] overflow-hidden"
              style={{ width: POST_WIDTH, height: POST_HEIGHT }}
            >
              <PostContent
                imageUrl={imageUrl}
                text={text}
                highlightText={highlightText}
                logoUrl={logoUrl}
                bgColor={bgColor}
                highlightColor={highlightColor}
                fontSize={fontSize}
                lineHeight={lineHeight}
                textY={textY}
                gradientCoverage={gradientCoverage}
                bottomBarHeight={bottomBarHeight}
                logoSize={logoSize}
                textAlign={textAlign}
              />
            </div>
          </div>
        </div>
      </main>
    </div >
  );
}
