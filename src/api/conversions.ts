import { apiClient } from "./client";
import type { ConversionCreateResponse } from "../types/conversion";

export function convertWorksheet(worksheetId: string): Promise<ConversionCreateResponse> {
  return apiClient.post<ConversionCreateResponse>(`/worksheets/${worksheetId}/convert`);
}
