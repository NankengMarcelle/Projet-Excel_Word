import os
import shutil

TARGET_DIR = "cahier_excel_word"
SECTIONS_DIR = os.path.join(TARGET_DIR, "sections")

os.makedirs(SECTIONS_DIR, exist_ok=True)
os.makedirs(os.path.join(TARGET_DIR, "images"), exist_ok=True)

# Copie des images (antic, on copie ce qu'on a car wget avait posé probleme)
os.system(f"cp 'cahier de charge/images/antic.png' {TARGET_DIR}/images/")

main_tex = r"""\documentclass[12pt,a4paper,oneside]{report}

\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[french]{babel}
\usepackage{setspace}
\usepackage{helvet}
\usepackage{geometry}
\geometry{a4paper, total={160mm,247mm}, left=25mm, top=25mm, bottom=25mm, right=25mm}
\usepackage[table]{xcolor}
\definecolor{primarycolor}{HTML}{1A365D}
\definecolor{secondarycolor}{HTML}{2B6CB0}
\definecolor{accentcolor}{HTML}{319795}
\definecolor{darktext}{HTML}{2D3748}
\definecolor{lightgray}{HTML}{F7FAFC}
\color{darktext}
\usepackage{lmodern}
\usepackage{microtype}
\usepackage{titlesec}
\titleformat{\chapter}[block]
  {\normalfont\Huge\bfseries\sffamily\color{primarycolor}}
  {\color{accentcolor}\thechapter\hspace{15pt}\vline\hspace{15pt}}{0pt}{}
\titlespacing*{\chapter}{0pt}{-10pt}{30pt}
\titleformat{\section}{\normalfont\Large\bfseries\sffamily\color{primarycolor}}{\thesection}{1em}{}
\titleformat{\subsection}{\normalfont\large\bfseries\sffamily\color{secondarycolor}}{\thesubsection}{1em}{}
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\sffamily\small\color{gray}Cahier des Charges --- Excel_Word}
\fancyhead[R]{\sffamily\small\color{gray}ANTIC}
\fancyfoot[C]{\sffamily\small\thepage}
\renewcommand{\headrulewidth}{0.4pt}
\renewcommand{\footrulewidth}{0.0pt}
\setlength{\headheight}{15pt}
\fancypagestyle{plain}{
  \fancyhf{}
  \fancyfoot[C]{\sffamily\small\thepage}
  \renewcommand{\headrulewidth}{0.0pt}
}
\usepackage{graphicx}
\usepackage{float}
\usepackage{booktabs}
\usepackage{array}
\newcolumntype{L}[1]{>{\raggedright\let\newline\\\arraybackslash\hspace{0pt}}m{#1}}
\newcolumntype{C}[1]{>{\centering\let\newline\\\arraybackslash\hspace{0pt}}m{#1}}
\usepackage{enumitem}
\usepackage[most]{tcolorbox}
\newtcolorbox{infobox}[1]{colback=lightgray, colframe=accentcolor, fonttitle=\bfseries\sffamily\color{white}, title=#1}
\newtcolorbox{warningbox}[1]{colback=lightgray, colframe=orange!80!black, fonttitle=\bfseries\sffamily\color{white}, title=#1}
\usepackage[pdftex]{hyperref}
\hypersetup{colorlinks=true, linkcolor=secondarycolor, urlcolor=accentcolor}

\begin{document}
\input{cover.tex}
\newpage
{
  \hypersetup{linkcolor=darktext}
  \tableofcontents
}
\newpage
\pagenumbering{arabic}
\include{sections/01_presentation}
\include{sections/02_contexte}
\include{sections/03_problematique}
\include{sections/04_objectifs}
\include{sections/05_analyse_existant}
\include{sections/06_limites_existant}
\include{sections/07_solution_proposee}
\include{sections/08_fonctionnalites}
\include{sections/09_exigences_techniques}
\include{sections/10_livrables}
\include{sections/11_planning}
\include{sections/12_conclusion}
\end{document}
"""

cover_tex = r"""\begin{titlepage}
\centering
\vspace*{-0.5cm}
\includegraphics[height=2.2cm,keepaspectratio]{images/antic.png}
\vspace{0.4cm}
{\Large\bfseries\color{primarycolor} AGENCE NATIONALE DES TECHNOLOGIES\\[0.1cm] DE L'INFORMATION ET DE LA COMMUNICATION}
\vspace{0.15cm}
{\large\color{darktext} Département de l'Ingénierie Logicielle}
\vfill
{\Huge\bfseries\color{primarycolor} CAHIER DES CHARGES}
\vspace{0.2cm}
{\Large\bfseries\color{secondarycolor} Fonctionnel et Technique}
\vfill
{\LARGE\bfseries\color{primarycolor} Plateforme Web Sécurisée (Excel vers Word)}
\vspace{0.3cm}
{\large\itshape\color{darktext} (Automatisation Avancée de la Manipulation Bureautique)}
\vfill
\begin{minipage}{0.88\textwidth}
\centering\small\color{darktext}
Ce document présente les spécifications fonctionnelles et techniques relatives à la conception de la plateforme web souveraine destinée au traitement des bases Excel vers des rapports normalisés Word.
\end{minipage}
\vfill
\begin{minipage}[t]{0.48\textwidth}
\sffamily\textbf{\color{primarycolor}Équipe Ingénierie:}\\ Département des Développements
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}
\sffamily\textbf{\color{primarycolor}Commanditaire:}\\ Direction Générale de l'ANTIC
\end{minipage}
\vspace{0.5cm}
{\small\sffamily\color{gray} \quad$\bullet$\quad Année 2026 \quad$\bullet$\quad }
\end{titlepage}
"""

