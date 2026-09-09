import os

TARGET_DIR = "/home/nankeng/Documents/SolutionExcel_Word/cahier_excel_word"
SECTIONS_DIR = os.path.join(TARGET_DIR, "sections")
os.makedirs(SECTIONS_DIR, exist_ok=True)
os.makedirs(os.path.join(TARGET_DIR, "images"), exist_ok=True)

# Copy images
os.system(f"cp '/home/nankeng/Documents/SolutionExcel_Word/cahier de charge/images/'*.png '{TARGET_DIR}/images/' 2>/dev/null || true")
os.system(f"cp '/home/nankeng/Documents/SolutionExcel_Word/antic.png' '{TARGET_DIR}/images/' 2>/dev/null || true")

# main.tex
main_tex = r"""\documentclass[12pt,a4paper,oneside]{report}

% --- Language & encoding
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[french]{babel}
\usepackage{setspace}
\usepackage{helvet}

% --- Layout & Geometry
\usepackage{geometry}
\geometry{
    a4paper,
    total={160mm,247mm},
    left=25mm,
    top=25mm,
    bottom=25mm,
    right=25mm
}

% --- Visuals & Color palette
\usepackage[table]{xcolor}
\definecolor{primarycolor}{HTML}{1A365D}   % Deep Navy Blue
\definecolor{secondarycolor}{HTML}{2B6CB0} % Slate Blue
\definecolor{accentcolor}{HTML}{319795}    % Teal Accent
\definecolor{darktext}{HTML}{2D3748}       % Charcoal Dark Text
\definecolor{lightgray}{HTML}{F7FAFC}      % Warm Light Gray background
\definecolor{bordergray}{HTML}{E2E8F0}     % Border Gray

% Apply default text color
\color{darktext}

% --- Typography & Fonts
\usepackage{lmodern}
\usepackage{microtype}

% --- Section Formatting
\usepackage{titlesec}
\titleformat{\chapter}[block]
  {\normalfont\Huge\bfseries\sffamily\color{primarycolor}}
  {\color{accentcolor}\thechapter\hspace{15pt}\vline\hspace{15pt}}{0pt}{}
\titlespacing*{\chapter}{0pt}{-10pt}{30pt}

\titleformat{\section}
  {\normalfont\Large\bfseries\sffamily\color{primarycolor}}
  {\thesection}{1em}{}
\titlespacing*{\section}{0pt}{15pt}{10pt}

\titleformat{\subsection}
  {\normalfont\large\bfseries\sffamily\color{secondarycolor}}
  {\thesubsection}{1em}{}
\titlespacing*{\subsection}{0pt}{12pt}{6pt}

% --- Headers & Footers
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\sffamily\small\color{gray}Cahier des Charges --- Solution Excel vers Word}
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

% --- Graphic support & Diagrams
\usepackage{graphicx}
\usepackage{float}
\usepackage{amssymb}
\usepackage{tikz}
\usetikzlibrary{shapes,arrows,positioning,shadows}

% --- Tables
\usepackage{booktabs}
\usepackage{array}
\newcolumntype{L}[1]{>{\raggedright\let\newline\\\arraybackslash\hspace{0pt}}m{#1}}
\newcolumntype{C}[1]{>{\centering\let\newline\\\arraybackslash\hspace{0pt}}m{#1}}

% --- Lists
\usepackage{enumitem}
\setlist[itemize]{label=\color{accentcolor}\textbullet, leftmargin=20pt, topsep=4pt, itemsep=4pt}
\setlist[enumerate]{leftmargin=20pt, topsep=4pt, itemsep=4pt}

% --- Custom Callout Boxes 
\usepackage[most]{tcolorbox}
\newtcolorbox{infobox}[1]{
  colback=lightgray,
  colframe=accentcolor,
  fonttitle=\bfseries\sffamily\color{white},
  coltitle=white,
  title=#1,
  arc=4pt,
  left=10pt,
  right=10pt,
  top=8pt,
  bottom=8pt,
  boxrule=1.5pt,
  enhanced,
  shadow={2pt}{-2pt}{0pt}{black!10}
}
\newtcolorbox{warningbox}[1]{
  colback=lightgray,
  colframe=orange!80!black,
  fonttitle=\bfseries\sffamily\color{white},
  coltitle=white,
  title=#1,
  arc=4pt,
  left=10pt,
  right=10pt,
  top=8pt,
  bottom=8pt,
  boxrule=1.5pt,
  enhanced,
  shadow={2pt}{-2pt}{0pt}{black!10}
}
\newtcolorbox{dangerbox}[1]{
  colback=lightgray,
  colframe=red!80!black,
  fonttitle=\bfseries\sffamily\color{white},
  coltitle=white,
  title=#1,
  arc=4pt,
  left=10pt,
  right=10pt,
  top=8pt,
  bottom=8pt,
  boxrule=1.5pt,
  enhanced,
  shadow={2pt}{-2pt}{0pt}{black!10}
}

% --- Hyperlinks
\usepackage[pdftex]{hyperref}
\hypersetup{
    colorlinks=true,
    linkcolor=secondarycolor,
    citecolor=accentcolor,
    urlcolor=accentcolor,
    pdftitle={Cahier des Charges --- Solution Web Excel vers Word},
    pdfauthor={ANTIC},
    pdfsubject={Cahier des Charges Spécifications Fonctionnelles et Techniques},
    bookmarksnumbered=true,
    pdfpagemode=UseOutlines
}

\begin{document}

% --- Cover Page
\input{cover.tex}
\newpage

% --- Table of Contents
{
  \hypersetup{linkcolor=darktext}
  \tableofcontents
}
\newpage

\pagenumbering{arabic}

% --- Inclusion of Sections
\include{sections/01_presentation}
\include{sections/02_contexte}
\include{sections/03_problematique}
\include{sections/04_objectifs}
\include{sections/05_analyse_existant}
\include{sections/06_limites_existant}
\include{sections/07_solution_proposee}
\include{sections/08_fonctionnalites}
\include{sections/09_exigences_techniques}
\include{sections/14_livrables}
\include{sections/15_planning}
\include{sections/16_conclusion}

\end{document}
"""

