import React, { useState, useRef, useLayoutEffect } from 'react';
import html2canvas from 'html2canvas';
import {
    Upload,
    Download,
    Type,
    Palette,
    AlignCenter,
    AlignLeft,
    AlignRight,
    Image as ImageIcon,
    ChevronUp,
    ChevronDown,
    Maximize2
} from 'lucide-react';

const POST_WIDTH = 1080;
const POST_HEIGHT = 1250;

/**
 * PostContent: High-fidelity rendering engine.
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
    textAlign,
    showBreakingNews,
    fontWeight,
    letterSpacing
}: any) => {
    const renderText = () => {
        if (!highlightText.trim() || !text.includes(highlightText)) {
            return text;
        }

        const escaped = highlightText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const parts = text.split(new RegExp(`(${escaped})`, "gi"));

        return (
            <>
                {parts.map((part: string, i: number) =>
                    part.toLowerCase() === highlightText.toLowerCase() ? (
                        <span key={i} style={{
                            color: highlightColor,
                            fontWeight: 800,
                            display: 'inline',
                            unicodeBidi: 'isolate'
                        }}>{part}</span>
                    ) : (
                        <span key={i} style={{ display: 'inline', unicodeBidi: 'isolate' }}>{part}</span>
                    )
                )}
            </>
        );
    };

    return (
        <div
            className="post-render-root"
            style={{
                width: POST_WIDTH,
                height: POST_HEIGHT,
                backgroundColor: bgColor,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* Background Image */}
            {imageUrl && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0,
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                />
            )}

            {/* Brand Identity Layer */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                padding: '55px',
                zIndex: 20,
                display: 'flex',
                justifyContent: 'flex-start'
            }}>
                <img
                    src={logoUrl}
                    alt="Tazaad"
                    style={{
                        height: `${logoSize}px`,
                        width: 'auto',
                        objectFit: 'contain',
                        display: 'block'
                    }}
                    crossOrigin="anonymous"
                />
            </div>

            {/* Narrative Layer */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '80px',
                    alignItems: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center',
                    justifyContent: 'flex-end',
                    paddingBottom: `${((100 - textY) / 100) * (POST_HEIGHT - 160) + bottomBarHeight + 40}px`,
                    background: `linear-gradient(to bottom, 
                            transparent 0%, 
                            rgba(0,0,0,0) ${Math.max(0, textY - gradientCoverage * 0.4)}%, 
                            rgba(0,0,10,${0.85 * (gradientCoverage / 100)}) ${textY - 10}%, 
                            rgba(0,0,20,1.0) 100%)`
                }}
            >
                <div style={{
                    marginTop: textY === 50 ? '0' : textY < 50 ? '0' : 'auto',
                    marginBottom: textY === 50 ? '0' : textY > 50 ? '0' : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center',
                    width: '100%'
                }}>
                    {showBreakingNews && (
                        <div
                            dir="rtl"
                            style={{
                                backgroundColor: 'var(--accent-red)',
                                color: 'white',
                                padding: '3px 18px', // Minimal and balanced
                                borderRadius: '2px',
                                fontSize: `${fontSize * 0.75}px`,
                                fontWeight: 600,
                                fontFamily: 'var(--font-sindhi)',
                                marginBottom: '2px',
                                display: 'inline-block',
                                lineHeight: 1.2,     // Better vertical balance for Sindhi characters
                                textRendering: 'optimizeLegibility',
                                WebkitFontSmoothing: 'antialiased',
                                fontFeatureSettings: '"kern" 1, "liga" 1, "clig" 1, "calt" 1, "palt" 1',
                                fontVariantLigatures: 'contextual',
                                letterSpacing: `${letterSpacing}em`,
                                wordSpacing: 'normal',
                                whiteSpace: 'nowrap',
                                unicodeBidi: 'isolate',
                                transform: 'translateZ(0)'
                            }}
                        >
                            بريڪنگ نيوز
                        </div>
                    )}
                    <div
                        dir="rtl"
                        className="lateef-bold"
                        style={{
                            color: 'white',
                            fontSize: `${fontSize}px`,
                            lineHeight: lineHeight,
                            textAlign: textAlign,
                            fontWeight: fontWeight,
                            letterSpacing: `${letterSpacing}em`,
                            width: '100%',
                            textRendering: 'optimizeLegibility',
                            WebkitFontSmoothing: 'antialiased',
                            fontFeatureSettings: '"kern" 1, "liga" 1, "clig" 1, "calt" 1, "palt" 1',
                            fontVariantLigatures: 'contextual',
                            wordSpacing: 'normal',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            transform: 'translateZ(0)'
                        }}
                    >
                        {renderText()}
                    </div>
                </div>
            </div>

            {/* Bottom Identity Bar */}
            <div
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'var(--accent-red)',
                    zIndex: 30,
                    height: `${bottomBarHeight}px`
                }}
            />
        </div>
    );
};

