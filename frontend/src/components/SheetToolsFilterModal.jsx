import React, { useState } from 'react';
import { X, Filter, AlertTriangle, CheckSquare, Square, ChevronDown } from 'lucide-react';

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

    // Default to first 15 columns selected
    const [selectedCols, setSelectedCols] = useState(
        Array.from({ length: 15 }, (_, i) => i)
    );

    const [targetColIndex, setTargetColIndex] = useState(0);
    const [filterOperator, setFilterOperator] = useState('equals');
    const [filterValue, setFilterValue] = useState('');
    const [childSheetName, setChildSheetName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Dropdown visibility states
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

    // Helper to get column names
    const getColName = (colIdx) => {
        const headerVal = firstRowHeaders[colIdx];
        const colLetter = String.fromCharCode(65 + colIdx);
        return headerVal && String(headerVal).trim() !== ''
            ? `Col ${colLetter} (${headerVal})`
            : `Colonne ${colLetter}`;
    };

    const toggleCol = (cIdx) => {
        if (selectedCols.includes(cIdx)) {
            if (selectedCols.length <= 1) {
                setErrorMsg("Vous devez conserver au moins une colonne dans la feuille enfant.");
                return;
            }
            setSelectedCols(selectedCols.filter(i => i !== cIdx));
        } else {
            setSelectedCols([...selectedCols, cIdx].sort((a, b) => a - b));
        }
        setErrorMsg('');
    };

    const selectAllCols = () => {
        setSelectedCols(Array.from({ length: 15 }, (_, i) => i));
        setErrorMsg('');
    };

    const deselectAllCols = () => {
        setSelectedCols([0]);
        setErrorMsg('');
    };

    const handleCreate = () => {
        if (isCurrentSheetChild || parentSheet?.type === 'child') {
            setErrorMsg("Action interdite : Impossible d'appliquer un filtre sur une feuille enfant. Le filtrage est réservé aux Feuilles Parents.");
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
            selectedCols
        });
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: '110px',
            right: '24px',
            width: '540px',
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
                {/* Header */}
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
                                SolutionExcel_Word / SheetTools
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: 'calc(100vh - 240px)' }}>

                    {/* Strict Business Rule Warning Banner */}
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
                                    Règle de filtrage stricte (SheetTools)
                                </strong>
                                La feuille actuellement active ("<strong>{activeSheet.name}</strong>") est une <strong>Feuille Enfant</strong>. Il est strictement interdit d'appliquer un filtre sur une feuille enfant.
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

                    {/* Form Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {/* Parent Sheet Selector */}
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
                                <span>
                                    {sheets[selectedParentIndex]?.name || activeSheet.name} {sheets[selectedParentIndex]?.type === 'child' ? '(Feuille Enfant - Interdit)' : '(Feuille Parent)'}
                                </span>
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
                                                    setErrorMsg('');
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
                                            <span>{s.name} {s.type === 'child' ? '(Feuille Enfant - Interdit)' : '(Feuille Parent)'}</span>
                                            {selectedParentIndex === idx && <span style={{ color: '#02006c', fontWeight: 900 }}>✓</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Column Selection Multi-Select Dropdown List */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1E293B' }}>
                                    2. Colonnes à conserver dans la feuille enfant ({selectedCols.length}/15) :
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
                            <select
                                multiple
                                value={selectedCols.map(String)}
                                onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions, opt => Number(opt.value));
                                    if (selected.length === 0) {
                                        setErrorMsg("Veuillez conserver au moins une colonne.");
                                        return;
                                    }
                                    setSelectedCols(selected);
                                    setErrorMsg('');
                                }}
                                style={{
                                    width: '100%',
                                    height: '140px',
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #CBD5E1',
                                    background: '#FFFFFF',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    color: '#02006c',
                                    outline: 'none'
                                }}
                            >
                                {Array.from({ length: 15 }).map((_, cIdx) => (
                                    <option key={cIdx} value={cIdx} style={{ padding: '6px 10px', margin: '2px 0' }}>
                                        {getColName(cIdx)}
                                    </option>
                                ))}
                            </select>
                            <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'block', marginTop: '4px' }}>
                                * Maintenez la touche Ctrl (ou Cmd) enfoncée pour faire une sélection multiple dans la liste déroulante.
                            </span>
                        </div>

                        {/* Column to filter - Custom Interactive Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                                3. Colonne de critère de filtre :
                            </label>
                            <div
                                onClick={() => !isCurrentSheetChild && setIsColDropdownOpen(!isColDropdownOpen)}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    border: '1.5px solid #02006c',
                                    background: '#FFFFFF',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    color: '#02006c',
                                    cursor: isCurrentSheetChild ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    boxShadow: '0 2px 4px rgba(2, 0, 108, 0.05)',
                                    opacity: isCurrentSheetChild ? 0.6 : 1
                                }}
                            >
                                <span>{getColName(targetColIndex)}</span>
                                <ChevronDown size={16} color="#02006c" style={{ transform: isColDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                            </div>

                            {isColDropdownOpen && (
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
                                    maxHeight: '220px',
                                    overflowY: 'auto',
                                    padding: '4px 0'
                                }}>
                                    {Array.from({ length: 15 }).map((_, cIdx) => (
                                        <div
                                            key={cIdx}
                                            onClick={() => {
                                                setTargetColIndex(cIdx);
                                                setIsColDropdownOpen(false);
                                            }}
                                            style={{
                                                padding: '9px 16px',
                                                fontSize: '0.825rem',
                                                fontWeight: targetColIndex === cIdx ? 800 : 600,
                                                color: targetColIndex === cIdx ? '#02006c' : '#1E293B',
                                                background: targetColIndex === cIdx ? 'rgba(2, 0, 108, 0.08)' : '#FFFFFF',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                borderBottom: '1px solid #F1F5F9'
                                            }}
                                        >
                                            <span>{getColName(cIdx)}</span>
                                            {targetColIndex === cIdx && <span style={{ color: '#02006c', fontWeight: 900 }}>✓</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Filter Operator & Value */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div style={{ position: 'relative' }}>
                                <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                                    4. Critère de filtrage précis :
                                </label>
                                <div
                                    onClick={() => !isCurrentSheetChild && setIsOperatorDropdownOpen(!isOperatorDropdownOpen)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        border: '1.5px solid #CBD5E1',
                                        background: '#FFFFFF',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        color: '#1E293B',
                                        cursor: isCurrentSheetChild ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                                        opacity: isCurrentSheetChild ? 0.6 : 1
                                    }}
                                >
                                    <span>{OPERATORS.find(o => o.value === filterOperator)?.label || filterOperator}</span>
                                    <ChevronDown size={16} color="#02006c" style={{ transform: isOperatorDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
                                </div>

                                {isOperatorDropdownOpen && (
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
                                        maxHeight: '220px',
                                        overflowY: 'auto',
                                        padding: '4px 0'
                                    }}>
                                        {OPERATORS.map(op => (
                                            <div
                                                key={op.value}
                                                onClick={() => {
                                                    setFilterOperator(op.value);
                                                    setIsOperatorDropdownOpen(false);
                                                }}
                                                style={{
                                                    padding: '9px 16px',
                                                    fontSize: '0.825rem',
                                                    fontWeight: filterOperator === op.value ? 800 : 600,
                                                    color: filterOperator === op.value ? '#02006c' : '#1E293B',
                                                    background: filterOperator === op.value ? 'rgba(2, 0, 108, 0.08)' : '#FFFFFF',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    borderBottom: '1px solid #F1F5F9'
                                                }}
                                            >
                                                <span>{op.label}</span>
                                                {filterOperator === op.value && <span style={{ color: '#02006c', fontWeight: 900 }}>✓</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                                    5. Valeur du filtre :
                                </label>
                                <input
                                    type="text"
                                    placeholder={filterOperator === 'notEmpty' || filterOperator === 'isEmpty' ? '(Non requis)' : 'ex: Direction, Validé, 1000...'}
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

                        {/* Child Sheet Name */}
                        <div>
                            <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#1E293B', display: 'block', marginBottom: '4px' }}>
                                6. Nom de la Feuille Enfant à générer :
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

                {/* Footer buttons */}
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