cover_tex = r"""\begin{titlepage}

\begin{tikzpicture}[remember picture,overlay]
    \draw[line width=1.2pt,primarycolor]
    (current page.north west)+(2cm,-2.3cm) --
    (current page.north east)+(-2cm,-2.3cm);
    \draw[line width=1.2pt,primarycolor]
    (current page.south west)+(2cm,2cm) --
    (current page.south east)+(-2cm,2cm);
\end{tikzpicture}

\centering
\vspace*{-0.5cm}

\includegraphics[height=2.2cm,keepaspectratio]{images/antic.png}

\vspace{0.4cm}

{\Large\bfseries\color{primarycolor}
AGENCE NATIONALE DES TECHNOLOGIES\\[0.1cm]
DE L'INFORMATION ET DE LA COMMUNICATION
}

\vspace{0.15cm}
{\large\color{darktext} Département de l'Ingénierie Logicielle}

\vfill

{\Huge\bfseries\color{primarycolor}
CAHIER DES CHARGES
}

\vspace{0.2cm}
{\Large\bfseries\color{secondarycolor} Spécifications Fonctionnelles et Techniques}

\vfill

{\LARGE\bfseries\color{primarycolor}
Plateforme Web Sécurisée de Conversion\\[0.3cm]
et de Génération Documentaire (Excel vers Word)
}

\vspace{0.3cm}
{\large\itshape\color{darktext}
(Automatisation, Souveraineté Numérique et Sécurisation du Traitement Bureautique)
}

\vfill

\begin{minipage}{0.88\textwidth}
\centering\small\color{darktext}
Ce document présente l'ensemble des spécifications fonctionnelles, non fonctionnelles, organisationnelles et techniques relatives à la conception, au développement et au déploiement de la plateforme web souveraine d'automatisation de la conversion de fichiers Excel (.xlsx/.xls) en rapports Word (.docx) normalisés pour l'ANTIC.
\end{minipage}

\vfill

\begin{minipage}[t]{0.48\textwidth}
    \sffamily
    \textbf{\color{primarycolor}Réalisé par :}\\[0.15cm]
    \textbf{Équipe d'Ingénierie Logicielle}\\
    {\small Département des Développements et Systèmes\\
    Agence Nationale des Technologies de l'Information et de la Communication}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}
    \sffamily
    \textbf{\color{primarycolor}À l'attention de :}\\[0.15cm]
    \textbf{Direction Générale}\\
    {\small ANTIC}
\end{minipage}

\vspace{0.5cm}

{\small\sffamily\color{gray}
 \quad$\bullet$\quad Année Académique / Exercice 2026 \quad$\bullet$\quad 
}

\end{titlepage}
"""

sections = {}

sections["01_presentation.tex"] = r"""\chapter{Présentation du projet}

\section{Présentation générale}

L'Agence Nationale des Technologies de l'Information et de la Communication (ANTIC) est l'organe souverain chargé de la promotion, du développement et de la régulation des technologies de l'information et de la communication au Cameroun. Dans le cadre de ses attributions régaliennes, l'institution est amenée à collecter, traiter et consolider une quantité massive de tableaux de bord, de relevés d'incidents de cybersécurité, de récapitulatifs d'audits et d'indicateurs de régulation, initialement élaborés sous forme de classeurs Microsoft Excel (\textbf{.xlsx / .xls}).

Cependant, la transmission officielle de ces données vers la hiérarchie institutionnelle, les ministères de tutelle et les partenaires internationaux nécessite la rédaction de rapports éditables et formellement structurés sous Microsoft Word (\textbf{.docx}). 

Le processus actuellement employé s'appuie sur des applications bureautiques locales et sur de nombreuses interventions manuelles d'extraction, de mise en forme et de recopie des tableaux de données. Cette pratique rend les opérations particulièrement longues, répétitives et fortement exposées aux erreurs humaines de transcription.

Le présent projet consiste à concevoir et développer une nouvelle plateforme web centralisée, souveraine et sécurisée, permettant d'automatiser intégralement le processus de génération des rapports Word à partir des classeurs Excel, tout en garantissant la traçabilité des accès, la sanitarisation des fichiers et la pérennité du système.

\section{Objectif du projet}

L'objectif principal du projet est de mettre en place une plateforme web d'entreprise capable d'ingérer automatiquement des classeurs Excel et de générer instantanément des documents Word fidèles à la charte graphique et éditoriale de l'ANTIC.

De manière spécifique, la solution devra permettre de :
\begin{itemize}
    \item Éliminer les opérations manuelles de "Copier/Coller" entre les tableurs Excel et les documents Word ;
    \item Automatiser la conversion de chaque feuille de calcul (\textit{sheet}) en un chapitre structuré du document Word final ;
    \item Préserver le formatage des tableaux (bordures, en-têtes répétées, styles de cellules) ;
    \item Garantir la sécurité absolue des données institutionnelles en évitant le recours aux convertisseurs en ligne publics ;
    \item Assurer une traçabilité indélébile de chaque opération de conversion (horodatage, identité de l'agent, empreinte cryptographique SHA-256) ;
    \item Fournir une interface utilisateur web moderne, réactive et ergonomique accessible via un simple navigateur web.
\end{itemize}

\section{Périmètre du projet}

Le périmètre du projet englobe l'ensemble du cycle de vie du traitement documentaire, de la soumission du fichier Excel jusqu'au téléchargement sécurisé du document Word produit :
\begin{itemize}
    \item L'authentification sécurisée des utilisateurs habilités via l'annuaire ou le système de jetons JWT ;
    \item Le contrôle de conformité des fichiers téléchargés (validation par signature binaire ou \textit{magic bytes}, restriction de taille à 10 Mo) ;
    \item La sanitarisation automatique des classeurs Excel afin d'obstruer toute exécution de formules malicieuses ou de macros intégrées ;
    \item L'extraction intelligente des grilles de calcul et des métadonnées pour la génération dynamique du document Word ;
    \item La mise à disposition d'un lien de téléchargement éphémère interdisant le stockage persistant des documents générés sur le serveur applicatif ;
    \item La journalisation immutable de toutes les opérations au sein d'une base de données centralisée PostgreSQL.
\end{itemize}

En revanche, la plateforme n'a pas vocation à remplacer les logiciels de création initiale des classeurs Excel (comme Microsoft Excel ou LibreOffice Calc), ni à servir d'outil d'archivage documentaire permanent (GED).

\section{Parties prenantes}

Les principales parties prenantes impliquées dans le projet sont :
\begin{itemize}
    \item \textbf{L'Agence Nationale des Technologies de l'Information et de la Communication (ANTIC) :} Maître d'ouvrage et bénéficiaire final de la solution ;
    \item \textbf{La Direction Générale :} Instance de décision et de validation des orientations stratégiques ;
    \item \textbf{Le Département de l'Ingénierie Logicielle :} Équipe technique chargée de la conception, du développement et de la maintenance de la plateforme ;
    \item \textbf{Les Agents et Auditeurs Administrateurs :} Utilisateurs finaux autorisés à effectuer la conversion des rapports d'activités et tableaux de bord.
\end{itemize}

\section{Organisation du document}

Le présent cahier des charges s'articule autour de douze chapitres complémentaires :
\begin{enumerate}
    \item Présentation du projet ;
    \item Contexte institutionnel et métier ;
    \item Problématique et questions stratégiques ;
    \item Objectifs généraux et spécifiques ;
    \item Analyse de l'existant ;
    \item Limites de la situation actuelle ;
    \item Solution proposée et étude comparative des technologies ;
    \item Spécifications des exigences fonctionnelles et non fonctionnelles ;
    \item Architecture générale et choix technologiques ;
    \item Livrables du projet ;
    \item Planning et organisation des travaux ;
    \item Conclusion et perspectives.
\end{enumerate}
"""