export default function PostDesigner() {
    // --- State ---
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [text, setText] = useState("");
    const [highlightText, setHighlightText] = useState("");
    const [logoUrl, setLogoUrl] = useState("/TazaadLogo-01.png");
    const [bgColor, setBgColor] = useState("#0f172a");
    const [highlightColor, setHighlightColor] = useState("#facc15");
    const [fontSize, setFontSize] = useState(82);
    const [lineHeight, setLineHeight] = useState(1.1);
    const [textY, setTextY] = useState(85);
    const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
    const [gradientCoverage, setGradientCoverage] = useState(85);
    const [logoSize, setLogoSize] = useState(80);
    const [bottomBarHeight, setBottomBarHeight] = useState(18);
    const [showBreakingNews, setShowBreakingNews] = useState(false);
    const [fontWeight, setFontWeight] = useState(700);
    const [letterSpacing, setLetterSpacing] = useState(-0.02);
    const [scale, setScale] = useState(1);
    const [isExporting, setIsExporting] = useState(false);

    // --- Refs ---
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const masterArtboardRef = useRef<HTMLDivElement>(null);

    // --- Canva-style Fluid Scaling ---
    useLayoutEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return;
            const { clientWidth, clientHeight } = containerRef.current;
            const padding = 120;
            const availableW = clientWidth - padding;
            const availableH = clientHeight - padding;
            const scaleX = availableW / POST_WIDTH;
            const scaleY = availableH / POST_HEIGHT;
            const newScale = Math.min(scaleX, scaleY, 1);
            setScale(newScale);
        };

        const observer = new ResizeObserver(handleResize);
        if (containerRef.current) observer.observe(containerRef.current);
        handleResize();
        return () => observer.disconnect();
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setImageUrl(URL.createObjectURL(file));
    };

    const handleDownload = async () => {
        if (!masterArtboardRef.current) return;
        setIsExporting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 400));
            if (typeof document !== 'undefined' && 'fonts' in document) {
                await (document as any).fonts.ready;
            }
            const canvas = await html2canvas(masterArtboardRef.current, {
                scale: 4,
                useCORS: true,
                allowTaint: false,
                backgroundColor: bgColor,
                width: POST_WIDTH,
                height: POST_HEIGHT,
                scrollX: 0,
                scrollY: 0,
                windowWidth: POST_WIDTH,
                windowHeight: POST_HEIGHT,
                x: 0,
                y: 0,
                logging: false,
                imageTimeout: 0,
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

    return (
        <div className="designer-wrapper" style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
            {/* Top Header */}
            <header style={{
                height: '60px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                backgroundColor: 'var(--bg-panel)',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: 'var(--accent-red)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 900,
                        fontSize: '18px'
                    }}>T</div>
                    <div>
                        <h1 style={{ fontSize: '14px', fontWeight: 800, color: 'white', letterSpacing: '-0.01em' }}>Tazaad Post</h1>
                        <p style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Designer v2.0</p>
                    </div>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={isExporting}
                    style={{
                        padding: '8px 20px',
                        backgroundColor: 'var(--accent-red)',
                        color: 'white',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 8px 20px -6px rgba(220, 38, 38, 0.4)'
                    }}
                >
                    {isExporting ? 'Exporting...' : <><Download size={16} /> Download PNG</>}
                </button>
            </header>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Sidebar Controls */}
                <aside style={{
                    width: '340px',
                    backgroundColor: 'var(--bg-panel)',
                    borderRight: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 50
                }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

                        {/* Visuals Section */}
                        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>Visuals</span>
                                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                            </div>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="glass"
                                style={{
                                    height: '110px',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                                {imageUrl ? (
                                    <>
                                        <img src={imageUrl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
                                        <div style={{ position: 'relative', zIndex: 1, fontSize: '10px', fontWeight: 800, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '6px' }}>Change Texture</div>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon size={20} color="var(--text-muted)" />
                                        <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Upload Image</span>
                                    </>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Background</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                                        <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }} />
                                        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{bgColor.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Highlight</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                                        <input type="color" value={highlightColor} onChange={e => setHighlightColor(e.target.value)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }} />
                                        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{highlightColor.toUpperCase()}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Branding Section */}
                        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>Branding</span>
                                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '4px', backgroundColor: 'var(--bg-card)', borderRadius: '14px' }}>
                                <button
                                    onClick={() => setLogoUrl('/TazaadLogo-01.png')}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '10px',
                                        backgroundColor: logoUrl === '/TazaadLogo-01.png' ? 'var(--accent-red)' : 'transparent',
                                        color: 'white',
                                        fontSize: '11px',
                                        fontWeight: 800
                                    }}
                                >
                                    Logo 01
                                </button>
                                <button
                                    onClick={() => setLogoUrl('/TazaadLogo-02.png')}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '10px',
                                        backgroundColor: logoUrl === '/TazaadLogo-02.png' ? 'var(--accent-red)' : 'transparent',
                                        color: 'white',
                                        fontSize: '11px',
                                        fontWeight: 800
                                    }}
                                >
                                    Logo 02
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Logo Size</label>
                                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{logoSize}px</span>
                                </div>
                                <input type="range" min="30" max="250" value={logoSize} onChange={e => setLogoSize(parseInt(e.target.value))} />
                            </div>
                        </section>

                        {/* Narrative Section */}
                        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>Narrative</span>
                                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>Breaking News Label</span>
                                <button
                                    onClick={() => {
                                        setShowBreakingNews(!showBreakingNews);
                                        if (!showBreakingNews) {
                                            setTextAlign('right');
                                        }
                                    }}
                                    style={{
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        backgroundColor: showBreakingNews ? 'var(--accent-red)' : 'var(--bg-app)',
                                        color: showBreakingNews ? 'white' : 'var(--text-secondary)',
                                        border: '1px solid ' + (showBreakingNews ? 'var(--accent-red)' : 'var(--border-subtle)'),
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    {showBreakingNews ? 'ON' : 'OFF'}
                                </button>
                            </div>

                            <textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                dir="rtl"
                                placeholder="توهان جي لکڻ هتي..."
                                className="lateef-bold"
                                style={{
                                    width: '100%',
                                    height: '140px',
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '20px',
                                    padding: '16px',
                                    color: 'white',
                                    fontSize: '20px',
                                    resize: 'none',
                                    outline: 'none'
                                }}
                            />

                            <div style={{ position: 'relative' }}>
                                <Type size={14} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    value={highlightText}
                                    onChange={e => setHighlightText(e.target.value)}
                                    dir="rtl"
                                    placeholder="لفظ نمايان ڪريو"
                                    className="lateef-bold"
                                    style={{
                                        width: '100%',
                                        backgroundColor: 'var(--bg-card)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '12px',
                                        padding: '10px 40px 10px 12px',
                                        color: 'white',
                                        fontSize: '16px',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </section>

                        {/* Adjustments Section */}
                        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>Adjustments</span>
                                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                            </div>

                            {/* Text Size */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Font Size</label>
                                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{fontSize}px</span>
                                </div>
                                <input type="range" min="40" max="180" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} />
                            </div>

                            {/* Font Weight */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Font Weight</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {[400, 500, 600, 700, 800, 900].map(weight => (
                                        <button
                                            key={weight}
                                            onClick={() => setFontWeight(weight)}
                                            style={{
                                                padding: '6px 10px',
                                                borderRadius: '8px',
                                                backgroundColor: fontWeight === weight ? 'var(--accent-red)' : 'var(--bg-card)',
                                                color: 'white',
                                                fontSize: '10px',
                                                fontWeight: weight,
                                                border: '1px solid ' + (fontWeight === weight ? 'var(--accent-red)' : 'var(--border-subtle)')
                                            }}
                                        >
                                            {weight === 400 ? 'Reg' : weight === 500 ? 'Med' : weight === 600 ? 'Semi' : weight === 700 ? 'Bold' : weight === 800 ? 'Ext' : 'Blk'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Spacing (Kerning) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Letter Spacing</label>
                                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{letterSpacing}em</span>
                                </div>
                                <input type="range" min="-0.1" max="0.1" step="0.01" value={letterSpacing} onChange={e => setLetterSpacing(parseFloat(e.target.value))} />
                            </div>

                            {/* Alignment */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Alignment</label>
                                <div style={{ display: 'flex', gap: '4px', padding: '4px', backgroundColor: 'var(--bg-card)', borderRadius: '12px' }}>
                                    <button onClick={() => setTextAlign('right')} style={{ flex: 1, padding: '8px', borderRadius: '8px', backgroundColor: textAlign === 'right' ? 'var(--accent-red)' : 'transparent', color: 'white' }}><AlignRight size={16} /></button>
                                    <button onClick={() => setTextAlign('center')} style={{ flex: 1, padding: '8px', borderRadius: '8px', backgroundColor: textAlign === 'center' ? 'var(--accent-red)' : 'transparent', color: 'white' }}><AlignCenter size={16} /></button>
                                    <button onClick={() => setTextAlign('left')} style={{ flex: 1, padding: '8px', borderRadius: '8px', backgroundColor: textAlign === 'left' ? 'var(--accent-red)' : 'transparent', color: 'white' }}><AlignLeft size={16} /></button>
                                </div>
                            </div>

                            {/* Vertical Position */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <label style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vertical Pos</label>
                                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{textY}%</span>
                                </div>
                                <input type="range" min="10" max="92" value={textY} onChange={e => setTextY(parseInt(e.target.value))} />
                            </div>
                        </section>
                    </div>

                    <div style={{ padding: '24px', borderTop: '1px solid var(--border-subtle)' }}>
                        <button
                            onClick={handleDownload}
                            disabled={isExporting || !text}
                            style={{
                                width: '100%',
                                padding: '16px',
                                backgroundColor: 'var(--accent-red)',
                                color: 'white',
                                borderRadius: '16px',
                                fontSize: '14px',
                                fontWeight: 900,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                boxShadow: '0 12px 24px -8px rgba(220, 38, 38, 0.5)'
                            }}
                        >
                            {isExporting ? 'Capturing...' : <><Download size={18} /> Export Post</>}
                        </button>
                    </div>
                </aside>

                {/* Live Preview Area */}
                <main ref={containerRef} style={{ flex: 1, position: 'relative', display: 'grid', placeItems: 'center', padding: '40px', backgroundColor: 'var(--bg-main)', overflow: 'hidden' }}>
                    {/* Subtle Grid */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0.1,
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '32px 32px'
                    }} />

                    {/* Artboard Preview */}
                    <div style={{ width: POST_WIDTH * scale, height: POST_HEIGHT * scale, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <div
                            className="premium-shadow"
                            style={{
                                width: POST_WIDTH,
                                height: POST_HEIGHT,
                                transform: `scale(${scale})`,
                                transformOrigin: 'center center',
                                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                flexShrink: 0
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
                                showBreakingNews={showBreakingNews}
                                fontWeight={fontWeight}
                                letterSpacing={letterSpacing}
                            />
                        </div>
                    </div>

                    {/* Scale Indicator */}
                    <div style={{ position: 'absolute', bottom: '24px', right: '24px', padding: '6px 12px', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '8px', fontSize: '10px', fontWeight: 800, color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                        {Math.round(scale * 100)}% View
                    </div>
                </main>
            </div>

            {/* Hidden Master Artboard for Export */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: POST_WIDTH,
                height: POST_HEIGHT,
                opacity: 0,
                pointerEvents: 'none',
                zIndex: -100,
                overflow: 'hidden'
            }}>
                <div ref={masterArtboardRef} style={{ width: POST_WIDTH, height: POST_HEIGHT }}>
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
                        showBreakingNews={showBreakingNews}
                        fontWeight={fontWeight}
                        letterSpacing={letterSpacing}
                    />
                </div>
            </div>
        </div>
    );
}
