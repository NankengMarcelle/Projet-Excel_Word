export function SyncButton({
  isSyncing,
  onSync,
}: {
  isSyncing: boolean;
  onSync: () => void;
}) {
  return (
    <button type="button" className="editor-action-btn small" onClick={onSync} disabled={isSyncing}>
      {isSyncing ? "Synchronizing..." : "Synchronize"}
    </button>
  );
}
