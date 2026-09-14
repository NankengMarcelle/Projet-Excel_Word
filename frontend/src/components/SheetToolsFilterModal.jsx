import React, { useState, useEffect } from 'react';
import { X, Filter, AlertTriangle, CheckSquare, Square, ChevronDown, ListTree } from 'lucide-react';

export default function SheetToolsFilterModal({
    workbook,
    activeSheetIndex,
    onClose,
    onCreateChildSheet
}) {
    const sheets = workbook?.sheets || [];
    const activeSheet = sheets[activeSheetIndex] || sheets[0];

    const isCurrentSheetChild = activeSheet?.type === 'child';

    const [selectedParentIndex, setSelectedParentIndex] = useState(
        isCurrentSheetChild ? '' : activeSheetIndex
    );

    const [targetColIndex, setTargetColIndex] = useState(0);
    const [filterOperator, setFilterOperator] = useState('equals');
    const [filterValue, setFilterValue] = useState('');
    const [childSheetName, setChildSheetName] = useState('');
    const [headerStartRow, setHeaderStartRow] = useState(1);
    const [headerEndRow, setHeaderEndRow] = useState(1);
    const [errorMsg, setErrorMsg] = useState('');

    const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
    const [isColDropdownOpen, setIsColDropdownOpen] = useState(false);
    const [isOperatorDropdownOpen, setIsOperatorDropdownOpen] = useState(false);

    const OPERATORS = [
        { value: 'equals', label: 'Égal à (Exact)' },
        { value: 'contains', label: 'Contient le texte' },
        { value: 'startsWith', label: 'Commence par' },
        { value: 'greaterThan', label: 'Supérieur à (>)' },
        { value: 'lessThan', label: 'Inférieur à (<)' },
        { value: 'notEmpty', label: 'Non vide (Données existantes)' },
        { value: 'isEmpty', label: 'Est vide' }
    ];

    const parentSheet = sheets[selectedParentIndex] || activeSheet;
    const parentData = parentSheet?.data || [];
    const firstRowHeaders = parentData[0] || [];

    // Detect exact used columns length to avoid suggesting empty spaces.
    let dataEndCol = 2; // minimum 3 cols
    parentData.forEach(row => {
        for (let i = row.length - 1; i >= 0; i--) {
            if (row[i] && String(row[i]).trim() !== '') {
                dataEndCol = Math.max(dataEndCol, i);
                break;
            }
        }
    });

    const [selectedCols, setSelectedCols] = useState([]);

    // Automatically select only used columns on load
    useEffect(() => {
        setSelectedCols(Array.from({ length: dataEndCol + 1 }, (_, i) => i));
    }, [dataEndCol, selectedParentIndex]);

    const getColLetter = (idx) => {
        let label = '';
        let temp = idx;
        while (temp >= 0) {
            label = String.fromCharCode((temp % 26) + 65) + label;
            temp = Math.floor(temp / 26) - 1;
        }
        return label;
    };

    const getColName = (colIdx, short = false) => {
        const headerVal = firstRowHeaders[colIdx];
        const colLetter = getColLetter(colIdx);
        if (short && headerVal && String(headerVal).trim() !== '') return String(headerVal);
        return headerVal && String(headerVal).trim() !== ''
            ? `Col ${colLetter} (${headerVal})`
            : `Colonne ${colLetter}`;
    };

    // Calculate hierarchical grouping using merges
    const merges = parentSheet.merges || [];
    const groupedColumns = [];
    const processedCols = new Set();

    merges.forEach(m => {
        let sR = m.startRow !== undefined ? m.startRow : m.s?.r;
        let eR = m.endRow !== undefined ? m.endRow : m.e?.r;
        let sC = m.startCol !== undefined ? m.startCol : m.s?.c;
        let eC = m.endCol !== undefined ? m.endCol : m.e?.c;

        if (sR === 0 && eC > sC) {
            const groupName = getColName(sC, true) || `Groupe Col ${getColLetter(sC)}-${getColLetter(eC)}`;
            const children = [];
            for (let c = sC; c <= eC; c++) {
                if (c <= dataEndCol) {
                    children.push(c);
                    processedCols.add(c);
                }
            }
            if (children.length > 0) groupedColumns.push({ isGroup: true, id: `g_${sC}_${eC}`, label: groupName, children });
        }
    });

    for (let c = 0; c <= dataEndCol; c++) {
        if (!processedCols.has(c)) {
            groupedColumns.push({ isGroup: false, id: c, label: getColName(c) });
        }
    }

    // Sort array so groups show physically where they belong (by lowest col idx)
    groupedColumns.sort((a, b) => {
        const aVal = a.isGroup ? a.children[0] : a.id;
        const bVal = b.isGroup ? b.children[0] : b.id;
        return aVal - bVal;
    });

    const toggleCol = (cIdx) => {
        setSelectedCols(prev => {
            if (prev.includes(cIdx)) {
                return prev.filter(i => i !== cIdx);
            } else {
                return [...prev, cIdx].sort((a, b) => a - b);
            }
        });
        setErrorMsg('');
    };

    const toggleGroup = (childrenIds) => {
        setSelectedCols(prev => {
            const allSelected = childrenIds.every(c => prev.includes(c));
            if (allSelected) {
                return prev.filter(c => !childrenIds.includes(c));
            } else {
                const next = [...prev];
                childrenIds.forEach(c => {
                    if (!next.includes(c)) next.push(c);
                });
                return next.sort((a, b) => a - b);
            }
        });
        setErrorMsg('');
    };

    const selectAllCols = () => {
        setSelectedCols(Array.from({ length: dataEndCol + 1 }, (_, i) => i));
        setErrorMsg('');
    };

    const deselectAllCols = () => {
        setSelectedCols([]);
        setErrorMsg('');
    };

    const handleCreate = () => {
        if (isCurrentSheetChild || parentSheet?.type === 'child') {
            setErrorMsg("Action interdite : Impossible d'appliquer un filtre sur une feuille enfant.");
            return;
        }

        if (filterOperator !== 'notEmpty' && filterOperator !== 'isEmpty' && !filterValue.trim()) {
            setErrorMsg("Veuillez saisir une valeur de filtre.");
            return;
        }

        if (selectedCols.length === 0) {
            setErrorMsg("Veuillez sélectionner au moins une colonne à conserver.");
            return;
        }

        const defaultName = childSheetName.trim() || `${parentSheet.name}_Filtre_${(filterValue || 'Extrait').replace(/\s+/g, '_')}`;

        onCreateChildSheet({
            parentSheetName: parentSheet.name,
            childSheetName: defaultName,
            colIndex: targetColIndex,
            colLabel: getColName(targetColIndex),
            filterOperator,
            filterValue: filterValue.trim(),
            selectedCols,
            headerStartRow: Math.max(0, Number(headerStartRow) - 1),
            headerEndRow: Math.max(0, Number(headerEndRow) - 1)
        });
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: '110px',
            right: '24px',
            width: '600px',
            maxHeight: 'calc(100vh - 140px)',
            zIndex: 1000,
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            <div style={{
                width: '100%',
                background: '#FFFFFF',
                borderRadius: '20px',
                boxShadow: '0 20px 45px rgba(2, 0, 108, 0.25)',
                border: '1.5px solid #02006c',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '14px 20px',
                    background: '#02006c',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Filter size={18} color="#FFF" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#FFF' }}>
                                SheetTools • Générer Feuille Enfant
                            </h3>
                            <span style={{ fontSize: '0.7rem', color: '#E0E7FF' }}>
                                Architecture Hierarchique
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: 'calc(100vh - 240px)' }}>

                    {isCurrentSheetChild && (
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: '12px',
                            background: '#FEF2F2',
                            border: '1px solid #FCA5A5',
                            color: '#991B1B',
                            fontSize: '0.825rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px'
                        }}>
                            <AlertTriangle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <strong style={{ color: '#7F1D1D', display: 'block', marginBottom: '2px' }}>
                                    Règle de filtrage stricte
                                </strong>
                                Impossible d'appliquer un filtre sur une feuille enfant ({activeSheet.name}).
                            </div>
                        </div>
                    )}

                    {errorMsg && !isCurrentSheetChild && (
                        <div style={{
                            padding: '10px 14px',
                            borderRadius: '10px',
                            background: '#FFFBEB',
                            border: '1px solid #FDE68A',
                            color: '#92400E',
                            fontSize: '0.825rem',
                            fontWeight: 600
                        }}>
                            {errorMsg}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ position: 'relative' }}>
                            <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                                1. Sélectionner la Feuille Parent Source :
                            </label>
                            <div
                                onClick={() => setIsParentDropdownOpen(!isParentDropdownOpen)}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #02006c',
                                    background: '#FFFFFF',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    color: '#02006c',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    boxShadow: '0 2px 4px rgba(2, 0, 108, 0.05)'
                                }}
                            >
                                <span>{sheets[selectedParentIndex]?.name || activeSheet.name} {sheets[selectedParentIndex]?.type === 'child' ? '(Enfant - Interdit)' : '(Parent)'}</span>
                                <ChevronDown size={16} color="#02006c" style={{ transform: isParentDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                            </div>

                            {isParentDropdownOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    marginTop: '4px',
                                    background: '#FFFFFF',
                                    border: '1.5px solid #02006c',
                                    borderRadius: '12px',
                                    boxShadow: '0 12px 30px rgba(0, 0, 108, 0.2)',
                                    zIndex: 999,
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    padding: '4px 0'
                                }}>
                                    {sheets.map((s, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                if (s.type !== 'child') {
                                                    setSelectedParentIndex(idx);
                                                    setIsParentDropdownOpen(false);
                                                }
                                            }}
                                            style={{
                                                padding: '9px 16px',
                                                fontSize: '0.825rem',
                                                fontWeight: selectedParentIndex === idx ? 800 : 600,
                                                color: s.type === 'child' ? '#94A3B8' : (selectedParentIndex === idx ? '#02006c' : '#1E293B'),
                                                background: selectedParentIndex === idx ? 'rgba(2, 0, 108, 0.08)' : '#FFFFFF',
                                                cursor: s.type === 'child' ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                borderBottom: '1px solid #F1F5F9'
                                            }}
                                        >
                                            <span>{s.name} {s.type === 'child' ? '(Enfant)' : '(Parent)'}</span>
                                            {selectedParentIndex === idx && <span style={{ color: '#02006c', fontWeight: 900 }}>✓</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1E293B' }}>
                                    2. Colonnes à conserver ({selectedCols.length}/{dataEndCol + 1}) :
                                </label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        type="button"
                                        onClick={selectAllCols}
                                        style={{ fontSize: '0.725rem', color: '#02006c', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                                    >
                                        Sélectionner tout
                                    </button>
                                    <span style={{ color: '#CBD5E1' }}>|</span>
                                    <button
                                        type="button"
                                        onClick={deselectAllCols}
                                        style={{ fontSize: '0.725rem', color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        Désélectionner tout
                                    </button>
                                </div>
                            </div>

                            <div style={{
                                width: '100%',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1.5px solid #CBD5E1',
                                background: '#F8FAFC'
                            }}>
                                {groupedColumns.map((g) => {
                                    if (g.isGroup) {
                                        const isAllChecked = g.children.every(c => selectedCols.includes(c));
                                        const isSomeChecked = g.children.some(c => selectedCols.includes(c));
                                        return (
                                            <div key={g.id} style={{ marginBottom: '10px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                                                <div style={{ padding: '8px 12px', background: 'rgba(2,0,108,0.03)', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => toggleGroup(g.children)}>
                                                    {isAllChecked ? <CheckSquare size={16} color="#02006c" /> : (isSomeChecked ? <div style={{ width: '14px', height: '14px', background: '#02006c', borderRadius: '3px', margin: '1px' }} /> : <Square size={16} color="#94A3B8" />)}
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#02006c', flex: 1 }}>[Groupe] {g.label}</span>
                                                    <ListTree size={14} color="#64748B" />
                                                </div>
                                                <div style={{ padding: '6px 12px' }}>
                                                    {g.children.map(cIdx => (
                                                        <div key={cIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', cursor: 'pointer', marginLeft: '10px' }} onClick={() => toggleCol(cIdx)}>
                                                            {selectedCols.includes(cIdx) ? <CheckSquare size={14} color="#059669" /> : <Square size={14} color="#CBD5E1" />}
                                                            <span style={{ fontSize: '0.775rem', color: '#334155' }}>{getColLetter(cIdx)} {parentData[1]?.[cIdx] && `- ${parentData[1]?.[cIdx]}`}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', cursor: 'pointer', borderBottom: '1px dashed #E2E8F0' }} onClick={() => toggleCol(g.id)}>
                                                {selectedCols.includes(g.id) ? <CheckSquare size={16} color="#059669" /> : <Square size={16} color="#94A3B8" />}
                                                <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 500 }}>{g.label}</span>
                                            </div>
                                        )
                                    }
                                })}
                            </div>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                                3. Colonne de critère de filtre :
                            </label>
                            <select
                                value={targetColIndex}
                                onChange={(e) => setTargetColIndex(Number(e.target.value))}
                                disabled={isCurrentSheetChild}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #02006c',
                                    background: '#FFFFFF',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    color: '#02006c',
                                    outline: 'none',
                                    appearance: 'menulist'
                                }}
                            >
                                {Array.from({ length: dataEndCol + 1 }).map((_, cIdx) => (
                                    <option key={cIdx} value={cIdx}>{getColName(cIdx)}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ position: 'relative' }}>
                                <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                                    4. Critère de filtrage précis :
                                </label>
                                <select
                                    value={filterOperator}
                                    onChange={(e) => setFilterOperator(e.target.value)}
                                    disabled={isCurrentSheetChild}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #CBD5E1',
                                        background: '#FFFFFF',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        color: '#1E293B',
                                        outline: 'none',
                                        appearance: 'menulist'
                                    }}
                                >
                                    {OPERATORS.map(op => (
                                        <option key={op.value} value={op.value}>{op.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                                    5. Valeur du filtre :
                                </label>
                                <input
                                    type="text"
                                    placeholder={filterOperator === 'notEmpty' || filterOperator === 'isEmpty' ? '(Non requis)' : 'ex: Direction, 1000...'}
                                    value={filterValue}
                                    onChange={(e) => setFilterValue(e.target.value)}
                                    disabled={isCurrentSheetChild || filterOperator === 'notEmpty' || filterOperator === 'isEmpty'}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: '10px',
                                        border: '1px solid #CBD5E1',
                                        background: '#F8FAFC',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        color: '#02006c'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                                    6. En-tête : Ligne de début
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={headerStartRow}
                                    onChange={(e) => setHeaderStartRow(e.target.value)}
                                    disabled={isCurrentSheetChild}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: '10px',
                                        border: '1px solid #CBD5E1',
                                        background: '#F8FAFC',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        color: '#02006c'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                                    7. En-tête : Ligne de fin
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={headerEndRow}
                                    onChange={(e) => setHeaderEndRow(e.target.value)}
                                    disabled={isCurrentSheetChild}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: '10px',
                                        border: '1px solid #CBD5E1',
                                        background: '#F8FAFC',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        color: '#02006c'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                                8. Nom de la Feuille Enfant à générer :
                            </label>
                            <input
                                type="text"
                                placeholder={`Feuille_Enfant_${parentSheet?.name || 'Parent'}`}
                                value={childSheetName}
                                onChange={(e) => setChildSheetName(e.target.value)}
                                disabled={isCurrentSheetChild}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    border: '1px solid #CBD5E1',
                                    background: '#F8FAFC',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{
                    padding: '14px 20px',
                    background: '#F8FAFC',
                    borderTop: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '10px'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            border: '1px solid #CBD5E1',
                            background: '#FFF',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isCurrentSheetChild || parentSheet?.type === 'child'}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '10px',
                            border: 'none',
                            background: isCurrentSheetChild || parentSheet?.type === 'child' ? '#94A3B8' : '#02006c',
                            color: '#FFF',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                            cursor: isCurrentSheetChild || parentSheet?.type === 'child' ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Filter size={15} />
                        <span>Générer Feuille Enfant ({selectedCols.length} cols)</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
