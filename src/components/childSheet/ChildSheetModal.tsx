import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getWorksheet } from "../../api/worksheets";
import { createChildSheet } from "../../api/childSheets";
import { ApiError } from "../../api/client";
import type { FilterConditionGroup } from "../../types/filter";
import type { WorksheetRead } from "../../types/worksheet";
import { ColumnPicker } from "./ColumnPicker";
import { FilterGroupEditor } from "./FilterGroupEditor";

export function ChildSheetModal({
  workbookId,
  worksheets,
  defaultParentWorksheetId,
  onClose,
  onCreated,
}: {
  workbookId: string;
  worksheets: WorksheetRead[];
  defaultParentWorksheetId: string;
  onClose: () => void;
  onCreated: (childWorksheetId: string) => void;
}) {
  const queryClient = useQueryClient();
  const [parentWorksheetId, setParentWorksheetId] = useState(defaultParentWorksheetId);
  const { data: parentData } = useQuery({
    queryKey: ["worksheets", workbookId, parentWorksheetId],
    queryFn: () => getWorksheet(workbookId, parentWorksheetId),
  });

  const headers = (parentData?.cells ?? [])
    .filter((cell) => cell.row === 1)
    .sort((a, b) => a.column - b.column)
    .map((cell) => (cell.value == null ? "" : String(cell.value)));

  const [childSheetName, setChildSheetName] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [filterGroup, setFilterGroup] = useState<FilterConditionGroup>({ logic: "AND", conditions: [] });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createChildSheet(workbookId, {
        parent_worksheet_id: parentWorksheetId,
        child_sheet_name: childSheetName,
        selected_columns: selectedColumns,
        filter_criteria: filterGroup,
      }),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: ["workbooks", workbookId] });
      onCreated(response.worksheet.id);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? String(err.detail) : "Failed to create child sheet");
    },
  });

  function handleSubmit() {
    setError(null);
    if (!childSheetName.trim()) {
      setError("Child sheet name is required");
      return;
    }
    if (selectedColumns.length === 0) {
      setError("Select at least one column");
      return;
    }
    mutation.mutate();
  }

  function handleParentChange(newParentId: string) {
    setParentWorksheetId(newParentId);
    // Selected columns/filters are specific to the previous parent's headers.
    setSelectedColumns([]);
    setFilterGroup({ logic: "AND", conditions: [] });
  }

  const originalWorksheets = worksheets.filter((w) => w.sheet_type === "original");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Create child sheet"
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="modal-title">Create child sheet</h2>
        <label className="editor-panel-field">
          Parent sheet
          <select value={parentWorksheetId} onChange={(e) => handleParentChange(e.target.value)}>
            {originalWorksheets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </label>
        <label className="editor-panel-field">
          Child sheet name
          <input type="text" value={childSheetName} onChange={(e) => setChildSheetName(e.target.value)} />
        </label>

        <ColumnPicker columns={headers} selected={selectedColumns} onChange={setSelectedColumns} />

        <h3 className="modal-subtitle">Filter criteria</h3>
        <FilterGroupEditor group={filterGroup} columns={headers} onChange={setFilterGroup} />

        {error && (
          <p role="alert" className="editor-panel-error">
            {error}
          </p>
        )}

        <div className="modal-actions">
          <button type="button" className="editor-action-btn" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Creating..." : "Create"}
          </button>
          <button type="button" className="editor-action-btn ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
