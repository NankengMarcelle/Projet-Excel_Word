import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { createUniver, LocaleType, defaultTheme, type IWorkbookData } from "@univerjs/presets";

type UniverAPI = ReturnType<typeof createUniver>["univerAPI"];
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import { UniverSheetsFilterPreset } from "@univerjs/preset-sheets-filter";
import { UniverSheetsSortPreset } from "@univerjs/preset-sheets-sort";
import { UniverSheetsFindReplacePreset } from "@univerjs/preset-sheets-find-replace";
import { UniverSheetsDataValidationPreset } from "@univerjs/preset-sheets-data-validation";
import { UniverSheetsConditionalFormattingPreset } from "@univerjs/preset-sheets-conditional-formatting";

import sheetsCoreFrFR from "@univerjs/preset-sheets-core/locales/fr-FR";
import sheetsFilterFrFR from "@univerjs/preset-sheets-filter/locales/fr-FR";
import sheetsSortFrFR from "@univerjs/preset-sheets-sort/locales/fr-FR";
import sheetsFindReplaceFrFR from "@univerjs/preset-sheets-find-replace/locales/fr-FR";
import sheetsDataValidationFrFR from "@univerjs/preset-sheets-data-validation/locales/fr-FR";
import sheetsConditionalFormattingFrFR from "@univerjs/preset-sheets-conditional-formatting/locales/fr-FR";

import sheetsCoreEnUS from "@univerjs/preset-sheets-core/locales/en-US";
import sheetsFilterEnUS from "@univerjs/preset-sheets-filter/locales/en-US";
import sheetsSortEnUS from "@univerjs/preset-sheets-sort/locales/en-US";
import sheetsFindReplaceEnUS from "@univerjs/preset-sheets-find-replace/locales/en-US";
import sheetsDataValidationEnUS from "@univerjs/preset-sheets-data-validation/locales/en-US";
import sheetsConditionalFormattingEnUS from "@univerjs/preset-sheets-conditional-formatting/locales/en-US";

import "@univerjs/preset-sheets-core/lib/index.css";
import "@univerjs/preset-sheets-filter/lib/index.css";
import "@univerjs/preset-sheets-sort/lib/index.css";
import "@univerjs/preset-sheets-find-replace/lib/index.css";
import "@univerjs/preset-sheets-data-validation/lib/index.css";
import "@univerjs/preset-sheets-conditional-formatting/lib/index.css";

import { useLang } from "../i18n/useLang";
import { useTheme } from "../theme/useTheme";

// Each preset ships its own locale pack (UI strings for its own menus/panels) — unlike
// Fortune-sheet, specifying `locale: LocaleType.FR_FR` alone isn't enough; Univer throws
// "[LocaleService]: Locale not initialized" without the actual translation data too. These are
// plain objects, so a shallow merge (not a special helper) is enough to combine them.
const LOCALE_FR_FR = {
  ...sheetsCoreFrFR,
  ...sheetsFilterFrFR,
  ...sheetsSortFrFR,
  ...sheetsFindReplaceFrFR,
  ...sheetsDataValidationFrFR,
  ...sheetsConditionalFormattingFrFR,
};

const LOCALE_EN_US = {
  ...sheetsCoreEnUS,
  ...sheetsFilterEnUS,
  ...sheetsSortEnUS,
  ...sheetsFindReplaceEnUS,
  ...sheetsDataValidationEnUS,
  ...sheetsConditionalFormattingEnUS,
};

export type StructuralEditOperation = "insert_row" | "remove_row" | "insert_col" | "remove_col";

// Univer's own command ids for insert/delete row/column — confirmed against the installed
// @univerjs/sheets package (not documented in its public docs). Listening for these directly
// (via onCommandExecuted below) gives an exact, unambiguous "row 5 was inserted in sheet X"
// signal, instead of trying to infer a structural edit from a before/after cell-value diff —
// see hooks/useDebouncedAutosave.ts and CLAUDE.md's "insert/delete row-column" section for why
// that approach silently corrupted merged cells.
const STRUCTURAL_COMMAND_IDS: Record<string, StructuralEditOperation> = {
  "sheet.mutation.insert-row": "insert_row",
  "sheet.mutation.remove-rows": "remove_row",
  "sheet.mutation.insert-col": "insert_col",
  "sheet.mutation.remove-col": "remove_col",
};