sections["02_contexte.tex"] = r"""\chapter{Contexte}

\section{Contexte institutionnel}

L'ANTIC joue un rôle névralgique dans le paysage numérique national. Elle garantit la sécurité des systèmes d'information des administrations publiques, supervise la certification électronique et veille à la conformité technologique du cyberespace. En tant qu'institution publique de référence, la qualité, l'intégrité et la rigueur de ses livrables documentaires reflètent son niveau d'exigence réglementaire.

Chaque direction opérationnelle de l'ANTIC produit périodiquement des bilans techniques et analytiques destinés aux autorités gouvernementales. La production de ces documents s'inscrit dans un cadre institutionnel strict exigeant un niveau maximal de confidentialité et de réactivité.

\section{Contexte métier}

Le travail quotidien des ingénieurs et auditeurs de l'ANTIC implique le traitement de données matricielles sous forme de tableurs Excel. Ces classeurs synthétisent notamment :
\begin{itemize}
    \item Les statistiques de régulation et d'audit des infrastructures informatiques ;
    \item Les métriques de traitement d'incidents de sécurité du CERT national ;
    \item Les récapitulatifs financiers et budgétaires d'exploitation ;
    \item Les registres de suivi des contrôles de conformité.
\end{itemize}

Si le tableur Excel s'avère irremplaçable pour la manipulation des calculs, l'analyse numérique et la structuration en colonnes, il s'avère impropre à la présentation administrative officielle. Le format de restitution exigé par les instances décisionnelles est le document rédigé sous Microsoft Word, comportant une page de garde institutionnelle, une table des matières, une numérotation des chapitres et une mise en page soignée.

\section{Contexte du projet}

Jusqu'à présent, la conversion d'un classeur Excel vers un document Word structuré relevait entièrement du travail manuel des agents. La nécessité d'accélérer la production des rapports tout en éliminant les risques d'altération involontaire des chiffres a conduit la Direction Générale à prescrire l'automatisation intégrale de cette chaîne de traitement.

Ce projet s'inscrit pleinement dans le plan de transformation numérique interne de l'ANTIC, visant à moderniser les outils de travail des collaborateurs, à optimiser la productivité des équipes et à élever les standards de sécurité applicative de l'institution.
"""

sections["03_problematique.tex"] = r"""\chapter{Problématique}

\section{Présentation de la problématique}

La conversion périodique des tableaux de bord Excel en rapports éditables Word constitue une tâche à la fois critique et chronophage. Le processus manuel actuel crée un goulot d'étranglement opérationnel important lors des échéances de reporting.

L'absence d'un outil automatisé et sécurisé contraint les agents à effectuer des transferts de données artisanaux, générant une inefficacité globale et exposant l'institution à des vulnérabilités de sécurité et d'intégrité des informations.

\section{Problèmes identifiés}

L'analyse approfondie du travail quotidien des agents a permis de mettre en évidence plusieurs écueils majeurs :

\subsection{Multiplication des manipulations manuelles}
Le transfert d'un classeur Excel comprenant plusieurs dizaines d'onglets vers un document Word exige de copier et coller manuellement chaque tableau, puis d'en réajuster les bordures, la largeur des colonnes, la police et le style des en-têtes. Ce travail fastidieux peut mobiliser un agent pendant plusieurs heures pour un seul rapport.

\subsection{Risque élevé d'erreurs et d'altération des données}
Lors du copier-coller manuel ou de la manipulation des cellules, le risque est fort de tronquer des colonnes, de sauter des lignes de données ou d'altérer la mise en forme des nombres (arrondis, formats de dates). De telles altérations dans un rapport officiel peuvent fausser l'analyse des décideurs.

\subsection{Problématique majeure de sécurité et souveraineté}
Face à la lourdeur du travail manuel, certains collaborateurs peuvent être tentés de recourir à des services web gratuits de conversion accessibles sur Internet (tels que Convertio, ILovePDF ou Zamzar). Le transfert de documents institutionnels confidentiels sur des serveurs cloud tiers non maîtrisés constitue une violation grave des politiques de sécurité de l'ANTIC et menace la souveraineté numérique des données de l'État.

\subsection{Limites des scripts locaux et macros VBA}
L'utilisation de macros VBA locales sur les postes de travail représente une alternative fragile : les macros s'avèrent difficiles à maintenir, dépendent de la version exacte de Microsoft Office installée sur le poste utilisateur, ne fonctionnent pas sur tous les systèmes d'exploitation et peuvent transporter des scripts malveillants s'ils ne sont pas strictement contrôlés.

\subsection{Absence d'audit et de traçabilité}
En l'absence d'une plateforme centralisée, il est impossible pour les responsables d'audit de savoir qui a généré un rapport donné, à quelle date exacte, à partir de quel fichier source et si le document n'a pas subi de modifications non autorisées.

\section{Conséquences}

Les conséquences de ces problèmes sont directes et dommageables pour l'institution :
\begin{itemize}
    \item Perte de temps considérable pour les cadres et ingénieurs techniques ;
    \item Risque juridique et réputationnel lié à des erreurs de chiffres dans les rapports officiels ;
    \item Exposition accrue aux fuites de données d'État par l'utilisation de services SaaS externes ;
    \item Déficit de traçabilité et d'imputabilité dans la chaîne de production documentaire.
\end{itemize}

\section{Question de recherche}

Au vu de l'ensemble de ces facteurs, la problématique centrale du projet se formule ainsi :

\begin{quote}
\itshape
Comment concevoir et déployer une plateforme web souveraine, hautement sécurisée et performante, capable d'automatiser l'extraction et la mise en forme de classeurs Excel complexes vers des documents Word normalisés, tout en garantissant l'intégrité des données, la traçabilité des opérations et l'absence totale de persistance non contrôlée sur les serveurs applicatifs ?
\end{quote}
"""

