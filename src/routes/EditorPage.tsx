import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LocaleType, type IWorksheetData } from "@univerjs/presets";
import { getWorkbook } from "../api/workbooks";
import { getWorksheet, updateWorksheet } from "../api/worksheets";
import { backendToUniverWorksheetData } from "../univer/adapter";
import { UniverSheetGrid } from "../univer/UniverSheetGrid";
import { useDebouncedAutosave, type SaveStatus } from "../hooks/useDebouncedAutosave";
import { EditorTopBar } from "../components/editor/EditorTopBar";
import { ChildSheetModal } from "../components/childSheet/ChildSheetModal";
import { ChildSheetSyncPanel } from "../components/sync/ChildSheetSyncPanel";
import { ChevronIcon } from "../components/icons/EditorIcons";
import { EditorFooter } from "../components/editor/EditorFooter";
import { GridErrorBoundary } from "../components/editor/GridErrorBoundary";
import type { WorksheetData, WorksheetRead } from "../types/worksheet";
import { copy } from "../i18n/copy";
import { useLang } from "../i18n/useLang";
import "./EditorPage.css";

const CHROME_COLLAPSED_KEY = "sheetflow_editor_titlebar_collapsed";

// Migrated from Fortune-sheet to Univer — see backend/CLAUDE.md's "Formula values" section for
// the full root-cause trail. Short version: Fortune-sheet's formula engine has a known, open,
// unfixed upstream bug that crashed the app on bulk-calculating a large real workbook. A headless
// Node spike proved Univer's engine handles the exact same real data cleanly (375/375 formulas
// computed, broken #REF! references handled natively as error values, zero crashes) — see
// univer/adapter.ts and univer/UniverSheetGrid.tsx. No calculateFormula()-style explicit trigger
// is needed here: Univer computes formulas on load by itself. GridErrorBoundary is kept as a
// general safety net regardless — cheap insurance, not a sign a specific crash is expected here.
//
// Only mounted once every worksheet's initial data has loaded, so the autosave hook's per-sheet
// "last saved" baselines are seeded from real data on their very first render.
function EditorWorkbookReady({
  workbookId,
  initialWorksheets,
  worksheetDataList,
  onStatusChange,
  onFlushReady,
}: {
  workbookId: string;
  initialWorksheets: IWorksheetData[];
  worksheetDataList: WorksheetData[];
  onStatusChange: (status: SaveStatus) => void;
  onFlushReady: (flush: () => void) => void;
}) {
  const { lang } = useLang();
  const t = copy[lang];
  const queryClient = useQueryClient();
  const { status, handleChange, flushAll } = useDebouncedAutosave(initialWorksheets, (worksheetId, edits) =>
    updateWorksheet(workbookId, worksheetId, { edits }).then(() => {
      // A save can be to a parent sheet, which may make one or more child sheets outdated —
      // this invalidates the relationship list AND every per-relationship status query
      // together, since they share this key prefix.
      void queryClient.invalidateQueries({ queryKey: ["child-sheets", workbookId] });
    })
  );

  // Tracked via Univer's own ActiveSheetChanged event (its native tab strip owns which sheet is
  // active — we don't manage that ourselves), purely to know which worksheet's real row/column
  // extent to show in the footer status bar. Defaults to whichever sheet loads first.
  const [activeSheetId, setActiveSheetId] = useState(initialWorksheets[0]?.id);
  const activeSheet = worksheetDataList.find((w) => w.id === activeSheetId);

  const workbookData = useMemo(
    () => ({
      id: workbookId,
      name: workbookId,
      appVersion: "0.25.1",
      locale: lang === "fr" ? LocaleType.FR_FR : LocaleType.EN_US,
      styles: {},
      sheetOrder: initialWorksheets.map((s) => s.id),
      sheets: Object.fromEntries(initialWorksheets.map((s) => [s.id, s])),
    }),
    [workbookId, initialWorksheets, lang]
  );

  useEffect(() => onStatusChange(status), [status, onStatusChange]);
  useEffect(() => {
    onFlushReady(() => void flushAll());
  }, [flushAll, onFlushReady]);

  return (
    <>
      <div className="editor-grid-wrap">
        <div className="editor-grid-card">
          <GridErrorBoundary message={t.gridErrorMessage} retryLabel={t.tryAgain}>
            <UniverSheetGrid
              workbookData={workbookData}
              onChange={handleChange}
              onActiveSheetChange={setActiveSheetId}
            />
          </GridErrorBoundary>
        </div>
      </div>
      <EditorFooter activeSheet={activeSheet} />
    </>
  );
}

