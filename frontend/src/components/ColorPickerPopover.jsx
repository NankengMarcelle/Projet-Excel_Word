import React, { useState } from 'react';
import { Palette, CheckSquare } from 'lucide-react';
import CustomColorModal from './CustomColorModal';

// 10 Columns x 8 Rows standard spreadsheet color matrix
const COLOR_MATRIX = [
    ['#000000', '#1C1C1C', '#333333', '#4D4D4D', '#666666', '#808080', '#999999', '#B3B3B3', '#CCCCCC', '#FFFFFF'],
    ['#FFFF00', '#FFC000', '#FF9900', '#FF0000', '#C00000', '#7030A0', '#002060', '#0070C0', '#00B0F0', '#92D050'],
    ['#FFFFCC', '#FFF2CC', '#FCE5CD', '#F4CCCC', '#E6B8AF', '#E1D5E7', '#D9E1F2', '#D0E0E3', '#D9EAD3', '#EFEFEF'],
    ['#FFF2A8', '#FFE599', '#F9CB9C', '#EA9999', '#DD7E6B', '#D5A6BD', '#B4C6E7', '#A2C4C9', '#B6D7A8', '#D9D9D9'],
    ['#FFE566', '#FFD966', '#F6B26B', '#E06666', '#CC4125', '#C27BA0', '#8EA9DB', '#76A5AF', '#93C47D', '#BFBFBF'],
    ['#BF9000', '#F1C232', '#E69138', '#CC0000', '#990000', '#A64D79', '#305496', '#45818E', '#6AA84F', '#808080'],
    ['#7F6000', '#BF9000', '#B45F06', '#990000', '#660000', '#741B47', '#1F3864', '#134F5C', '#38761D', '#595959'],
    ['#3F3000', '#5F4500', '#5B2F00', '#4C0000', '#330000', '#3A0D23', '#0F1C32', '#0A272E', '#1C3B0E', '#262626']
];

export default function ColorPickerPopover({
    type = 'text',
    title = 'Font Color',
    onSelectColor,
    onClose,
    recentColors = []
}) {
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

    const isText = type === 'text';
    const defaultLabel = isText ? 'Automatic' : 'No Fill';

    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '4px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '12px',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)',
                    padding: '12px',
                    width: '240px',
                    zIndex: 200,
                    fontFamily: 'Inter, sans-serif'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                    {title}
                </div>

                <button
                    onClick={() => {
                        onSelectColor(isText ? '#000000' : 'transparent');
                        onClose();
                    }}
                    style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        background: '#F8FAFC',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '10px'
                    }}
                >
                    <CheckSquare size={15} color="#475569" />
                    <span>{defaultLabel}</span>
                </button>

                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '6px' }}>
                    standard
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(10, 1fr)',
                    gap: '3px',
                    marginBottom: '10px'
                }}>
                    {COLOR_MATRIX.map((row, rIdx) =>
                        row.map((color, cIdx) => (
                            <div
                                key={`${rIdx}-${cIdx}`}
                                onClick={() => {
                                    onSelectColor(color);
                                    onClose();
                                }}
                                title={color}
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    background: color,
                                    border: color.toUpperCase() === '#FFFFFF' ? '1px solid #CBD5E1' : '1px solid rgba(0,0,0,0.1)',
                                    borderRadius: '2px',
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            />
                        ))
                    )}
                </div>

                {recentColors && recentColors.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                            Recent
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {recentColors.slice(0, 10).map((c, i) => (
                                <div
                                    key={i}
                                    onClick={() => {
                                        onSelectColor(c);
                                        onClose();
                                    }}
                                    style={{
                                        width: '18px',
                                        height: '18px',
                                        background: c,
                                        borderRadius: '2px',
                                        border: '1px solid #CBD5E1',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div style={{ height: '1px', background: '#E2E8F0', margin: '8px 0' }} />

                <button
                    onClick={() => setIsCustomModalOpen(true)}
                    style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#02006c',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Palette size={16} color="#02006c" />
                    <span>Custom Color...</span>
                </button>
            </div>

            {isCustomModalOpen && (
                <CustomColorModal
                    initialColor={isText ? '#000000' : '#FFFFFF'}
                    onApply={(col) => {
                        onSelectColor(col);
                        onClose();
                    }}
                    onClose={() => setIsCustomModalOpen(false)}
                />
            )}
        </>
    );
}