sections["04_objectifs.tex"] = r"""\chapter{Objectifs du projet}

\section{Objectif général}

L'objectif général du projet est de concevoir, développer et déployer une plateforme web souveraine d'automatisation de la génération de documents Word à partir de classeurs Excel, garantissant un niveau élevé de sécurité, de performance et d'ergonomie pour l'ensemble des agents de l'ANTIC.

\section{Objectifs spécifiques}

De manière opérationnelle, le projet poursuit les objectifs spécifiques suivants :

\begin{enumerate}
    \item \textbf{Automatisation de la conversion :} Réduire le temps de génération d'un rapport Word complet à moins de 8 secondes, quel que soit le nombre d'onglets du classeur Excel source ;
    \item \textbf{Fidélité de la mise en page :} Transposer automatiquement chaque feuille de calcul en un chapitre distinct du document Word, en conservant le style des tableaux (bordures pleines, en-têtes répétées, alignements) ;
    \item \textbf{Souveraineté et sécurité des données :} Assurer un traitement 100\% local au sein de l'infrastructure de l'ANTIC, avec neutralisation automatique des macros et formules virales lors du parsing des fichiers ;
    \item \textbf{Traçabilité et auditability :} Journaliser dans une base de données PostgreSQL immuable l'identité de l'opérateur, l'horodatage précis de l'action et le condensat SHA-256 du fichier source ;
    \item \textbf{Gestion éphémère du stockage :} Mettre en place un mécanisme de purge immédiate des fichiers générés après téléchargement afin de ne conserver aucune donnée sensible sur le serveur Web ;
    \item \textbf{Expérience utilisateur moderne :} Offrir une interface Single Page Application (SPA) réactive dotée du glisser-déposer (\textit{Drag \& Drop}), de barres de progression dynamiques et de retours visuels clairs.
\end{enumerate}

\section{Résultats attendus}

À l'issue du projet, les résultats concrets suivants seront livrés et opérationnels :
\begin{itemize}
    \item Une application Web accessible sur le réseau intranet de l'ANTIC ;
    \item Un moteur de traitement backend Spring Boot robuste et évolutif ;
    \item Une base de données PostgreSQL configurée pour la journalisation d'audit ;
    \item Une suite de conteneurs Docker facilitant le déploiement et la maintenance de la solution ;
    \item Un document complet d'homologation et de recette fonctionnelle.
\end{itemize}
"""

sections["05_analyse_existant.tex"] = r"""\chapter{Analyse de l'existant}

\section{Présentation de la solution actuelle}

Actuellement, l'ANTIC ne dispose pas d'un outil centralisé dédié à la conversion automatisée de fichiers Excel en documents Word. Les agents utilisent les outils bureautiques standards installés sur leurs postes de travail individuels (Microsoft Office ou LibreOffice), combinés le cas échéant à des scripts VBA locaux ou à des convertisseurs en ligne non agréés.

\section{Fonctionnement général}

Le processus actuel d'élaboration d'un rapport Word à partir d'un tableur Excel se déroule selon les étapes suivantes :

\begin{enumerate}
    \item L'agent ouvre le classeur Excel source contenant les données compilées ;
    \item Il sélectionne manuellement la plage de cellules d'une feuille de calcul ;
    \item Il effectue la commande "Copier" ;
    \item Il ouvre un document Word vierge ou un modèle existant ;
    \item Il colle le tableau dans le document Word ;
    \item Il réajuste manuellement les propriétés du tableau (dimensions des colonnes, polices, couleurs de fond, bordures) ;
    \item Il répète cette suite d'opérations pour chaque onglet présent dans le classeur Excel ;
    \item Il enregistre et met en page le document Word final.
\end{enumerate}

\section{Acteurs du système actuel}

Les acteurs intervenant dans ce processus sont :
\begin{itemize}
    \item \textbf{L'agent ingénieur / auditeur :} Chargé d'extraire les données et d'effectuer la mise en page manuelle du document Word ;
    \item \textbf{Le chef de service / responsable d'unité :} Chargé de vérifier la conformité du rapport produit et de repérer d'éventuelles erreurs de frappe ou d'omission de tableaux ;
    \item \textbf{La Direction :} Destinataire final des rapports produits.
\end{itemize}

\section{Flux actuel des traitements}

Le schéma narratif du flux manuel met en évidence une succession d'opérations séquentielles sans aucun contrôle automatisé d'intégrité. Aucune barrière de sécurité n'empêche l'importation de fichiers vérolés ni l'export de données vers des plateformes externes non autorisées.

\section{Fonctionnalités de l'application actuelle}

Les fonctionnalités bureautiques existantes se résument aux fonctionnalités standards des logiciels de traitement de texte et de tableur hors-ligne :
\begin{itemize}
    \item Copier-coller basique (avec perte fréquente du formatage source) ;
    \item Retouche manuelle des bordures et styles de paragraphes ;
    \item Macros VBA locales (développées individuellement sans standardisation ni contrôle de version).
\end{itemize}

\section{Analyse critique}

L'analyse critique montre que ce mode de fonctionnement présente des déficiences majeures sur les plans de la productivité, de l'uniformité visuelle, de la sécurité et de la gouvernance des données. Il est urgent d'interrompre ce mode opératoire au profit d'une plateforme web moderne et contrôlée.
"""

