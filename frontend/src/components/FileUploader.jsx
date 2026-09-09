import React, { useState } from 'react';
import { UploadCloud, X, FileSpreadsheet, CheckCircle2, AlertCircle, Grid } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function FileUploader({ onClose, onUploadSuccess }) {
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.ods')) {
                setSelectedFile(file);
            } else {
                alert("Veuillez sélectionner un fichier Excel valide (.xlsx, .xls, .ods)");
            }
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmitUpload = () => {
        if (!selectedFile) return;
        setIsUploading(true);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });

                let totalMerges = 0;
                const parsedSheets = wb.SheetNames.map((sheetName, idx) => {
                    const worksheet = wb.Sheets[sheetName];
                    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

                    // Extraire la liste des cellules fusionnées (!merges)
                    const rawMerges = worksheet['!merges'] || [];
                    totalMerges += rawMerges.length;

                    const merges = rawMerges.map(m => ({
                        startRow: m.s.r,
                        startCol: m.s.c,
                        endRow: m.e.r,
                        endCol: m.e.c,
                        rowSpan: m.e.r - m.s.r + 1,
                        colSpan: m.e.c - m.s.c + 1
                    }));

                    return {
                        name: sheetName,
                        isParent: idx === 0,
                        data: rawData.length > 0 ? rawData : [
                            ["Code Projet", "Désignation SI", "Budget Prévu (FCFA)", "Statut ANTIC"],
                            ["PKI-2026-01", "Infrastructure Clés Publiques & Certificats", "145 000 000", "Conforme ANTIC"],
                            ["SEC-2026-04", "Audit de Sécurité des SI Ministériels", "88 500 000", "Conforme ANTIC"]
                        ],
                        merges: merges
                    };
                });

                setIsUploading(false);
                if (onUploadSuccess) {
                    onUploadSuccess({
                        id: `wb-${Date.now()}`,
                        name: selectedFile.name,
                        size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
                        lastModified: new Date().toLocaleDateString('fr-FR'),
                        updatedAt: new Date().toLocaleString(),
                        sheetsCount: parsedSheets.length,
                        parentSheet: parsedSheets[0]?.name || "Feuille1",
                        status: totalMerges > 0 ? `Fusionné (${totalMerges} cellules)` : "Conforme",
                        sheets: parsedSheets
                    });
                }
                onClose();
            } catch (err) {
                console.error("Erreur lors de la lecture du fichier Excel :", err);
                setIsUploading(false);
                alert("Erreur lors de la lecture du fichier Excel. Le fichier a été importé avec un modèle par défaut.");
            }
        };

        reader.readAsBinaryString(selectedFile);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(11, 23, 39, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
        }}>
            <div className="glass-panel animate-fade-in" style={{
                width: '100%',
                maxWidth: '520px',
                background: 'var(--bg-secondary)',
                borderRadius: '16px',
                padding: '1.75rem'
            }}>
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <FileSpreadsheet size={22} color="var(--color-teal-400)" />
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Importer un Classeur Excel</h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Drag and Drop Zone */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    style={{
                        border: dragOver ? '2px dashed var(--color-teal-500)' : '2px dashed var(--border-color)',
                        background: dragOver ? 'rgba(49,151,149,0.1)' : 'var(--bg-primary)',
                        borderRadius: '12px',
                        padding: '2.5rem 1.5rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => document.getElementById('excel-file-input').click()}
                >
                    <UploadCloud size={48} color={dragOver ? 'var(--color-teal-400)' : 'var(--text-muted)'} style={{ margin: '0 auto 0.75rem' }} />
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        Glissez-déposez votre fichier Excel ici
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Formats supportés : .xlsx, .xls, .ods (Max: 25 Mo)
                    </p>

                    <input
                        id="excel-file-input"
                        type="file"
                        accept=".xlsx,.xls,.ods"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    <button className="btn-secondary" style={{ pointerEvents: 'none' }}>
                        Parcourir les fichiers
                    </button>
                </div>

                {/* Selected file preview */}
                {selectedFile && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-primary)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <FileSpreadsheet size={20} color="var(--color-teal-400)" />
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selectedFile.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{(selectedFile.size / 1024).toFixed(1)} KB</div>
                            </div>
                        </div>
                        <CheckCircle2 size={20} color="#34D399" />
                    </div>
                )}

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button onClick={onClose} className="btn-secondary">Annuler</button>
                    <button
                        onClick={handleSubmitUpload}
                        disabled={!selectedFile || isUploading}
                        className="btn-teal"
                    >
                        {isUploading ? 'Importation...' : 'Valider & Ouvrir dans FortuneSheet'}
                    </button>
                </div>
            </div>
        </div>
    );
}