files = {
    "01_presentation.tex": r"\chapter{Présentation}\nL'Agence Nationale des Technologies de l'Information et de la Communication (ANTIC) orchestre la régulation technologique. Ce document détaille le projet logiciel ambitieux d'automatiser le traitement documentaire, un poste chronophage et sujet à multiples erreurs de transcriptions manuelles.",
    "02_contexte.tex": r"\chapter{Contexte}\nLe cycle de validation institutionnelle requiert constamment l'assemblage de documents Word officiels. Ces fichiers cibles proviennent inévitablement de lourds tableaux de bord matriciels construits en Excel. Actuellement, des cellules humaines assurent manuellement la copie des éléments d'analyse.",
    "03_problematique.tex": r"\chapter{Problématique}\nLa réconciliation logicielle et organique de milliers de cellules vers un texte linéaire officiel pose de massifs défis en termes de rapidité d'exécution. Par ailleurs, la question centrale de ce projet concerne la sécurité absolue des données extraites : comment éviter de recourir aux convertisseurs publics tout en automatisant la génération de documents structurés ?",
    "04_objectifs.tex": r"\chapter{Objectifs}\nL'objectif supérieur de l'initiative est la protection totale des périmètres d'informations. L'outil doit isoler les fichiers traités sur un serveur local hermétique. L'objectif subsidiaire concerne le formatage du rapport: il doit transposer fidèlement chaque feuille de classeur Excel en un chapitre distinct d'un unique document Word.",
    "05_analyse_existant.tex": r"\chapter{Analyse de l'existant}\nLes équipes font massivement usage de macros VBA instables ou pire, subissent la tentation d'externaliser ce travail fastidieux sur l'outil ILovePDF ou Zamzar... Deux environnements qui portent d'immenses fissures sécuritaires.",
    "06_limites_existant.tex": r"\chapter{Limites de l'existant}\nL'usage du cloud enfreint catégoriquement les lois RGPD et expose les délibérations de l'institution au vol espionnage indéterminé. Les macros, si robustes, cassent souvent aux grès du patching des instances MS Office individuelles.",
    "07_solution_proposee.tex": r"\chapter{Solution proposée \& Analyse Comparative}\n\section{Choix Technologique}\n\begin{table}[H]\n\centering\small\begin{tabular}{L{3.5cm} L{4.5cm} L{3.5cm} L{1.5cm}}\n\toprule\textbf{Technologie} & \textbf{Avantages} & \textbf{Inconvénients} & \textbf{Choix} \\\n\midrule \textbf{Node.js} & Très véloce pour l'I/O réseau & Monothread très bloquant si parsing massif Excel & \textcolor{red}{\textbf{Rejeté}} \\ \midrule \textbf{Java Spring Boot} & Multithread mature, framework natif Apache POI sans rival pour modifier l'XML du document Word. Securité ultra forte (Spring Security). & Empreinte mémoire massive (JVM) mais gérable sur les VM de l'Agence & \textcolor{green!60!black}{\textbf{Retenu}} \\\bottomrule\end{tabular}\end{table}\nL'interface sera réalisée en React.js propulsée par Vite pour masquer la granularité de tout le process via une interface Drag et Drop de classe entreprise.",
    "08_fonctionnalites.tex": r"\chapter{Fonctionnalités}\n- Interception et analyse sécurisée (Anti-Malware, Magic Bytes, rejet >10Mo).\n- Parsing systématique feuille par feuille via Apache POI.\n- Style tabulaire Word natif (Bordures pleines, duplication auto de l'en-tête).\n- Remise éphémérique du rapport .docx à l'utilisateur ciblé.",
    "09_exigences_techniques.tex": r"\chapter{Exigences techniques}\nArchitecture logicielle N-Tiers.\nLe frontend (React) gère visuellement la requête Ajax avec l'incorporation de l'entête Httponly JWT. \nLe coeur de régulation (Spring) absorbe le choc. \nLa bdd PostgreSQL mémorise la transaction pour l'outil de conformité et l'observabilité.",
    "10_livrables.tex": r"\chapter{Livrables}\n- Déploiement logiciel encapsulé par Docker (Frontend container, Backend container)\n- Documentation API REST OpenAPI/Swagger\n- Rapport final compilé\n- Support technique et formations des auditeurs sur l'outil d'ingestion bureautique.",
    "11_planning.tex": r"\chapter{Planning}\nSemaine 1 : Clôture Charte Spécification & Modélisation Base de données.\nSemaine 2 : Codage intensif Moteur Java Apache POI.\nSemaine 3 : Restitution UI avec le React.\nSemaine 4 : Recettage & Homologation Finale dans la ferme des VMs.",
    "12_conclusion.tex": r"\chapter{Conclusion}\nCe dispositif endogène d'édition assure à la structure une émancipation totale des logiciels SAAS tiers dangeureux. La soumission à une authentification stricte, alliée au formatage inamovible du rendu texte, achève de résoudre un épineux complexe bureautique institutionnel, de manière tout à fait pérenne et scalable."
}

with open(f"{TARGET_DIR}/main.tex", "w") as f:
    f.write(main_tex)
with open(f"{TARGET_DIR}/cover.tex", "w") as f:
    f.write(cover_tex)

for name, content in files.items():
    with open(f"{SECTIONS_DIR}/{name}", "w") as f:
        f.write(content.replace(r"\n", "\n\n"))

print("Projet LaTeX modulaire généré.")