sections["06_limites_existant.tex"] = r"""\chapter{Limites de l'application actuelle}

\section{Introduction}

Les limites de la situation actuelle touchent l'ensemble des dimensions fonctionnelles, techniques, opérationnelles et sécuritaires de l'institution.

\section{Limites fonctionnelles}

\begin{itemize}
    \item \textbf{Absence de conversion automatique par onglets :} Obligation de traiter chaque feuille de calcul séparément ;
    \item \textbf{Dégradation systématique de la mise en page :} Les tableaux collés sous Word dépassent fréquemment la largeur des marges de la page, nécessitant des ajustements manuels fastidieux ;
    \item \textbf{Manque de standardisation :} Chaque agent applique ses propres styles et couleurs, nuisant à l'image de marque et à l'uniformité des documents officiels de l'ANTIC.
\end{itemize}

\section{Limites techniques}

\begin{itemize}
    \item \textbf{Dépendance forte vis-à-vis des postes clients :} L'exécution de macros VBA exige la présence du logiciel Microsoft Office et d'un système d'exploitation compatible ;
    \item \textbf{Absence de centralisation :} Impossibilité de déployer une mise à jour globale sans réintervenir sur l'ensemble des ordinateurs du parc informatique ;
    \item \textbf{Surcharge inutile des ressources des postes de travail :} Les opérations lourdes de rendu bloquent l'ordinateur de l'utilisateur pendant le traitement.
\end{itemize}

\section{Limites opérationnelles}

\begin{itemize}
    \item \textbf{Délais d'exécution incompressibles :} La préparation d'un rapport de 50 pages exige jusqu'à une journée entière de travail manuel ;
    \item \textbf{Indisponibilité des ressources humaines :} Des ingénieurs qualifiés consacrent un temps précieux à des tâches de saisie et de mise en forme sans valeur ajoutée.
\end{itemize}

\section{Limites en matière de sécurité}

\begin{dangerbox}{Risque Critique de Fuite de Données et d'Infection Malware}
L'absence d'un outil interne sécurisé favorise le recours à des services en ligne gratuits (Cloud tiers), exposant l'ANTIC à l'espionnage industriel ou au vol d'informations souveraines. De plus, l'ouverture directe de classeurs Excel malicieux contenant des macros VBA cachées expose le réseau informatique de l'agence à des ransomwares ou cheval de Troie.
\end{dangerbox}

\section{Conclusion}

L'ensemble de ces constats impose le remplacement immédiat des pratiques actuelles par une solution web intégrée, souveraine et hautement disponible.
"""

sections["07_solution_proposee.tex"] = r"""\chapter{Solution proposée \& Étude Comparative}

\section{Vue d'ensemble}

Pour remédier définitivement aux défaillances du système actuel, le Département de l'Ingénierie Logicielle propose la création d'une plateforme web centralisée d'automatisation et de sécurisation de la conversion Excel vers Word.

Cette application web permettra à tout utilisateur autorisé de glisser-déposer un classeur Excel dans son navigateur et d'obtenir en quelques secondes un document Word parfaitement structuré, validé et conforme à la charte graphique de l'ANTIC.

\section{Principes de la solution}

La solution s'appuie sur quatre principes fondamentaux :
\begin{enumerate}
    \item \textbf{Centralisation et Souveraineté :} Hébergement 100\% local sur l'infrastructure sécurisée de l'ANTIC ;
    \item \textbf{Séparation stricte des couches (Architecture N-Tiers) :} Découplage total entre l'interface utilisateur, le moteur de calcul et la persistance des données d'audit ;
    \item \textbf{Sanitarisation et Sécurisation à l'entrée :} Analyse systématique des fichiers (Magic Bytes, désactivation des formules/macros) avant tout traitement ;
    \item \textbf{Volatilité du stockage applicatif :} Conversion en mémoire vive (RAM) et suppression immédiate du document produit après téléchargement.
\end{enumerate}

\section{Description générale de la solution}

L'utilisateur accède à la plateforme via son navigateur web après s'être authentifié. Il sélectionne ou glisse-dépose son fichier Excel (.xlsx ou .xls). Le moteur backend Spring Boot prend en charge le fichier, effectue la conversion dynamique onglet par onglet avec Apache POI, génère le document Word, consigne la trace d'audit dans la base PostgreSQL et renvoie un lien de téléchargement unique et temporaire.

\section{Tableau comparatif entre la solution actuelle et la solution proposée}

\renewcommand{\arraystretch}{1.4}
\begin{table}[H]
\centering
\small
\begin{tabular}{|L{3.5cm}|L{5.5cm}|L{6cm}|}
\hline
\rowcolor{primarycolor!15}
\textbf{Critère} & \textbf{Pratique actuelle (Manuelle / Cloud)} & \textbf{Solution Web Proposée} \\
\hline
\textbf{Architecture} & Postes isolés ou services SaaS externes & Application Web centralisée (N-Tiers) \\
\hline
\textbf{Temps de traitement} & 2 à 8 heures par rapport & Inférieur à 8 secondes \\
\hline
\textbf{Sécurité des données} & Risque fort de fuite (SaaS cloud) & 100\% local, souverain et chiffré \\
\hline
\textbf{Intégrité et Rendu} & Risques d'erreurs humaines de copie & Conversion automatique exacte (POI) \\
\hline
\textbf{Mise à jour \& Maintenance} & Complexe (poste par poste) & Instantanée (déploiement centralisé) \\
\hline
\textbf{Traçabilité et Audit} & Inexistante & Registre immuable PostgreSQL (SHA-256) \\
\hline
\end{tabular}
\caption{Comparaison entre la solution actuelle et la solution proposée}
\end{table}

\section{Étude comparative des technologies}

Afin de garantir le choix de la meilleure stack technique pour l'ANTIC, une analyse comparative rigoureuse a été menée sur le Backend et le Frontend.

\subsection{Analyse Comparative du Socle Backend (Moteur de Logique)}

\begin{table}[H]
\centering
\small
\begin{tabular}{|L{3cm}|L{4.5cm}|L{4.5cm}|L{2cm}|}
\hline
\rowcolor{primarycolor!15}
\textbf{Technologie} & \textbf{Avantages Décisifs} & \textbf{Inconvénients Majeurs} & \textbf{Décision} \\
\hline
\textbf{Node.js / Express} & Développement rapide, écosystème asynchrone V8. & Moteur monothread risquant d'être bloqué lors du parsing de gros fichiers Excel. Paquets Office moins stables. & \textcolor{red!80!black}{\textbf{Rejeté}} \\
\hline
\textbf{Python / FastAPI} & Excellent pour le traitement de données et l'IA. & Nécessite des serveurs WSGI/ASGI tiers (Uvicorn). Manipulation fine des structures Word/XML complexes moins naturelle qu'en Java. & \textcolor{orange!80!black}{\textbf{Écarté}} \\
\hline
\textbf{Java / Spring Boot 3} & Performance industrielle, multithreading robuste, gestion avancée de la mémoire. Bibliothèque \textbf{Apache POI} (référence mondiale pour manipuler nativement le format OpenXML Office). Sécurité maximale avec Spring Security. & Empreinte mémoire initiale plus élevée (JVM). & \textcolor{green!60!black}{\textbf{RETENU}} \\
\hline
\end{tabular}
\caption{Étude comparative des technologies Backend}
\end{table}

\subsection{Analyse Comparative de la Couche Frontend (Interface Utilisateur)}

\begin{table}[H]
\centering
\small
\begin{tabular}{|L{3cm}|L{4.5cm}|L{4.5cm}|L{2cm}|}
\hline
\rowcolor{primarycolor!15}
\textbf{Technologie} & \textbf{Avantages Décisifs} & \textbf{Inconvénients Majeurs} & \textbf{Décision} \\
\hline
\textbf{HTML / JS Statique} & Pas d'étape de compilation, simplicité absolue. & Impossible d'implémenter des intercepteurs JWT propres, un Drag \& Drop réactif et un état applicatif moderne. & \textcolor{red!80!black}{\textbf{Rejeté}} \\
\hline
\textbf{Angular} & Framework ultra structuré et complet. & Surdimensionné pour une interface centrée sur la conversion documentaire ; courbe d'apprentissage lourde. & \textcolor{orange!80!black}{\textbf{Écarté}} \\
\hline
\textbf{React.js + Vite} & Architecture basée sur des composants réutilisables, rendu ultra-rapide via Virtual DOM, compilation par Vite en quelques millisecondes, intégration parfaite avec Axios. & Nécessite le choix de bibliothèques tierces pour le routage (React-Router). & \textcolor{green!60!black}{\textbf{RETENU}} \\
\hline
\end{tabular}
\caption{Étude comparative des technologies Frontend}
\end{table}

\section{Valeur ajoutée du projet}

La plateforme web apporte à l'ANTIC une valeur ajoutée stratégique :
\begin{itemize}
    \item \textbf{Gain de temps institutionnel :} Libération de plusieurs centaines d'heures-hommes par an ;
    \item \textbf{Garantie de souveraineté :} Maîtrise intégrale de la chaîne d'information sensible ;
    \item \textbf{Qualité et conformité :} Uniformité esthétique et irréprochabilité des rapports remis aux autorités.
\end{itemize}

\section{Conclusion}

La solution proposée repose sur un choix technologique solide, moderne et adapté aux contraintes de sécurité et de performance de l'ANTIC. Le chapitre suivant détaille les exigences fonctionnelles et non fonctionnelles découlant de ce choix.
"""

