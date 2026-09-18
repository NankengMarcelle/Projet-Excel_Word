import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listWorksheetColumns } from "../../api/worksheets";
import { createChildSheet } from "../../api/childSheets";
import { ApiError } from "../../api/client";
import type { ComputedCellValue } from "../../univer/UniverSheetGrid";
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
  getComputedValues,
}: {
  workbookId: string;
  worksheets: WorksheetRead[];
  defaultParentWorksheetId: string;
  onClose: () => void;
  onCreated: (childWorksheetId: string) => void;
  getComputedValues: (worksheetId: string) => ComputedCellValue[];
}) {
  const queryClient = useQueryClient();
  const [parentWorksheetId, setParentWorksheetId] = useState(defaultParentWorksheetId);
  const [headerStartRow, setHeaderStartRow] = useState(1);
  const [headerEndRow, setHeaderEndRow] = useState(1);
  const headerRangeValid = headerStartRow >= 1 && headerEndRow >= headerStartRow;

  const { data: columns = [] } = useQuery({
    queryKey: ["worksheet-columns", workbookId, parentWorksheetId, headerStartRow, headerEndRow],
    queryFn: () => listWorksheetColumns(workbookId, parentWorksheetId, headerStartRow, headerEndRow),
    enabled: headerRangeValid,
  });

  const [childSheetName, setChildSheetName] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<number[]>([]);
  const [filterGroup, setFilterGroup] = useState<FilterConditionGroup>({ logic: "AND", conditions: [] });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createChildSheet(workbookId, {
        parent_worksheet_id: parentWorksheetId,
        child_sheet_name: childSheetName,
        header_start_row: headerStartRow,
        header_end_row: headerEndRow,
        selected_columns: selectedColumns,
        filter_criteria: filterGroup,
        // The parent's formula cells may have no valid backend-side cache at all (openpyxl
        // has no formula engine) — Univer, already rendering the parent live, has the real
        // answer.
        computed_values: getComputedValues(parentWorksheetId),
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
    if (!headerRangeValid) {
      setError("Header end row must be greater than or equal to header start row");
      return;
    }
    if (selectedColumns.length === 0) {
      setError("Select at least one column");
      return;
    }
    mutation.mutate();
  }

  // Selected columns/filters are specific to the previous parent's (or header range's)
  // columns — an index that made sense before might now point at a different column, or none
  // at all, so it's safer to reset than to silently carry over a now-meaningless selection.
  function resetColumnSelection() {
    setSelectedColumns([]);
    setFilterGroup({ logic: "AND", conditions: [] });
  }

  function handleParentChange(newParentId: string) {
    setParentWorksheetId(newParentId);
    resetColumnSelection();
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

        <label className="editor-panel-field">
          Header start row
          <input
            type="number"
            min={1}
            value={headerStartRow}
            onChange={(e) => {
              setHeaderStartRow(Number(e.target.value));
              resetColumnSelection();
            }}
          />
        </label>
        <label className="editor-panel-field">
          Header end row
          <input
            type="number"
            min={1}
            value={headerEndRow}
            onChange={(e) => {
              setHeaderEndRow(Number(e.target.value));
              resetColumnSelection();
            }}
          />
        </label>

        <ColumnPicker columns={columns} selected={selectedColumns} onChange={setSelectedColumns} />

        <h3 className="modal-subtitle">Filter criteria</h3>
        <FilterGroupEditor group={filterGroup} columns={columns} onChange={setFilterGroup} />

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
