import { apiClient } from "./client";
import type { WorksheetData, WorksheetEditRequest, WorksheetRead } from "../types/worksheet";

export function getWorksheet(workbookId: string, worksheetId: string): Promise<WorksheetData> {
  return apiClient.get<WorksheetData>(`/workbooks/${workbookId}/worksheets/${worksheetId}`);
}

export function updateWorksheet(
  workbookId: string,
  worksheetId: string,
  payload: WorksheetEditRequest
): Promise<WorksheetRead> {
  return apiClient.put<WorksheetRead>(`/workbooks/${workbookId}/worksheets/${worksheetId}`, payload);
}