sections["08_fonctionnalites.tex"] = r"""\chapter{Spécifications des Exigences}

\section{Introduction}

Ce chapitre recense l'exhaustivité des exigences fonctionnelles (FR) et non fonctionnelles (NFR) formulées pour la plateforme de conversion Excel vers Word de l'ANTIC.

\section{Matrice des exigences fonctionnelles}

\renewcommand{\arraystretch}{1.4}
\begin{table}[H]
\centering
\small
\begin{tabular}{|c|L{9.5cm}|c|}
\hline
\rowcolor{primarycolor!15}
\textbf{ID} & \textbf{Spécification de l'Exigence Fonctionnelle} & \textbf{Priorité} \\
\hline
FR-001 & Le système doit exiger une authentification préalable sécurisée par identifiant et mot de passe (ou jeton JWT). & Critique \\
\hline
FR-002 & Le système doit permettre le chargement de fichiers Excel sous les extensions \textbf{.xlsx} et \textbf{.xls}. & Critique \\
\hline
FR-003 & Le système doit limiter la taille des fichiers téléchargés à un plafond configurable de 10 Mo. & Élevée \\
\hline
FR-004 & Le système doit inspecter le type MIME réel (\textit{magic bytes}) pour interdire le renommage frauduleux d'exécutables. & Critique \\
\hline
FR-005 & Le système doit désactiver et neutraliser automatiquement toute formule ou macro intégrée au classeur. & Critique \\
\hline
FR-006 & Le système doit convertir chaque feuille de calcul (\textit{sheet}) du classeur en un chapitre dédié du document Word. & Critique \\
\hline
FR-007 & Le système doit générer les tableaux Word en conservant les bordures, couleurs d'en-tête et alignements source. & Élevée \\
\hline
FR-008 & Le système doit appliquer automatiquement la fonction de répétition des lignes d'en-tête sur les tableaux multi-pages. & Moyenne \\
\hline
FR-009 & Le système doit générer un lien de téléchargement temporaire unique pour récupérer le fichier Word produit. & Élevée \\
\hline
FR-010 & Le système doit immédiatement purger du serveur le fichier Word généré après téléchargement ou expiration du délai. & Critique \\
\hline
FR-011 & Le système doit consigner chaque opération dans un registre d'audit (agent, horodatage, hash SHA-256). & Critique \\
\hline
FR-012 & Le système doit afficher un tableau de bord récapitulant l'historique personnel des traitements de l'agent. & Moyenne \\
\hline
FR-013 & Le système doit afficher une barre de progression en temps réel durant le processus de conversion. & Moyenne \\
\hline
FR-014 & Le système doit notifier clairement l'utilisateur par des messages d'erreur explicites en cas de fichier corrompu. & Élevée \\
\hline
FR-015 & Le système doit offrir une interface d'administration permettant de gérer les comptes et rôles d'accès. & Élevée \\
\hline
\end{tabular}
\caption{Matrice complète des exigences fonctionnelles (FR)}
\end{table}

\section{Matrice des exigences non fonctionnelles}

\begin{table}[H]
\centering
\small
\begin{tabular}{|c|L{9.5cm}|c|}
\hline
\rowcolor{primarycolor!15}
\textbf{ID} & \textbf{Spécification de l'Exigence Non Fonctionnelle} & \textbf{Domaine} \\
\hline
NFR-001 & \textbf{Performance :} Le temps de conversion d'un fichier de 10 Mo ne doit pas dépasser 8 secondes. & Efficacité \\
\hline
NFR-002 & \textbf{Sécurité :} Toutes les communications réseau doivent être chiffrées au moyen du protocole TLS/HTTPS. & Sécurité \\
\hline
NFR-003 & \textbf{Confidentialité :} Aucun fichier utilisateur ne doit être conservé de manière persistante sur le serveur Web. & Souveraineté \\
\hline
NFR-004 & \textbf{Disponibilité :} La plateforme doit garantir un taux de disponibilité de 99,5\% pendant les heures d'ouverture. & Fiabilité \\
\hline
NFR-005 & \textbf{Maintenabilité :} Le code backend doit respecter les principes SOLID et le design pattern MVC de Spring Boot. & Qualité \\
\hline
NFR-006 & \textbf{Portabilité :} L'ensemble de la solution doit être conteneurisé sous Docker pour s'exécuter sur tout OS d'État. & Déploiement \\
\hline
NFR-007 & \textbf{Ergonomie :} L'interface React doit être 100\% responsive et respecter les normes d'accessibilité web (WCAG). & UX \\
\hline
NFR-008 & \textbf{Auditabilité :} La base PostgreSQL doit archiver les traces d'audit sous forme d'enregistrements immuables. & Conformité \\
\hline
NFR-009 & \textbf{Scalabilité :} L'architecture backend doit pouvoir absorber des sollicitations simultanées via un pool de threads. & Résilience \\
\hline
NFR-010 & \textbf{Intégrité :} Le hash SHA-256 du fichier calculé à l'entrée doit correspondre au registre d'audit. & Sécurité \\
\hline
\end{tabular}
\caption{Matrice complète des exigences non fonctionnelles (NFR)}
\end{table}
"""

