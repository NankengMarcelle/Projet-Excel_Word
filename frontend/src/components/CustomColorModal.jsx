import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CustomColorModal({ initialColor = '#FF0000', onApply, onClose }) {
    const [r, setR] = useState(255);
    const [g, setG] = useState(0);
    const [b, setB] = useState(0);
    const [hex, setHex] = useState('ff0000');
    const [hue, setHue] = useState(0);
    const [sat, setSat] = useState(100);
    const [bright, setBright] = useState(100);

    // Parse initial color
    useEffect(() => {
        if (initialColor && initialColor.startsWith('#')) {
            const h = initialColor.replace('#', '');
            if (h.length === 6) {
                setHex(h.toLowerCase());
                const num = parseInt(h, 16);
                const red = (num >> 16) & 255;
                const green = (num >> 8) & 255;
                const blue = num & 255;
                setR(red); setG(green); setB(blue);
            }
        }
    }, [initialColor]);

    const updateFromRgb = (nr, ng, nb) => {
        const clamp = (v) => Math.min(255, Math.max(0, parseInt(v) || 0));
        const cr = clamp(nr), cg = clamp(ng), cb = clamp(nb);
        setR(cr); setG(cg); setB(cb);
        const hStr = ((1 << 24) + (cr << 16) + (cg << 8) + cb).toString(16).slice(1);
        setHex(hStr);
    };

    const updateFromHex = (str) => {
        setHex(str);
        if (str.length === 6) {
            const num = parseInt(str, 16);
            if (!isNaN(num)) {
                setR((num >> 16) & 255);
                setG((num >> 8) & 255);
                setB(num & 255);
            }
        }
    };

    // Derived CMYK values
    const kVal = Math.round((1 - Math.max(r, g, b) / 255) * 100);
    const cVal = kVal === 100 ? 0 : Math.round((1 - r / 255 - kVal / 100) / (1 - kVal / 100) * 100);
    const mVal = kVal === 100 ? 0 : Math.round((1 - g / 255 - kVal / 100) / (1 - kVal / 100) * 100);
    const yVal = kVal === 100 ? 0 : Math.round((1 - b / 255 - kVal / 100) / (1 - kVal / 100) * 100);

    const currentColorHex = `#${hex}`;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                width: '560px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                border: '1px solid #CBD5E1'
            }}>
                {/* Title Bar */}
                <div style={{
                    padding: '10px 16px',
                    background: '#F8FAFC',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>Pick a Color</span>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content */}
                <div style={{ padding: '20px', display: 'flex', gap: '20px' }}>
                    {/* Left: 2D Gradient Canvas & Hue Slider */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        {/* 2D Gradient Box */}
                        <div
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const y = e.clientY - rect.top;
                                const satPct = Math.round((x / rect.width) * 100);
                                const brightPct = Math.round((1 - y / rect.height) * 100);
                                setSat(satPct);
                                setBright(brightPct);
                                // Compute sample RGB
                                const rNew = Math.round(255 * (satPct / 100) * (brightPct / 100));
                                updateFromRgb(rNew, Math.round(rNew * 0.3), Math.round(255 - rNew));
                            }}
                            style={{
                                width: '250px',
                                height: '260px',
                                borderRadius: '4px',
                                border: '1px solid #CBD5E1',
                                position: 'relative',
                                background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${currentColorHex})`,
                                cursor: 'crosshair'
                            }}
                        />

                        {/* Hue Vertical Rainbow Bar */}
                        <input
                            type="range"
                            min="0"
                            max="360"
                            value={hue}
                            onChange={(e) => {
                                const h = parseInt(e.target.value, 10);
                                setHue(h);
                                // approximate rainbow spectrum rgb
                                const rad = (h * Math.PI) / 180;
                                const red = Math.round(127 + 127 * Math.cos(rad));
                                const green = Math.round(127 + 127 * Math.sin(rad));
                                const blue = Math.round(127 - 127 * Math.cos(rad));
                                updateFromRgb(red, green, blue);
                            }}
                            style={{
                                writingMode: 'bt-lr',
                                WebkitAppearance: 'slider-vertical',
                                width: '20px',
                                height: '260px',
                                cursor: 'pointer'
                            }}
                        />
                    </div>

                    {/* Right: Numerical Inputs */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.825rem' }}>
                        {/* RGB Section */}
                        <div>
                            <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>RGB</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <label style={{ color: '#475569', fontWeight: 600 }}>Red:</label>
                                    <input type="number" min="0" max="255" value={r} onChange={(e) => updateFromRgb(e.target.value, g, b)} style={{ width: '70px', padding: '4px 6px', border: '1px solid #CBD5E1', borderRadius: '6px', textAlign: 'center', fontWeight: 700 }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <label style={{ color: '#475569', fontWeight: 600 }}>Green:</label>
                                    <input type="number" min="0" max="255" value={g} onChange={(e) => updateFromRgb(r, e.target.value, b)} style={{ width: '70px', padding: '4px 6px', border: '1px solid #CBD5E1', borderRadius: '6px', textAlign: 'center', fontWeight: 700 }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <label style={{ color: '#475569', fontWeight: 600 }}>Blue:</label>
                                    <input type="number" min="0" max="255" value={b} onChange={(e) => updateFromRgb(r, g, e.target.value)} style={{ width: '70px', padding: '4px 6px', border: '1px solid #CBD5E1', borderRadius: '6px', textAlign: 'center', fontWeight: 700 }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                                    <label style={{ color: '#475569', fontWeight: 700 }}>Hex #:</label>
                                    <input type="text" value={hex} onChange={(e) => updateFromHex(e.target.value)} style={{ width: '70px', padding: '4px 6px', border: '1px solid #CBD5E1', borderRadius: '6px', textAlign: 'center', fontWeight: 800, textTransform: 'lowercase' }} />
                                </div>
                            </div>
                        </div>

                        {/* HSB Section */}
                        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                            <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>HSB</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#475569' }}>Hue:</span>
                                    <span style={{ fontWeight: 700 }}>{hue}°</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#475569' }}>Saturation:</span>
                                    <span style={{ fontWeight: 700 }}>{sat}%</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#475569' }}>Brightness:</span>
                                    <span style={{ fontWeight: 700 }}>{bright}%</span>
                                </div>
                            </div>
                        </div>

                        {/* CMYK Section */}
                        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                            <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>CMYK</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748B' }}>
                                <span>C: {cVal}%</span>
                                <span>M: {mVal}%</span>
                                <span>Y: {yVal}%</span>
                                <span>K: {kVal}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                <div style={{
                    padding: '12px 20px',
                    background: '#F8FAFC',
                    borderTop: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '10px'
                }}>
                    <button onClick={onClose} style={{ padding: '6px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button onClick={() => { onApply(currentColorHex); onClose(); }} style={{ padding: '6px 18px', borderRadius: '6px', border: 'none', background: '#0a034a', color: '#FFF', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}>
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}