function EditorWorkbook({
  workbookId,
  worksheets,
  onStatusChange,
  onFlushReady,
}: {
  workbookId: string;
  worksheets: WorksheetRead[];
  onStatusChange: (status: SaveStatus) => void;
  onFlushReady: (flush: () => void) => void;
}) {
  const { lang } = useLang();
  const t = copy[lang];
  const worksheetIds = worksheets.map((w) => w.id).join(",");

  // Fetched one at a time, not in parallel (this used to be a useQueries firing every
  // worksheet's GET at once). The backend's per-worksheet read is CPU-bound — openpyxl cell
  // iteration plus Pydantic validation per cell — and Python's GIL means concurrent threads
  // doing that kind of work don't overlap so much as thrash each other fighting over it.
  // Measured on a real 16-sheet, ~450k-cell workbook: fetching all 16 sequentially totaled
  // ~28s, while firing the same 16 requests in parallel made each individual one take 150-220s.
  // One at a time is dramatically faster here despite looking like the more "serial" choice.
  const { data: worksheetDataList, isLoading, error } = useQuery({
    queryKey: ["worksheets", workbookId, worksheetIds],
    queryFn: async () => {
      const results: WorksheetData[] = [];
      for (const worksheet of worksheets) {
        results.push(await getWorksheet(workbookId, worksheet.id));
      }
      return results;
    },
    // Evict this query from the cache the instant nobody's observing it (i.e. right after this
    // component unmounts on navigating away), instead of React Query's default of keeping it
    // around for reuse. UniverSheetGrid reads its `workbookData` prop exactly once, at mount
    // (see its own comment on why — it owns the grid's whole lifecycle once created, the same
    // way Fortune-sheet's `data` prop worked), so it can never notice a background refetch that
    // resolves after that. Leave and edit a sheet, come back before this query would naturally
    // go stale-and-refetch-quietly-in-the-background, and the grid would mount straight from
    // the *pre-edit* cached snapshot — showing the old value once, then correctly the second
    // time (once that first, ignored background refetch had already updated the cache for the
    // next mount to find). Forcing a real network fetch on every fresh mount — the loading state
    // this causes is not a regression, it's what "the write-once grid must only ever see
    // genuinely fresh data" actually requires — closes that gap in one visit instead of two.
    gcTime: 0,
  });

  const initialWorksheets = useMemo(() => {
    if (!worksheetDataList) return null;
    return worksheetDataList.map((data) => backendToUniverWorksheetData(data));
  }, [worksheetDataList]);

  if (isLoading) return <p className="editor-status">{t.loadingWorksheetsMsg}</p>;
  if (error || !worksheetDataList || !initialWorksheets) {
    return <p role="alert" className="editor-status">{t.failedToLoadWorksheetsMsg}</p>;
  }

  return (
    <EditorWorkbookReady
      workbookId={workbookId}
      initialWorksheets={initialWorksheets}
      worksheetDataList={worksheetDataList}
      onStatusChange={onStatusChange}
      onFlushReady={onFlushReady}
    />
  );
}

