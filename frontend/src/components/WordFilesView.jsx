import React, { useState } from 'react';
import { FileSpreadsheet, Download, Eye, Search, FileCheck2, ShieldCheck, FileText } from 'lucide-react';
import WordDocumentPreviewModal from './WordDocumentPreviewModal';

export default function WordFilesView({ conversions, onSelectWorkbook, lang = 'fr' }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWordDoc, setSelectedWordDoc] = useState(null);

    const sampleWordFiles = [
        {
            id: 'word-01',
            name: 'Rapport_Trimestriel_Activites_2026.docx',
            sourceExcel: 'Rapport_Trimestriel_Activites_2026.xlsx',
            sheetName: 'Budget 2026',
            template: lang === 'fr' ? 'Rapport Institutionnel ANTIC' : 'Institutional ANTIC Report',
            date: '07/09/2026 06:15',
            size: '1.4 MB',
            author: 'Pierre Marcelle Nankeng',
            status: lang === 'fr' ? 'Officiel ANTIC' : 'Official ANTIC'
        },
        {
            id: 'word-02',
            name: 'Budget_Previsionnel_2026_V3.docx',
            sourceExcel: 'Budget_Previsionnel_2026_V3.xlsx',
            sheetName: 'Récapitulatif Global',
            template: lang === 'fr' ? 'Tableau de Synthèse Budgétaire' : 'Budget Summary Table',
            date: '06/09/2026 14:30',
            size: '840 KB',
            author: 'Unité Audit & Sécurité',
            status: lang === 'fr' ? 'Officiel ANTIC' : 'Official ANTIC'
        },
        {
            id: 'word-03',
            name: 'Suivi_Execution_Projets_SI.docx',
            sourceExcel: 'Suivi_Execution_Projets_SI.xlsx',
            sheetName: 'Jalons 2026',
            template: lang === 'fr' ? 'Rapport Institutionnel ANTIC' : 'Institutional ANTIC Report',
            date: '04/09/2026 11:20',
            size: '2.1 MB',
            author: 'Direction Générale',
            status: lang === 'fr' ? 'Officiel ANTIC' : 'Official ANTIC'
        }
    ];

    const exportToWordDoc = (doc) => {
        const docTitle = doc.name.replace('.docx', '').replace(/_/g, ' ');
        const htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset="utf-8">
                <title>${doc.name}</title>
                <style>
                    body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #0F172A; margin: 20mm; }
                    .header { text-align: center; border-bottom: 2px solid #02006c; padding-bottom: 15px; margin-bottom: 20px; }
                    .country-title { font-size: 9pt; font-weight: bold; color: #02006c; text-transform: uppercase; letter-spacing: 1px; }
                    .motto { font-size: 8pt; color: #64748B; font-style: italic; margin-top: 2px; }
                    .agency-name { font-size: 11pt; font-weight: bold; color: #02006c; margin-top: 8px; }
                    .doc-title { font-size: 18pt; font-weight: bold; color: #0F172A; margin-top: 15px; text-transform: uppercase; text-decoration: underline; }
                    
                    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #F8FAFC; border: 1px solid #CBD5E1; }
                    .meta-table td { padding: 8px 12px; font-size: 10pt; border: 1px solid #E2E8F0; }
                    .meta-label { font-weight: bold; color: #02006c; }
                    
                    .section-header { font-size: 12pt; font-weight: bold; color: #02006c; margin-top: 20px; margin-bottom: 10px; }
                    
                    .data-table { width: 100%; border-collapse: collapse; font-size: 10pt; margin-bottom: 25px; border: 1px solid #02006c; }
                    .data-table th { background-color: #02006c; color: #FFFFFF; font-weight: bold; padding: 10px; border: 1px solid #02006c; text-align: left; }
                    .data-table td { padding: 8px 10px; border: 1px solid #CBD5E1; }
                    .data-table tr:nth-child(even) { background-color: #F8FAFC; }
                    .total-row { background-color: #EEF2FF; font-weight: bold; }
                    
                    .stamp-badge { background-color: #02006c; color: #FFFFFF; padding: 3px 8px; border-radius: 4px; font-size: 8pt; font-weight: bold; display: inline-block; }
                    
                    .footer-section { margin-top: 40px; padding-top: 15px; border-top: 1px dashed #CBD5E1; }
                    .signature-box { float: right; width: 250px; text-align: right; }
                    .signature-title { font-size: 10pt; font-weight: bold; color: #0F172A; }
                    .signature-sub { font-size: 9pt; color: #94A3B8; margin-top: 30px; }
                    .crypto-hash { font-size: 8pt; color: #02006c; font-weight: bold; font-family: monospace; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="country-title">REPUBLIQUE DU CAMEROUN • REPUBLIC OF CAMEROON</div>
                    <div class="motto">Paix - Travail - Patrie / Peace - Work - Fatherland</div>
                    <div class="agency-name">AGENCE NATIONALE DES TECHNOLOGIES DE L'INFORMATION ET DE LA COMMUNICATION (ANTIC)</div>
                    <div class="doc-title">${docTitle}</div>
                </div>

                <table class="meta-table">
                    <tr>
                        <td><span class="meta-label">Fichier Excel Source :</span> ${doc.sourceExcel}</td>
                        <td><span class="meta-label">Feuille de Calcul :</span> ${doc.sheetName}</td>
                    </tr>
                    <tr>
                        <td><span class="meta-label">Modèle Officiel :</span> ${doc.template}</td>
                        <td><span class="meta-label">Généré par :</span> ${doc.author}</td>
                    </tr>
                    <tr>
                        <td><span class="meta-label">Date de Génération :</span> ${doc.date}</td>
                        <td><span class="meta-label">Statut de Sécurité :</span> <span class="stamp-badge">${doc.status}</span></td>
                    </tr>
                </table>

                <div class="section-header">1. Synthèse des Données Converties</div>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Code / Ref</th>
                            <th>Libellé / Désignation</th>
                            <th>Prévisions (FCFA)</th>
                            <th>Statut Conformité</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><b>PKI-2026-01</b></td>
                            <td>Infrastructure Clés Publiques & Certificats</td>
                            <td><b>145 000 000</b></td>
                            <td style="color:#059669; font-weight:bold;">Conforme ANTIC</td>
                        </tr>
                        <tr>
                            <td><b>SEC-2026-04</b></td>
                            <td>Audit de Sécurité des SI Ministériels</td>
                            <td><b>88 500 000</b></td>
                            <td style="color:#059669; font-weight:bold;">Conforme ANTIC</td>
                        </tr>
                        <tr>
                            <td><b>DEV-2026-09</b></td>
                            <td>Plateforme Web conversion Excel → Word</td>
                            <td><b>42 000 000</b></td>
                            <td style="color:#059669; font-weight:bold;">En Déploiement</td>
                        </tr>
                        <tr class="total-row">
                            <td colspan="2" style="text-align:right;"><b>TOTAL CUMULÉ</b></td>
                            <td style="color:#02006c;"><b>275 500 000 FCFA</b></td>
                            <td><b>Validé</b></td>
                        </tr>
                    </tbody>
                </table>

                <div class="footer-section">
                    <div style="float:left;">
                        <div style="font-size:8pt; color:#64748B;">Signature Électronique Certifiée</div>
                        <div class="crypto-hash">Empreinte SHA-256 : 8f9a4b2c89d7e10a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a</div>
                    </div>
                    <div class="signature-box">
                        <div class="signature-title">Le Directeur Général de l'ANTIC</div>
                        <div class="signature-sub">[Signé Électroniquement]</div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const blob = new Blob(['\ufeff', htmlContent], {
            type: 'application/msword'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const filteredFiles = sampleWordFiles.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.sourceExcel.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#F8FAFC', minHeight: 'calc(100vh - 65px)', width: '100%' }}>

            {/* Header Banner */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '1.25rem',
                borderBottom: '1px solid #E2E8F0'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#02006c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <FileCheck2 size={16} /> {lang === 'fr' ? "Documents Word Générés" : "Generated Word Documents"}
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                        {lang === 'fr' ? "Fichiers Word Issus de la Conversion" : "Converted Word Files"}
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>
                        {lang === 'fr'
                            ? "Consultez, prévisualisez et téléchargez les rapports Word officiels générés à partir de vos feuilles Excel."
                            : "View, preview, and download official Word reports generated from your Excel sheets."}
                    </p>
                </div>

                {/* Search Input */}
                <div style={{ position: 'relative', width: '320px' }}>
                    <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder={lang === 'fr' ? "Rechercher un document Word..." : "Search Word document..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.55rem 1rem 0.55rem 2.5rem',
                            borderRadius: '20px',
                            border: '1px solid #CBD5E1',
                            background: '#FFFFFF',
                            fontSize: '0.825rem',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* In-Page Live Word Document Preview Panel */}
            {selectedWordDoc ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>

                    {/* Top Action Header Bar for In-Page Document Preview */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid #CBD5E1'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            {/* Relocated Clean Back Button */}
                            <button
                                onClick={() => setSelectedWordDoc(null)}
                                style={{
                                    background: '#FFFFFF',
                                    color: '#02006c',
                                    border: '1.5px solid #02006c',
                                    borderRadius: '12px',
                                    padding: '0.55rem 1.1rem',
                                    fontSize: '0.825rem',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 2px 8px rgba(2, 0, 108, 0.06)',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                ← {lang === 'fr' ? "Retour à la liste des documents" : "Back to document list"}
                            </button>

                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={20} color="#02006c" />
                                    {selectedWordDoc.name}
                                </h2>
                                <div style={{ fontSize: '0.775rem', color: '#64748B', marginTop: '2px' }}>
                                    {lang === 'fr' ? 'Fichier Excel Source :' : 'Excel Source:'} <strong>{selectedWordDoc.sourceExcel}</strong> ({selectedWordDoc.sheetName})
                                </div>
                            </div>
                        </div>

                        {/* Download .docx Button only (Print button removed) */}
                        <button
                            onClick={() => exportToWordDoc(selectedWordDoc)}
                            style={{
                                background: '#02006c',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '0.6rem 1.25rem',
                                fontSize: '0.825rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 12px rgba(2, 0, 108, 0.18)'
                            }}
                        >
                            <Download size={16} /> {lang === 'fr' ? "Télécharger .docx" : "Download .docx"}
                        </button>
                    </div>

                    {/* Paper Document Preview Frame (Placed DIRECTLY on the Page) */}
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', paddingTop: '0.5rem' }}>
                        <div style={{
                            width: '100%',
                            maxWidth: '860px',
                            background: '#FFFFFF',
                            borderRadius: '16px',
                            boxShadow: '0 12px 35px rgba(2, 0, 108, 0.08)',
                            padding: '3.5rem',
                            border: '1px solid #CBD5E1',
                            fontFamily: 'sans-serif'
                        }}>

                            {/* Official ANTIC Document Header */}
                            <div style={{ borderBottom: '2px solid #02006c', paddingBottom: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#02006c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    REPUBLIQUE DU CAMEROUN • REPUBLIC OF CAMEROON
                                </div>
                                <div style={{ fontSize: '0.675rem', color: '#64748B', fontStyle: 'italic', marginTop: '2px' }}>
                                    Paix - Travail - Patrie / Peace - Work - Fatherland
                                </div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#02006c', marginTop: '8px' }}>
                                    AGENCE NATIONALE DES TECHNOLOGIES DE L'INFORMATION ET DE LA COMMUNICATION (ANTIC)
                                </div>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginTop: '1.25rem', textTransform: 'uppercase', textDecoration: 'underline' }}>
                                    {selectedWordDoc.name.replace('.docx', '').replace(/_/g, ' ')}
                                </h2>
                            </div>

                            {/* Document Metadata Table */}
                            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div><strong>{lang === 'fr' ? "Fichier Excel Source :" : "Source Excel File:"}</strong> {selectedWordDoc.sourceExcel}</div>
                                    <div><strong>{lang === 'fr' ? "Feuille de Calcul :" : "Worksheet:"}</strong> {selectedWordDoc.sheetName}</div>
                                    <div><strong>{lang === 'fr' ? "Modèle Officiel :" : "Official Template:"}</strong> {selectedWordDoc.template}</div>
                                    <div><strong>{lang === 'fr' ? "Généré par :" : "Generated by:"}</strong> {selectedWordDoc.author}</div>
                                    <div><strong>{lang === 'fr' ? "Date de Génération :" : "Generation Date:"}</strong> {selectedWordDoc.date}</div>
                                    <div>
                                        <strong>{lang === 'fr' ? "Cachet de Sécurité :" : "Security Stamp:"}</strong>
                                        <span className="badge badge-emerald" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>
                                            <ShieldCheck size={12} /> {selectedWordDoc.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Formatted Converted Data Table */}
                            <div style={{ marginBottom: '2rem' }}>
                                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#02006c', marginBottom: '0.75rem' }}>
                                    {lang === 'fr' ? "1. Synthèse des Données Converties" : "1. Summary of Converted Data"}
                                </h4>

                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', border: '1px solid #CBD5E1' }}>
                                    <thead>
                                        <tr style={{ background: '#02006c', color: '#FFFFFF', textAlign: 'left' }}>
                                            <th style={{ padding: '0.65rem 0.85rem', border: '1px solid #02006c' }}>Code / Ref</th>
                                            <th style={{ padding: '0.65rem 0.85rem', border: '1px solid #02006c' }}>Libellé / Désignation</th>
                                            <th style={{ padding: '0.65rem 0.85rem', border: '1px solid #02006c' }}>Prévisions (FCFA)</th>
                                            <th style={{ padding: '0.65rem 0.85rem', border: '1px solid #02006c' }}>Statut Conformité</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style={{ background: '#FFFFFF' }}>
                                            <td style={{ padding: '0.6rem 0.85rem', border: '1px solid #CBD5E1', fontWeight: 700 }}>PKI-2026-01</td>
                                            <td style={{ padding: '0.6rem 0.85rem', border: '1px solid #CBD5E1' }}>Infrastructure Clés Publiques & Certificats</td>
                                            <td style={{ padding: '0.6rem 0.85rem', border: '1px solid #CBD5E1', fontWeight: 700 }}>145 000 000</td>
                                            <td style={{ padding: '0.6rem 0.85rem', border: '1px solid #CBD5E1', color: '#059669', fontWeight: 700 }}>Conforme ANTIC</td>
                                        </tr>
                                        <tr style={{ background: '#F8FAFC' }}>
                                            <td style={{ padding: '0.6rem 0.85rem', border: '1px solid #CBD5E1', fontWeight: 700 }}>SEC-2026-04</td>
                                            <td style={{ padding: '0.6rem 0.85rem', border: '1px solid #CBD5E1' }}>Audit de Sécurité des SI Ministériels</td>
                                            <td style={{ padding: '0.6rem 0.85rem', border: '1px solid #CBD5E1', fontWeight: 700 }}>88 500 000</td>
                                            <td style={{ padding: '0.6rem 0.85rem', border: '1px solid #CBD5E1', color: '#059669', fontWeight: 700 }}>Conforme ANTIC</td>
                                        </tr>
                                        <tr style={{ background: '#FFFFFF' }}>
                                            <td style={{ padding: '0.6rem 0.85rem', border: '1px solid #CBD5E1', fontWeight: 700 }}>DEV-2026-09</td>
                                            <td style={{ padding: '0.6rem 0.85rem', border: '1px solid #CBD5E1' }}>Plateforme Web conversion Excel → Word</td>
                                            <td style={{ padding: '0.6rem 0.85rem', border: '1px solid #CBD5E1', fontWeight: 700 }}>42 000 000</td>
                                            <td style={{ padding: '0.6rem 0.85rem', border: '1px solid #CBD5E1', color: '#059669', fontWeight: 700 }}>En Déploiement</td>
                                        </tr>
                                        <tr style={{ background: 'rgba(2, 0, 108, 0.06)', fontWeight: 800 }}>
                                            <td colSpan={2} style={{ padding: '0.65rem 0.85rem', border: '1px solid #CBD5E1', textAlign: 'right' }}>TOTAL CUMULÉ</td>
                                            <td style={{ padding: '0.65rem 0.85rem', border: '1px solid #CBD5E1', color: '#02006c' }}>275 500 000 FCFA</td>
                                            <td style={{ padding: '0.65rem 0.85rem', border: '1px solid #CBD5E1' }}>Validé</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Document Footer Signature Block */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px dashed #CBD5E1' }}>
                                <div>
                                    <div style={{ fontSize: '0.725rem', color: '#64748B' }}>
                                        Signature Électronique Certifiée
                                    </div>
                                    <div style={{ fontSize: '0.775rem', fontWeight: 800, color: '#02006c', marginTop: '2px' }}>
                                        Empreinte SHA-256 : 8f9a4b2c...e901
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' }}>
                                        Le Directeur Général de l'ANTIC
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '30px' }}>
                                        [Signé Électroniquement]
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            ) : (


                /* Institutional Data Table View for Converted Word Documents (Displayed Directly on Page Canvas) */
                <table style={{
                    width: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: 0,
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(2, 0, 108, 0.05)',
                    background: '#FFFFFF'
                }}>
                    <thead>
                        <tr style={{ background: '#02006c', color: '#FFFFFF' }}>
                            <th style={{ padding: '1rem 1.25rem', fontWeight: 800 }}>{lang === 'fr' ? 'Document Word (.docx)' : 'Word Document (.docx)'}</th>
                            <th style={{ padding: '1rem 1.25rem', fontWeight: 800 }}>{lang === 'fr' ? 'Source Excel' : 'Excel Source'}</th>
                            <th style={{ padding: '1rem 1.25rem', fontWeight: 800 }}>{lang === 'fr' ? 'Modèle Officiel' : 'Official Template'}</th>
                            <th style={{ padding: '1rem 1.25rem', fontWeight: 800 }}>{lang === 'fr' ? 'Auteur & Date' : 'Author & Date'}</th>
                            <th style={{ padding: '1rem 1.25rem', fontWeight: 800 }}>{lang === 'fr' ? 'Statut Sécurité' : 'Security Status'}</th>
                            <th style={{ padding: '1rem 1.25rem', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFiles.map((doc, index) => (
                            <tr
                                key={doc.id}
                                style={{
                                    borderBottom: index === filteredFiles.length - 1 ? 'none' : '1px solid #F1F5F9',
                                    background: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                                    transition: 'background 0.15s ease'
                                }}
                            >
                                <td style={{ padding: '1rem 1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            background: 'rgba(2, 0, 108, 0.08)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#02006c',
                                            flexShrink: 0
                                        }}>
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <strong style={{ fontSize: '0.875rem', color: '#0F172A', display: 'block' }}>{doc.name}</strong>
                                            <span style={{ fontSize: '0.725rem', color: '#94A3B8' }}>{doc.size}</span>
                                        </div>
                                    </div>
                                </td>

                                <td style={{ padding: '1rem 1.25rem' }}>
                                    <div style={{ fontWeight: 700, color: '#1E293B' }}>{doc.sourceExcel}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Feuille: "{doc.sheetName}"</div>
                                </td>

                                <td style={{ padding: '1rem 1.25rem', color: '#334155', fontWeight: 600 }}>
                                    {doc.template}
                                </td>

                                <td style={{ padding: '1rem 1.25rem' }}>
                                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{doc.author}</div>
                                    <div style={{ fontSize: '0.725rem', color: '#64748B' }}>{doc.date}</div>
                                </td>

                                <td style={{ padding: '1rem 1.25rem' }}>
                                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '4px 10px' }}>
                                        <ShieldCheck size={13} /> {doc.status}
                                    </span>
                                </td>

                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => setSelectedWordDoc(doc)}
                                            className="btn-pill-light"
                                            style={{ padding: '0.45rem 0.85rem', fontSize: '0.775rem' }}
                                        >
                                            <Eye size={14} /> {lang === 'fr' ? 'Prévisualiser' : 'Preview'}
                                        </button>

                                        <button
                                            onClick={() => exportToWordDoc(doc)}
                                            style={{
                                                background: '#02006c',
                                                color: '#FFFFFF',
                                                border: 'none',
                                                borderRadius: '10px',
                                                padding: '0.45rem 0.85rem',
                                                fontSize: '0.775rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                        >
                                            <Download size={14} /> Docx
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

        </div>
    );
}