sections["09_exigences_techniques.tex"] = r"""\chapter{Architecture générale et Choix technologiques}

\section{Introduction}

Ce chapitre décrit l'architecture logicielle globale de la plateforme web, la répartition des responsabilités entre les composants et la justification détaillée des choix de chaque brique technique.

\section{Vue d'ensemble de l'architecture (N-Tiers)}

La solution adopte une architecture découplée de type **Client-Serveur N-Tiers**. Cette séparation offre une sécurité renforcée, une grande modularité et une maintenance simplifiée.

\begin{figure}[H]
\centering
\begin{tikzpicture}[node distance=1.8cm, every node/.style={font=\sffamily\small}]

\tikzstyle{box}=[
draw=primarycolor,
line width=1pt,
rounded corners=4pt,
minimum width=3.4cm,
minimum height=1.1cm,
align=center,
fill=lightgray
]

\node[box](client){\textbf{Navigateur Web}\\Interface React (SPA)};
\node[box,below=of client](nginx){\textbf{Serveur Reverse Proxy}\\Nginx (HTTPS / TLS)};
\node[box,below left=of nginx](spring){\textbf{Backend API REST}\\Java 17 / Spring Boot 3};
\node[box,below right=of nginx](poi){\textbf{Moteur de Conversion}\\Apache POI (XWPF/XSSF)};
\node[box,below=of spring](db){\textbf{Base de Données}\\PostgreSQL (Audit \& Auth)};

\draw[->, line width=1.2pt, primarycolor](client) -- node[right, font=\tiny]{Requête HTTPS / JWT} (nginx);
\draw[->, line width=1.2pt, primarycolor](nginx) -- (spring);
\draw[<->, line width=1.2pt, accentcolor](spring) -- node[above, font=\tiny]{Parsing RAM} (poi);
\draw[->, line width=1.2pt, primarycolor](spring) -- node[left, font=\tiny]{Logs Audit} (db);

\end{tikzpicture}
\caption{Architecture générale N-Tiers de la plateforme Excel-Word}
\end{figure}

\section{Choix des technologies}

\subsection{Backend : Java 17 \& Spring Boot 3}
\begin{figure}[H]
\centering
\includegraphics[height=1.8cm,keepaspectratio]{images/antic.png}
\end{figure}

Spring Boot 3 constitue le cœur applicatif de la solution. Il fournit une infrastructure robuste pour la création d'API REST sécurisées.
\begin{itemize}
    \item \textbf{Spring Security \& JWT :} Gestion stateless de l'authentification et protection contre les attaques CSRF/XSS ;
    \item \textbf{Multithreading natif :} Gestion optimisée des requêtes simultanées de conversion via le pool de threads de Tomcat/JVM ;
    \item \textbf{Apache POI :} Bibliothèque industrielle incontournable permettant la manipulation directe des fichiers OpenXML (.xlsx et .docx) en mémoire sans nécessiter l'installation de Microsoft Office.
\end{itemize}

\subsection{Frontend : React 18 \& Vite}
\begin{figure}[H]
\centering
\includegraphics[height=1.8cm,keepaspectratio]{images/react.png}
\end{figure}

React a été sélectionné pour la construction de l'interface utilisateur Single Page Application (SPA).
\begin{itemize}
    \item \textbf{Composants réutilisables :} Conception modulaire de la zone de glisser-déposer, des barres de progression et des notifications ;
    \item \textbf{Vite :} Outil de construction extrêmement rapide offrant des temps de rechargement instantanés ;
    \item \textbf{Axios Interceptors :} Injection automatique du jeton JWT dans les en-têtes HTTP de chaque requête vers l'API.
\end{itemize}

\subsection{Base de Données : PostgreSQL 15}
\begin{figure}[H]
\centering
\includegraphics[height=1.8cm,keepaspectratio]{images/postgresql.png}
\end{figure}

PostgreSQL est le système de gestion de base de données relationnelle retenu pour l'archivage immuable des traces d'audit et la gestion des utilisateurs.
\begin{itemize}
    \item Conformité stricte aux propriétés ACID ;
    \item Prise en charge des fonctions cryptographiques natives (calcul de SHA-256) ;
    \item Fiabilité reconnue pour les environnements gouvernementaux critiques.
\end{itemize}

\subsection{Infrastructures : Nginx, Docker et Docker Compose}
\begin{figure}[H]
\centering
\includegraphics[height=1.8cm,keepaspectratio]{images/docker.png}
\end{figure}

L'ensemble de la plateforme est conteneurisé au moyen de Docker et orchestré par Docker Compose, garantissant une isolation totale des services et un déploiement sans friction sur les serveurs intranet de l'ANTIC. Nginx assure le rôle de reverse proxy, gérant la terminaison SSL/TLS et la livraison fluide des ressources statiques React.

\section{Synthèse de la stack technique}

\begin{table}[H]
\centering
\small
\begin{tabular}{|L{3cm}|L{3.5cm}|L{7.5cm}|}
\hline
\rowcolor{primarycolor!15}
\textbf{Composant} & \textbf{Technologie} & \textbf{Rôle et Justification} \\
\hline
\textbf{Frontend} & React.js 18 + Vite & Interface utilisateur SPA moderne, dynamique et réactive. \\
\hline
\textbf{Backend API} & Spring Boot 3 (Java 17) & Moteur de logique métier, API REST et sécurité JWT. \\
\hline
\textbf{Moteur Conversion} & Apache POI 5.x & Transformation native des structures XML Excel vers Word. \\
\hline
\textbf{Base de données} & PostgreSQL 15 & Stockage persistant des utilisateurs et des journaux d'audit. \\
\hline
\textbf{Reverse Proxy} & Nginx & Sécurisation SSL/TLS et répartition de la charge Web. \\
\hline
\textbf{Conteneurisation} & Docker \& Compose & Portabilité et déploiement standardisé inter-environnements. \\
\hline
\end{tabular}
\caption{Synthèse des choix technologiques de l'architecture}
\end{table}
"""

