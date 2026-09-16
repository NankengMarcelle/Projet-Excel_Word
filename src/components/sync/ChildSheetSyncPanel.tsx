import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { getChildSheetStatus, listChildSheets, syncChildSheet } from "../../api/childSheets";
import { ApiError } from "../../api/client";
import type { WorksheetRead } from "../../types/worksheet";
import { OutdatedBadge } from "./OutdatedBadge";
import { SyncButton } from "./SyncButton";

export function ChildSheetSyncPanel({
  workbookId,
  worksheets,
  onSynced,
}: {
  workbookId: string;
  worksheets: WorksheetRead[];
  onSynced: () => void;
}) {
  const queryClient = useQueryClient();

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
    mutationFn: (relationshipId: string) => syncChildSheet(workbookId, relationshipId),
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

  if (!relationships || relationships.length === 0) return null;

  return (
    <div className="editor-sync-strip" aria-label="Child sheets">
      <span className="editor-toolbar-label">Child sheets:</span>
      <ul className="sync-list-inline">
        {relationships.map((relationship, index) => {
          const childWorksheet = worksheets.find((w) => w.id === relationship.child_worksheet_id);
          const status = statusQueries[index];
          const isOutdated = status?.data?.is_outdated ?? false;
          const isSyncingThis = mutation.isPending && mutation.variables === relationship.id;

          return (
            <li key={relationship.id} className="sync-chip">
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
    </div>
  );
}