const REMOVE_SHEET_COMMAND_ID = "sheet.mutation.remove-sheet";

interface StructuralCommandRange {
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
}

interface StructuralCommandParams {
  subUnitId: string;
  range: StructuralCommandRange;
}

interface UniverSheetGridProps {
  // Read once, on mount, same as Fortune-sheet's `data` prop was — Univer has no official React
  // wrapper (confirmed: imperative DI-container architecture, mounted into a plain DOM node),
  // so this component owns the whole lifecycle itself rather than being a thin prop-driven view.
  workbookData: IWorkbookData;
  onChange?: (data: IWorkbookData) => void;
  onActiveSheetChange?: (sheetId: string) => void;
  // Fired when the user inserts/deletes a row or column via Univer's own UI. worksheetId
  // matches the backend worksheet id (Univer's subUnitId — see adapter.ts, sheet ids are
  // seeded from the backend's own worksheet id), startIndex/count are already converted to
  // this app's 1-indexed convention (Univer's own range is 0-indexed). freshWorkbookSnapshot
  // is the whole workbook's state *after* Univer already applied the shift internally —
  // onCommandExecuted fires post-execution, not pre — so the caller can re-baseline its own
  // autosave diff against the real post-shift positions instead of the pre-shift ones.
  onStructuralEdit?: (
    worksheetId: string,
    operation: StructuralEditOperation,
    startIndex: number,
    count: number,
    freshWorkbookSnapshot: IWorkbookData
  ) => void;
  // Called synchronously, *before* Univer actually deletes a sheet (its own native tab menu →
  // "Supprimer", already past Univer's own generic "are you sure?" confirm). Returning false
  // cancels the deletion — used to interrupt it with this app's own warning when the sheet
  // being deleted is a parent in a child-sheet relationship (see EditorPage.tsx). Returning
  // true (or the prop being unset) lets it through immediately.
  onBeforeSheetDelete?: (worksheetId: string) => boolean;
  // Fired after a sheet deletion actually goes through — either the first attempt (no
  // dependents, never intercepted) or a re-issued one via the imperative confirmDeleteSheet
  // handle below (after the caller's own warning was confirmed). This is the single place
  // that should tell the backend "this worksheet is gone," uniformly for both paths.
  onSheetDeleted?: (worksheetId: string) => void;
}

export interface ComputedCellValue {
  row: number;
  column: number;
  value: unknown;
}

export interface UniverSheetGridHandle {
  // Re-issues a sheet deletion Univer's own onBeforeSheetDelete check already cancelled once —
  // call only after the caller has independently confirmed it should proceed (e.g. the user
  // accepted a "this has dependents" warning). fWorkbook.deleteSheet() dispatches the exact
  // same sheet.mutation.remove-sheet command a native tab-menu delete would.
  confirmDeleteSheet: (worksheetId: string) => void;
  // Finds every formula cell in a worksheet's data range and reads its *current, live* value
  // from Univer's own client-side formula engine — self-contained (the caller doesn't need to
  // separately know which cells are formulas): openpyxl's backend-side cache for these can be
  // stale or entirely missing (openpyxl has no formula engine of its own; see CLAUDE.md's
  // "Insert/delete row and column" section's totals finding). Returned row/column are
  // 1-indexed, matching this app's convention everywhere else. Returns an empty array if the
  // worksheet isn't found (e.g. a stale id after a delete).
  getComputedValues: (worksheetId: string) => ComputedCellValue[];
}