sections["14_livrables.tex"] = r"""\chapter{Livrables du projet}

\section{Introduction}

La réalisation du projet donnera lieu à la fourniture d'un ensemble complet de livrables logiciels, documentaires et d'infrastructure, garantissant le transfert de compétences et la maîtrise totale de la solution par l'ANTIC.

\section{Liste des livrables}

\renewcommand{\arraystretch}{1.4}
\begin{table}[H]
\centering
\small
\begin{tabular}{|c|L{4cm}|L{8.5cm}|}
\hline
\rowcolor{primarycolor!15}
\textbf{Catégorie} & \textbf{Livrable} & \textbf{Description} \\
\hline
\textbf{Documentation} & Cahier des Charges & Le présent document validé détaillant les spécifications fonctionnelles et techniques. \\
\hline
\textbf{Documentation} & Dossier d'Architecture & Document détaillant l'architecture logicielle N-Tiers, le modèle conceptuel de données (MCD) et la sécurité. \\
\hline
\textbf{Logiciel} & Code Source Backend & Projets Maven Spring Boot 3 complets, commentés et testés. \\
\hline
\textbf{Logiciel} & Code Source Frontend & Application React.js complète structurée par composants et services API. \\
\hline
\textbf{Infrastructure} & Scripts Docker & Fichiers `Dockerfile` et `docker-compose.yml` préconfigurés pour le déploiement. \\
\hline
\textbf{Recette} & Procès-Verbal de Recette & Rapport de tests fonctionnels et d'homologation des conversions documentaires. \\
\hline
\textbf{Exploitation} & Manuel d'Utilisation & Guide illustré destiné aux agents pour la soumission et la conversion des fichiers. \\
\hline
\end{tabular}
\caption{Tableau récapitulatif des livrables du projet}
\end{table}
"""

sections["15_planning.tex"] = r"""\chapter{Planning et Organisation du projet}

\section{Introduction}

Afin de garantir le respect des délais et des exigences de qualité de l'ANTIC, le projet s'exécute sur une période globale de quatre (4) semaines, structurée en quatre phases majeures.

\section{Découpage des activités}

Le projet est découpé selon les lots de travaux suivants :
\begin{itemize}
    \item \textbf{Lot 1 : Spécification et Architecture (Semaine 1) :} Rédaction du cahier des charges, modélisation de la base de données PostgreSQL, validation du schéma d'architecture ;
    \item \textbf{Lot 2 : Développement Backend \& Conversion (Semaine 2) :} Implémentation du moteur Spring Boot, intégration de la bibliothèque Apache POI, développement des filtres de sécurité JWT et des services d'audit ;
    \item \textbf{Lot 3 : Développement Frontend \& Intégration (Semaine 3) :} Création de l'interface React, développement du composant de glisser-déposer, raccordement aux API REST via Axios ;
    \item \textbf{Lot 4 : Recette, Déploiement et Formation (Semaine 4) :} Tests d'homologation, conteneurisation Docker, déploiement sur les VM de test et rédaction du manuel utilisateur.
\end{itemize}

\section{Planning prévisionnel et Jalons}

\begin{table}[H]
\centering
\small
\begin{tabular}{|L{3.5cm}|L{7cm}|c|c|}
\hline
\rowcolor{primarycolor!15}
\textbf{Phase} & \textbf{Livrables / Activités Principales} & \textbf{Début} & \textbf{Jalon} \\
\hline
\textbf{Phase 1 : Conception} & Cahier des charges LaTeX, Schéma BDD & S1 & J1 : Validation Plan \\
\hline
\textbf{Phase 2 : Backend} & API REST Spring Boot, Moteur POI, Secu & S2 & J2 : Moteur Conforme \\
\hline
\textbf{Phase 3 : Frontend} & Interface React.js, Drag \& Drop, Axios & S3 & J3 : UI Opérationnelle \\
\hline
\textbf{Phase 4 : Validation} & Conteneurs Docker, Recette & S4 & J4 : Livraison Finale \\
\hline
\end{tabular}
\caption{Planning synthétique et jalons du projet}
\end{table}

\section{Organisation des travaux}

Les développements sont menés selon une méthodologie agile (Scrum/Kanban) avec des points de suivi réguliers auprès de la Direction Générale et des équipes d'Ingénierie Logicielle de l'ANTIC.
"""

sections["16_conclusion.tex"] = r"""\chapter{Conclusion et Perspectives}

\section{Conclusion}

La conception de cette plateforme web de conversion sécurisée d'Excel vers Word répond à un besoin stratégique majeur pour l'ANTIC. En substituant un processus manuel, fragmenté et risqué par une application centralisée, performante et souveraine, l'institution franchit un cap décisif dans la modernisation de son ingénierie documentaire.

L'architecture N-Tiers retenue, associant la robustesse de Java Spring Boot et d'Apache POI à la réactivité de React.js et PostgreSQL, offre toutes les garanties de sécurité, d'auditabilité et de scalabilité requises par les standards de l'État.

\section{Perspectives d'évolution}

La modularité de la solution proposée permet d'envisager plusieurs extensions futures :
\begin{itemize}
    \item \textbf{Génération directe au format PDF :} Ajout d'un module d'export immédiat au format PDF signé électroniquement par le certificat de l'ANTIC ;
    \item \textbf{Connecteurs automatisés :} Connexion directe avec les systèmes d'information internes pour l'extraction automatique des données sans soumission manuelle du fichier Excel ;
    \item \textbf{Module d'IA décisionnelle :} Analyse sémantique automatique des données converties pour générer des résumés exécutifs intelligents en tête de rapport.
\end{itemize}
"""

with open(os.path.join(TARGET_DIR, "main.tex"), "w", encoding="utf-8") as f:
    f.write(main_tex)

with open(os.path.join(TARGET_DIR, "cover.tex"), "w", encoding="utf-8") as f:
    f.write(cover_tex)

for filename, content in sections.items():
    with open(os.path.join(SECTIONS_DIR, filename), "w", encoding="utf-8") as f:
        f.write(content)

print("✅ Fichiers LaTeX modulaires générés avec succès.")
