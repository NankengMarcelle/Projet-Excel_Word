import { useCallback, useEffect, useRef, useState } from "react";
import type { IWorkbookData, IWorksheetData } from "@univerjs/presets";
import { diffCellValues, extractCellValues, type CellSnapshotMap } from "../univer/adapter";
import type { CellEdit } from "../types/worksheet";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Debounces Univer's SheetValueChanged event (each firing hands us the whole workbook's current
 * snapshot via save() — see UniverSheetGrid.tsx — the same "full snapshot per change" shape
 * Fortune-sheet's onChange prop used, just event-driven instead of prop-driven) into one
 * batched PUT per worksheet that actually changed since its own last successful save.
 *
 * Sheets with no matching backend worksheet id are intentionally never diffed/saved — that's a
 * separate, local-only feature, not something this app persists.
 *
 * If a newer snapshot for a sheet arrives while its save is still in flight, it's queued and
 * sent as one follow-up save once the current one finishes — never fired concurrently for the
 * same sheet, never silently dropped.
 */
export function useDebouncedAutosave(
  initialWorksheets: IWorksheetData[],
  saveEdits: (worksheetId: string, edits: CellEdit[]) => Promise<void>,
  delayMs = 1000
) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const lastSavedRef = useRef<Record<string, CellSnapshotMap>>(
    // No workbook-level style pool exists yet at this point — every style on these freshly
    // built worksheets is still an inline object from backendToUniverWorksheetData, not an
    // interned string id, so extractCellValues doesn't need one here (see its own doc comment).
    Object.fromEntries(initialWorksheets.map((s) => [s.id, extractCellValues(s)]))
  );
  const pendingRef = useRef<Record<string, CellSnapshotMap>>({});
  const savingIdsRef = useRef<Set<string>>(new Set());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateAggregateStatus = useCallback(() => {
    setStatus(savingIdsRef.current.size > 0 ? "saving" : "saved");
  }, []);

  const flushSheet = useCallback(
    async (worksheetId: string) => {
      if (savingIdsRef.current.has(worksheetId)) return;
      const pending = pendingRef.current[worksheetId];
      if (!pending) return;

      const baseline = lastSavedRef.current[worksheetId] ?? {};
      const edits = diffCellValues(baseline, pending);
      if (edits.length === 0) {
        if (pendingRef.current[worksheetId] === pending) delete pendingRef.current[worksheetId];
        return;
      }

      savingIdsRef.current.add(worksheetId);
      updateAggregateStatus();
      try {
        await saveEdits(worksheetId, edits);
        lastSavedRef.current[worksheetId] = pending;
        if (pendingRef.current[worksheetId] === pending) delete pendingRef.current[worksheetId];
        savingIdsRef.current.delete(worksheetId);
        updateAggregateStatus();
      } catch {
        savingIdsRef.current.delete(worksheetId);
        setStatus("error");
      }
      if (pendingRef.current[worksheetId]) {
        void flushSheet(worksheetId);
      }
    },
    [saveEdits, updateAggregateStatus]
  );

  // Saves whatever's pending right now, skipping the rest of the debounce wait — backs both
  // the manual Save button/Ctrl+S and the unmount/unload safety nets below.
  const flushAll = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    return Promise.all(Object.keys(pendingRef.current).map((id) => flushSheet(id)));
  }, [flushSheet]);

  const handleChange = useCallback(
    (workbookData: IWorkbookData) => {
      for (const sheet of Object.values(workbookData.sheets)) {
        if (!sheet.id || !(sheet.id in lastSavedRef.current)) continue;
        pendingRef.current[sheet.id] = extractCellValues(sheet as IWorksheetData, workbookData.styles);
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        for (const worksheetId of Object.keys(pendingRef.current)) {
          void flushSheet(worksheetId);
        }
      }, delayMs);
    },
    [flushSheet, delayMs]
  );

  // Flush whatever's pending on unmount rather than just discarding the debounce timer —
  // otherwise an edit made less than `delayMs` before navigating away (e.g. clicking "Back to
  // workspace" right after typing) is silently lost: the timer that would have saved it never
  // gets the chance to fire. The save request itself isn't tied to this component's lifetime,
  // so it completes normally even after this effect's cleanup runs.
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      for (const worksheetId of Object.keys(pendingRef.current)) {
        void flushSheet(worksheetId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warn before an actual page unload (refresh/close/browser back) if something is still
  // saving or waiting out its debounce — unlike the in-app unmount case above, a request in
  // flight here has no guarantee of completing once the page unloads, so a confirmation
  // prompt (giving the user the chance to cancel and wait) is the realistic safety net.
  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      const hasUnsaved = Object.keys(pendingRef.current).length > 0 || savingIdsRef.current.size > 0;
      if (hasUnsaved) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return { status, handleChange, flushAll };
}
