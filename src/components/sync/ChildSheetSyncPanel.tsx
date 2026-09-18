import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { getChildSheetStatus, listChildSheets, syncChildSheet } from "../../api/childSheets";
import { ApiError } from "../../api/client";
import type { ComputedCellValue } from "../../univer/UniverSheetGrid";
import type { WorksheetRead } from "../../types/worksheet";
import { LayersIcon, ChevronIcon } from "../icons/EditorIcons";
import { copy } from "../../i18n/copy";
import { useLang } from "../../i18n/useLang";
import { OutdatedBadge } from "./OutdatedBadge";
import { SyncButton } from "./SyncButton";

// A collapsed trigger button (matching Create Child Sheet/Convert's own single-button footprint
// in the title bar) that opens a dropdown listing every child sheet — replaces an earlier design
// where this was its own always-visible, variable-length horizontal strip below the title bar,
// which took up permanent space and looked out of place once there were several child sheets.
export function ChildSheetSyncPanel({
  workbookId,
  worksheets,
  onSynced,
  getComputedValues,
}: {
  workbookId: string;
  worksheets: WorksheetRead[];
  onSynced: () => void;
  getComputedValues: (worksheetId: string) => ComputedCellValue[];
}) {
  const { lang } = useLang();
  const t = copy[lang];
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  // The trigger lives inside .editor-chrome, which has `overflow: hidden` for its own
  // collapse/expand animation — an absolutely-positioned menu nested inside it gets clipped
  // regardless of z-index (confirmed live: the menu was present in the DOM, just invisible).
  // Rendered into a portal instead, positioned from the trigger's own measured rect, so nothing
  // about it depends on an ancestor's overflow or stacking context.
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);

  const { data: relationships } = useQuery({
    queryKey: ["child-sheets", workbookId],
    queryFn: () => listChildSheets(workbookId),
  });

  const statusQueries = useQueries({
    queries: (relationships ?? []).map((relationship) => ({
      queryKey: ["child-sheets", workbookId, relationship.id, "status"],
      queryFn: () => getChildSheetStatus(workbookId, relationship.id),
      enabled: !!relationships,
    })),
  });

  const mutation = useMutation({
    mutationFn: (relationshipId: string) => {
      // The parent's formula cells may have no valid backend-side cache at all (openpyxl has
      // no formula engine) — Univer, already rendering the parent live, has the real answer.
      const relationship = relationships?.find((r) => r.id === relationshipId);
      const computedValues = relationship ? getComputedValues(relationship.parent_worksheet_id) : [];
      return syncChildSheet(workbookId, relationshipId, { computed_values: computedValues });
    },
    onSuccess: (_data, relationshipId) => {
      void queryClient.invalidateQueries({ queryKey: ["child-sheets", workbookId] });

      // Purge (not just invalidate) the synced child worksheet's cached data before the
      // remount below re-fetches it. Invalidating alone still lets the remount briefly
      // render the pre-sync cached value while the background refetch is in flight — this
      // was observed live as a real (if transient) wrong-data flash. Removing it outright
      // means the remount has nothing stale to show and renders a loading state instead.
      const childWorksheetId = relationships?.find((r) => r.id === relationshipId)?.child_worksheet_id;
      if (childWorksheetId) {
        queryClient.removeQueries({ queryKey: ["worksheets", workbookId, childWorksheetId] });
      }

      onSynced();
    },
  });

  // Closes the dropdown on an outside click, same expectation as any native <select>/menu, and
  // on scroll/resize — its position is captured once, at open time (see toggleOpen below), not
  // tracked live, so keeping it open across a layout change would leave it visibly adrift.
  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setIsOpen(false);
      }
    }
    function handleReposition() {
      setIsOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [isOpen]);

  if (!relationships || relationships.length === 0) return null;

  const outdatedCount = statusQueries.filter((status) => status.data?.is_outdated).length;

  function toggleOpen() {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    }
    setIsOpen((open) => !open);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="editor-action-btn small"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <LayersIcon />
        {t.childSheetsMenuLabel}
        {outdatedCount > 0 && <span className="child-sheets-outdated-count">{outdatedCount}</span>}
        <ChevronIcon className={isOpen ? "flip" : undefined} />
      </button>

      {isOpen &&
        menuPosition &&
        createPortal(
          <div
            className="child-sheets-menu"
            role="menu"
            ref={menuRef}
            style={{ top: menuPosition.top, right: menuPosition.right }}
          >
            <ul className="child-sheets-menu-list">
              {relationships.map((relationship, index) => {
                const childWorksheet = worksheets.find((w) => w.id === relationship.child_worksheet_id);
                const status = statusQueries[index];
                const isOutdated = status?.data?.is_outdated ?? false;
                const isSyncingThis = mutation.isPending && mutation.variables === relationship.id;

                return (
                  <li key={relationship.id} className="child-sheets-menu-item">
                    <span className="sync-chip-name">{childWorksheet?.name ?? "Unknown sheet"}</span>
                    <OutdatedBadge isOutdated={isOutdated} />
                    <SyncButton isSyncing={isSyncingThis} onSync={() => mutation.mutate(relationship.id)} />
                  </li>
                );
              })}
            </ul>
            {mutation.isError && (
              <span role="alert" className="editor-panel-error">
                {mutation.error instanceof ApiError ? String(mutation.error.detail) : "Failed to synchronize"}
              </span>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