export const UniverSheetGrid = forwardRef<UniverSheetGridHandle, UniverSheetGridProps>(function UniverSheetGrid(
  { workbookData, onChange, onActiveSheetChange, onStructuralEdit, onBeforeSheetDelete, onSheetDeleted },
  ref
) {
  const { lang } = useLang();
  const { theme } = useTheme();
  // Univer's darkMode is a boolean, but this app's own theme setting has a third option
  // ("system") that defers to the OS preference — resolve that here rather than passing
  // "system" through, and keep it live so an OS-level preference change while "system" is
  // selected is picked up too (matching this app's own [data-theme]-less CSS fallback, which
  // reacts to the same media query automatically).
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);
  const isDarkMode = theme === "dark" || (theme === "system" && systemPrefersDark);
  // A stable *outer* wrapper owned by React — never touched by Univer directly. Each mount of
  // the effect below creates its own plain `container` div and appends it here, rather than
  // handing Univer this ref's own node straight, so that a lang-triggered recreate can swap in
  // a brand-new container and synchronously detach the old one before the next instance's first
  // paint (no visible double-render), while the *old* instance's internal cleanup — which is
  // what's unsafe to run synchronously inside a React commit, see the effect's cleanup below —
  // can be deferred without that deferral leaving stale DOM on screen in the meantime.
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Refs for the callbacks so the mount effect (intentionally empty deps — this should mount
  // exactly once) always calls whatever the latest render's callback is, without re-mounting
  // the whole Univer instance every time a parent re-renders with new function identities.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onActiveSheetChangeRef = useRef(onActiveSheetChange);
  onActiveSheetChangeRef.current = onActiveSheetChange;
  const onStructuralEditRef = useRef(onStructuralEdit);
  onStructuralEditRef.current = onStructuralEdit;
  const onBeforeSheetDeleteRef = useRef(onBeforeSheetDelete);
  onBeforeSheetDeleteRef.current = onBeforeSheetDelete;
  const onSheetDeletedRef = useRef(onSheetDeleted);
  onSheetDeletedRef.current = onSheetDeleted;
  // Worksheet ids whose deletion has already been through onBeforeSheetDelete once and been
  // explicitly approved (see confirmDeleteSheet below) — checked so the *second*, re-issued
  // delete attempt isn't intercepted all over again into an infinite warn-cancel loop.
  // One-shot: removed the moment it's consumed.
  const approvedDeletionsRef = useRef<Set<string>>(new Set());
  // Persisted outside the mount effect so the imperative handle (confirmDeleteSheet) can reach
  // the current instance without needing its own copy of the effect's local variable.
  const univerAPIRef = useRef<UniverAPI | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      confirmDeleteSheet: (worksheetId: string) => {
        approvedDeletionsRef.current.add(worksheetId);
        univerAPIRef.current?.getActiveWorkbook()?.deleteSheet(worksheetId);
      },
      getComputedValues: (worksheetId: string) => {
        const worksheet = univerAPIRef.current?.getActiveWorkbook()?.getSheetBySheetId(worksheetId);
        if (!worksheet) return [];
        // getDataRange() mirrors Excel's own "used range" concept — scanning exactly that
        // (not the sheet's full declared row/column count, which can be dramatically larger
        // than any real content) for formula cells specifically. getFormulas() returns an
        // empty string for a non-formula cell, so a plain truthiness check finds exactly the
        // cells worth overriding. getValues() (plural, matching the same range) is the
        // *computed* result of each cell — getFormula()/getFormulas() are the separate
        // methods for the formula text itself, so this can't accidentally hand back
        // "=SUM(...)" instead of the number it evaluates to.
        const dataRange = worksheet.getDataRange();
        const formulas = dataRange.getFormulas();
        const values = dataRange.getValues();
        const startRow = dataRange.getRow();
        const startColumn = dataRange.getColumn();
        const results: ComputedCellValue[] = [];
        formulas.forEach((formulaRow, rowOffset) => {
          formulaRow.forEach((formula, colOffset) => {
            if (!formula) return;
            results.push({
              row: startRow + rowOffset + 1,
              column: startColumn + colOffset + 1,
              value: values[rowOffset]?.[colOffset] ?? null,
            });
          });
        });
        return results;
      },
    }),
    []
  );

  // Toggling the app's language mid-session tears down and recreates the whole Univer instance
  // (it has no runtime "switch locale" API — the locale is fixed at createUniver() time), which
  // would otherwise revert the grid to whatever `workbookData` was at the *initial* page load:
  // that prop is deliberately read once and never updated afterward (Univer owns live edits
  // internally past mount — see the prop's own comment below), so re-reading it on a lang change
  // would silently discard any in-session edits even though they're already safely autosaved.
  // Seeding from this ref instead of the prop keeps a lang-triggered recreate visually seamless:
  // the cleanup below captures the live snapshot right before disposing, so the next mount picks
  // up exactly where the old instance left off.
  const currentSnapshotRef = useRef<IWorkbookData>(workbookData);

  useEffect(() => {
    if (!wrapperRef.current) return;

    // Styled to match exactly what the single container div used to be (flex item in a column
    // flex context, nothing more) — NOT `display: flex` and NOT `height: 100%`, both tried
    // initially and both wrong: Univer manages its own internal layout (toolbar + canvas
    // stacking) inside whatever node it's given, and imposing an outer flex/height context
    // directly on that node fights with Univer's own sizing, producing a real, continuous
    // ResizeObserver feedback loop — confirmed live: a toolbar dropdown's measured x position
    // oscillating between two values roughly every 150ms, visibly "shaking" on screen. The outer
    // `wrapperRef` below is what now supplies the column-flex context this container needs to
    // grow into — see its own comment.
    const container = document.createElement("div");
    container.style.flex = "1";
    container.style.minHeight = "0";
    container.style.width = "100%";
    wrapperRef.current.appendChild(container);

    const locale = lang === "fr" ? LocaleType.FR_FR : LocaleType.EN_US;
    const localeData = lang === "fr" ? LOCALE_FR_FR : LOCALE_EN_US;

    const { univer, univerAPI } = createUniver({
      locale,
      locales: { [locale]: localeData },
      theme: defaultTheme,
      darkMode: isDarkMode,
      presets: [
        UniverSheetsCorePreset({ container }),
        UniverSheetsFilterPreset(),
        UniverSheetsSortPreset(),
        UniverSheetsFindReplacePreset(),
        UniverSheetsDataValidationPreset(),
        UniverSheetsConditionalFormattingPreset(),
      ],
    });

    univerAPIRef.current = univerAPI;
    univerAPI.createUniverSheet(currentSnapshotRef.current);

    // SheetValueChanged fires per edit action (typing, paste, fill, sort, ...) — rather than try
    // to interpret `effectedRanges` ourselves, just pull the whole current workbook snapshot via
    // save() each time (FWorkbook's own getSnapshot() is deprecated in favor of this — same
    // return shape, just the current name), same shape our own diffing (extractCellValues/
    // diffCellValues in univer/adapter.ts) already expects, matching the pattern the old
    // Fortune-sheet onChange prop used (a full-sheet snapshot per change), just event-driven
    // instead of prop-driven.
    const valueChangedDisposable = univerAPI.addEvent(univerAPI.Event.SheetValueChanged, () => {
      const workbook = univerAPI.getActiveWorkbook();
      if (workbook && onChangeRef.current) {
        onChangeRef.current(workbook.save());
      }
    });

    const activeSheetDisposable = univerAPI.addEvent(univerAPI.Event.ActiveSheetChanged, (params) => {
      if (onActiveSheetChangeRef.current && params.activeSheet) {
        onActiveSheetChangeRef.current(params.activeSheet.getSheetId());
      }
    });

    const commandDisposable = univerAPI.onCommandExecuted((commandInfo) => {
      if (commandInfo.id === REMOVE_SHEET_COMMAND_ID) {
        // Fires once the deletion has actually happened — for the plain "no dependents" case
        // (never intercepted below) and equally for a re-issued, already-approved delete via
        // confirmDeleteSheet — either way, this is the single place that tells the backend a
        // sheet is gone.
        const params = commandInfo.params as { subUnitId: string } | undefined;
        if (params?.subUnitId) onSheetDeletedRef.current?.(params.subUnitId);
        return;
      }

      const operation = STRUCTURAL_COMMAND_IDS[commandInfo.id];
      if (!operation || !onStructuralEditRef.current) return;
      const params = commandInfo.params as StructuralCommandParams | undefined;
      if (!params?.range) return;
      const { range, subUnitId } = params;
      const isRowOp = operation === "insert_row" || operation === "remove_row";
      const startIndex = (isRowOp ? range.startRow : range.startColumn) + 1;
      const count = (isRowOp ? range.endRow - range.startRow : range.endColumn - range.startColumn) + 1;
      // onCommandExecuted fires after the mutation has already run, so save() here reflects
      // the post-shift state, not the pre-shift one.
      const freshSnapshot = univerAPI.getActiveWorkbook()?.save();
      if (!freshSnapshot) return;
      onStructuralEditRef.current(subUnitId, operation, startIndex, count, freshSnapshot);
    });

    // Fires *before* sheet.mutation.remove-sheet actually runs — past Univer's own native
    // "are you sure?" confirm (that's a separate, higher-level UI command that only dispatches
    // this mutation once accepted), but still cancelable via event.cancel. Used to interrupt a
    // delete this app needs to warn about first (a parent sheet with existing child-sheet
    // relationships) rather than trying to undo it after Univer's own model already applied it.
    const beforeCommandDisposable = univerAPI.addEvent(univerAPI.Event.BeforeCommandExecute, (event) => {
      if (event.id !== REMOVE_SHEET_COMMAND_ID) return;
      const params = event.params as { subUnitId: string } | undefined;
      if (!params?.subUnitId) return;
      if (approvedDeletionsRef.current.has(params.subUnitId)) {
        // Already warned about and explicitly confirmed via confirmDeleteSheet — let this
        // specific, one-shot re-issue through without asking again.
        approvedDeletionsRef.current.delete(params.subUnitId);
        return;
      }
      if (onBeforeSheetDeleteRef.current && !onBeforeSheetDeleteRef.current(params.subUnitId)) {
        event.cancel = true;
      }
    });

    return () => {
      const workbook = univerAPI.getActiveWorkbook();
      if (workbook) currentSnapshotRef.current = workbook.save();
      valueChangedDisposable.dispose();
      activeSheetDisposable.dispose();
      commandDisposable.dispose();
      beforeCommandDisposable.dispose();
      // Detach the DOM synchronously — an instant, clean cutover, so a lang-triggered recreate
      // never briefly shows two grids stacked while the old one waits to be torn down.
      container.remove();
      // But defer univer.dispose() itself, which is what's actually unsafe to call synchronously
      // here: Univer mounts its own internal React root into `container` (confirmed — it's a
      // DI-container architecture with its own UI layer, see the component's own top comment),
      // and dispose() unmounts that root. This cleanup function runs synchronously as part of
      // React's own commit, so calling another root's unmount() from inside it is exactly the
      // scenario React warns about ("Attempted to synchronously unmount a root while React was
      // already rendering") — easy to trigger for real once this effect started re-running on a
      // lang change (e.g. toggling FR/EN from Settings while a workbook is open) rather than only
      // on route-away unmount. A zero-delay setTimeout pushes just the teardown to its own task,
      // after our own root has fully finished committing; the container is already detached by
      // then, so there's nothing left for it to visually disturb.
      setTimeout(() => univer.dispose(), 0);
    };
    // workbookData is deliberately excluded — see currentSnapshotRef's comment above; only a
    // lang or resolved-dark-mode change should ever re-run this effect after the initial mount
    // (same recreate-on-trigger-change pattern as lang, since Univer has no runtime "switch
    // theme" API either — darkMode is fixed at createUniver() time, just like locale).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, isDarkMode]);

  // flexDirection: column so the appended container's own `flex: 1` (set in the effect above)
  // grows it to fill the available height, the same role `.editor-grid-card` (this component's
  // real parent, in EditorPage.css) already plays one level up — matches what the single
  // container div effectively had for free before this wrapper existed.
  return (
    <div ref={wrapperRef} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, width: "100%" }} />
  );
});
