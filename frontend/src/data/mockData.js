export const currentUser = {
    id: "usr-1",
    name: "PIERRE MARCELLE NANKENG",
    email: "p.nankeng@antic.cm",
    role: "ANTIC Worker",
    department: "Division des Études et du Développement des TIC",
    avatar: "PN"
};

export const sampleWorkbooks = [
    {
        id: "wb-001",
        name: "Rapport_Trimestriel_Activites_2026.xlsx",
        size: "2.4 MB",
        updatedAt: "2026-08-30 14:22",
        sheetsCount: 4,
        parentSheet: "Synthese_Generale",
        status: "Synchronisé",
        sheets: [
            {
                name: "Synthese_Generale",
                isParent: true,
                data: [
                    ["Direction / Service", "Budget Alloué (FCFA)", "Dépenses Réalisées", "Taux d'Exécution", "Statut Audit"],
                    ["Division Études & Dev TIC", "45 000 000", "41 200 000", "91.5%", "Validé"],
                    ["Direction Sécurité Virtuelle", "60 000 000", "58 400 000", "97.3%", "Validé"],
                    ["Direction Infrastructures", "85 000 000", "79 100 000", "93.0%", "En cours"],
                    ["Administration & RH", "30 000 000", "28 900 000", "96.3%", "Validé"]
                ]
            },
            {
                name: "Detail_Etudes_TIC",
                isChild: true,
                parentId: "Synthese_Generale",
                data: [
                    ["Projet / Activité", "Responsable", "Budget (FCFA)", "Livrable Word"],
                    ["Plateforme Conversion Excel-Word", "NKWAIN REMI / NANKENG P.", "18 500 000", "Généré"],
                    ["Audit de Sécurité S/MIME", "Division Dev TIC", "12 000 000", "Généré"],
                    ["Refonte Portail Institutionnel", "Équipe Web", "10 700 000", "En cours"]
                ]
            },
            {
                name: "Statistiques_Converties",
                isChild: false,
                data: [
                    ["Mois", "Fichiers Excel Importés", "Documents Word Générés", "Gain de Temps Est. (h)"],
                    ["Mai 2026", "142", "142", "71 h"],
                    ["Juin 2026", "189", "189", "94.5 h"],
                    ["Juillet 2026", "215", "215", "107.5 h"],
                    ["Août 2026", "260", "260", "130 h"]
                ]
            }
        ]
    },
    {
        id: "wb-002",
        name: "Tableau_Bord_Securite_Systemes.xlsx",
        size: "1.8 MB",
        updatedAt: "2026-08-28 09:15",
        sheetsCount: 3,
        parentSheet: "KPI_Securite",
        status: "Converti en Word",
        sheets: [
            {
                name: "KPI_Securite",
                isParent: true,
                data: [
                    ["Indicateur Clé", "Valeur Cible", "Valeur Mesurée", "Écart (%)", "Recommandation Word"],
                    ["Taux de Chiffrement Données", "100%", "100%", "0.0%", "Conforme"],
                    ["Disponibilité Plateforme Web", "99.9%", "99.95%", "+0.05%", "Excellente"],
                    ["Temps de Conversion Moyen", "< 5 sec", "2.1 sec", "-58%", "Optimal"]
                ]
            },
            {
                name: "Incidents_Et_Audits",
                isChild: false,
                data: [
                    ["Date Audit", "Périmètre", "Auditeur", "Résultat"],
                    ["2026-08-10", "Plateforme Excel-Word", "DSI ANTIC", "Conformité 100%"],
                    ["2026-08-20", "Sécurité Réseau", "ANSSI / ANTIC", "Validé"]
                ]
            }
        ]
    },
    {
        id: "wb-003",
        name: "Suivi_Projets_Souverains_2026.xlsx",
        size: "3.1 MB",
        updatedAt: "2026-08-25 16:40",
        sheetsCount: 5,
        parentSheet: "Portfolio_General",
        status: "Brouillon",
        sheets: [
            {
                name: "Portfolio_General",
                isParent: true,
                data: [
                    ["ID Projet", "Nom du Projet", "Chef de Projet", "Phase", "Date Fin Prevue"],
                    ["PRJ-01", "Plateforme Souveraine Excel->Word", "NANKENG / NKWAIN", "Implémentation", "2026-09-30"],
                    ["PRJ-02", "Intégration S/MIME iRedAdmin", "NKWAIN REMI", "Recette", "2026-09-15"],
                    ["PRJ-03", "Annuaire National Certificats", "ANTIC Dev Team", "Conception", "2026-10-31"]
                ]
            }
        ]
    }
];

export const conversionHistory = [
    {
        id: "conv-101",
        fileName: "Rapport_Trimestriel_Activites_2026.xlsx",
        sheetName: "Synthese_Generale",
        outputWord: "Rapport_Synthese_Generale_ANTIC.docx",
        convertedAt: "2026-08-30 14:30",
        convertedBy: "PIERRE MARCELLE NANKENG",
        templateStyle: "Rapport Officiel Normalisé",
        status: "Terminé"
    },
    {
        id: "conv-102",
        fileName: "Tableau_Bord_Securite_Systemes.xlsx",
        sheetName: "KPI_Securite",
        outputWord: "Tableau_Bord_KPI_Securite.docx",
        convertedAt: "2026-08-28 09:20",
        convertedBy: "NKWAIN REMI KUMA",
        templateStyle: "Synthèse Exécutive",
        status: "Terminé"
    }
];