export function EditorPage() {
  const { lang } = useLang();
  const t = copy[lang];
  const { workbookId } = useParams<{ workbookId: string }>();

  const { data: workbook, isLoading: isWorkbookLoading, error: workbookError } = useQuery({
    queryKey: ["workbooks", workbookId],
    queryFn: () => getWorkbook(workbookId!),
    enabled: !!workbookId,
  });

  const [isChildSheetModalOpen, setIsChildSheetModalOpen] = useState(false);
  // Bumped after a successful sync so the grid remounts and picks up the freshly-synced
  // child sheet's content — Fortune-sheet only reads its `data` prop on mount, so simply
  // refetching the worksheet query behind the scenes wouldn't update what's on screen.
  const [syncVersion, setSyncVersion] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  // Collapses both custom rows (title bar + action toolbar) at once, leaving only Fortune-
  // sheet's own native UI — same "hide the menus" idea as spreadsheet apps like Google Sheets.
  const [isChromeCollapsed, setIsChromeCollapsed] = useState(
    () => localStorage.getItem(CHROME_COLLAPSED_KEY) === "1"
  );

  // EditorWorkbookReady (mounted once worksheet data has loaded, several layers below) hands
  // up its autosave hook's flush function here so the title bar's Save button and Ctrl+S can
  // reach it without threading the whole autosave hook through every intermediate component.
  const flushRef = useRef<() => void>(() => {});
  const handleFlushReady = useCallback((flush: () => void) => {
    flushRef.current = flush;
  }, []);
  const handleSave = useCallback(() => flushRef.current(), []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        flushRef.current();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function toggleChromeCollapsed() {
    setIsChromeCollapsed((collapsed) => {
      const next = !collapsed;
      localStorage.setItem(CHROME_COLLAPSED_KEY, next ? "1" : "0");
      return next;
    });
  }

  const sortedWorksheets = workbook
    ? [...workbook.worksheets].sort((a, b) => {
        if (a.position === null) return 1;
        if (b.position === null) return -1;
        return a.position - b.position;
      })
    : [];
  // A worksheet list key: creating/removing a child sheet (or syncing one) changes this,
  // which remounts EditorWorkbook below so the affected sheet gets refetched and reflected
  // in Fortune-sheet's native tab strip — same "dispose and recreate" approach used for the
  // grid elsewhere.
  const worksheetListKey = `${sortedWorksheets.map((w) => w.id).join(",")}|${syncVersion}`;

  // Whichever original worksheet is first is a reasonable default parent to preselect —
  // the modal itself lets the user change which parent sheet to derive from.
  const firstOriginalWorksheetId = sortedWorksheets.find((w) => w.sheet_type === "original")?.id ?? null;

  if (isWorkbookLoading) return <p className="editor-status">{t.loadingWorkbookMsg}</p>;
  if (workbookError || !workbook) return <p role="alert" className="editor-status">{t.failedToLoadWorkbookMsg}</p>;

  return (
    <div className="editor-page">
      <div className={`editor-chrome ${isChromeCollapsed ? "collapsed" : "expanded"}`}>
        <EditorTopBar
          workbookId={workbook.id}
          filename={workbook.filename}
          saveStatus={saveStatus}
          onSave={handleSave}
          worksheets={sortedWorksheets}
          canCreateChildSheet={!!firstOriginalWorksheetId}
          onCreateChildSheet={() => setIsChildSheetModalOpen(true)}
          onToggleCollapsed={toggleChromeCollapsed}
        />

        {/* Its own small, conditional strip — not folded into the title bar above — because
            unlike Create Child Sheet/Convert (single buttons), this is a variable-length list
            of chips that only exists at all once a child sheet has actually been created
            (ChildSheetSyncPanel itself renders nothing until then, see its own null-return). */}
        {workbookId && (
          <ChildSheetSyncPanel
            workbookId={workbookId}
            worksheets={sortedWorksheets}
            onSynced={() => setSyncVersion((v) => v + 1)}
          />
        )}
      </div>
      {isChromeCollapsed && (
        <div className="editor-collapse-strip">
          <button
            type="button"
            className="editor-collapse-btn"
            onClick={toggleChromeCollapsed}
            aria-label={t.showTitleBar}
            title={t.showTitleBar}
          >
            <ChevronIcon />
          </button>
        </div>
      )}

      {workbookId && sortedWorksheets.length > 0 && (
        <EditorWorkbook
          key={worksheetListKey}
          workbookId={workbookId}
          worksheets={sortedWorksheets}
          onStatusChange={setSaveStatus}
          onFlushReady={handleFlushReady}
        />
      )}

      {isChildSheetModalOpen && firstOriginalWorksheetId && workbookId && (
        <ChildSheetModal
          workbookId={workbookId}
          worksheets={sortedWorksheets}
          defaultParentWorksheetId={firstOriginalWorksheetId}
          onClose={() => setIsChildSheetModalOpen(false)}
          onCreated={() => setIsChildSheetModalOpen(false)}
        />
      )}
    </div>
  );
}
