import axios, { AxiosInstance } from 'axios';
import { components, paths } from './types';

export * from './models';

// API Base URL (FastAPI Render Server)
export const API_BASE_URL = 'https://sheetflow-backend-jzbo.onrender.com';

// LocalStorage Token Keys
export const TOKEN_KEY = 'sheetflow_token';
export const USER_KEY = 'sheetflow_user';

// Type Aliases for OpenAPI Schemas
export type UserRead = components['schemas']['UserRead'];
export type UserCreate = components['schemas']['UserCreate'];
export type Token = components['schemas']['Token'];
export type WorkbookRead = components['schemas']['WorkbookRead'];
export type WorkbookDetail = components['schemas']['WorkbookDetail'];
export type WorksheetRead = components['schemas']['WorksheetRead'];
export type WorksheetData = components['schemas']['WorksheetData'];
export type CellData = components['schemas']['CellData'];
export type CellEdit = components['schemas']['CellEdit'];
export type ChildSheetCreateRequest = components['schemas']['ChildSheetCreateRequest'];
export type ChildSheetCreateResponse = components['schemas']['ChildSheetCreateResponse'];
export type ChildSheetStatus = components['schemas']['ChildSheetStatus'];
export type ConversionRead = components['schemas']['ConversionRead'];
export type WordDocumentRead = components['schemas']['WordDocumentRead'];
export type ConversionCreateResponse = components['schemas']['ConversionCreateResponse'];

// Axios Instance Config
export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor for Authorization Header
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor for 401 Unauthorized Response
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        return Promise.reject(error);
    }
);

// 1. Auth Service
export const authApi = {
    register: async (data: UserCreate): Promise<UserRead> => {
        const response = await apiClient.post<UserRead>('/auth/register', data);
        return response.data;
    },

    login: async (credentials: { username: string; password: string }): Promise<Token> => {
        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);
        formData.append('scope', '');

        const response = await apiClient.post<Token>('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (response.data.access_token) {
            localStorage.setItem(TOKEN_KEY, response.data.access_token);
        }
        return response.data;
    },

    getMe: async (): Promise<UserRead> => {
        const response = await apiClient.get<UserRead>('/auth/me');
        if (response.data) {
            localStorage.setItem(USER_KEY, JSON.stringify(response.data));
        }
        return response.data;
    },

    logout: (): void => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },
};

// 2. Workbooks Service
export const workbooksApi = {
    list: async (): Promise<WorkbookRead[]> => {
        const response = await apiClient.get<WorkbookRead[]>('/workbooks');
        return response.data;
    },

    get: async (id: string): Promise<WorkbookDetail> => {
        const response = await apiClient.get<WorkbookDetail>(`/workbooks/${id}`);
        return response.data;
    },

    import: async (file: File): Promise<WorkbookRead> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post<WorkbookRead>('/workbooks', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    rename: async (id: string, filename: string): Promise<WorkbookRead> => {
        const response = await apiClient.patch<WorkbookRead>(`/workbooks/${id}`, { filename });
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/workbooks/${id}`);
    },

    getDownloadUrl: (id: string): string => {
        const token = localStorage.getItem(TOKEN_KEY);
        return `${API_BASE_URL}/workbooks/${id}/download?token=${token || ''}`;
    },
};

// 3. Worksheets Service
export const worksheetsApi = {
    get: async (workbookId: string, worksheetId: string): Promise<WorksheetData> => {
        const response = await apiClient.get<WorksheetData>(`/workbooks/${workbookId}/worksheets/${worksheetId}`);
        return response.data;
    },

    edit: async (workbookId: string, worksheetId: string, edits: CellEdit[]): Promise<WorksheetData> => {
        const response = await apiClient.put<WorksheetData>(`/workbooks/${workbookId}/worksheets/${worksheetId}`, { edits });
        return response.data;
    },
};

// 4. Child Sheets Service
export const childSheetsApi = {
    create: async (workbookId: string, request: ChildSheetCreateRequest): Promise<ChildSheetCreateResponse> => {
        const response = await apiClient.post<ChildSheetCreateResponse>(`/workbooks/${workbookId}/child-sheets`, request);
        return response.data;
    },

    getStatus: async (workbookId: string, relationshipId: string): Promise<ChildSheetStatus> => {
        const response = await apiClient.get<ChildSheetStatus>(`/workbooks/${workbookId}/child-sheets/${relationshipId}/status`);
        return response.data;
    },

    sync: async (workbookId: string, relationshipId: string): Promise<ChildSheetStatus> => {
        const response = await apiClient.post<ChildSheetStatus>(`/workbooks/${workbookId}/child-sheets/${relationshipId}/sync`);
        return response.data;
    },
};

// 5. Conversions Service
export const conversionsApi = {
    convert: async (worksheetId: string): Promise<ConversionCreateResponse> => {
        const response = await apiClient.post<ConversionCreateResponse>(`/worksheets/${worksheetId}/convert`);
        return response.data;
    },

    get: async (conversionId: string): Promise<ConversionRead> => {
        const response = await apiClient.get<ConversionRead>(`/conversions/${conversionId}`);
        return response.data;
    },

    getDownloadUrl: (conversionId: string): string => {
        const token = localStorage.getItem(TOKEN_KEY);
        return `${API_BASE_URL}/conversions/${conversionId}/download?token=${token || ''}`;
    },
};

export default {
    apiClient,
    authApi,
    workbooksApi,
    worksheetsApi,
    childSheetsApi,
    conversionsApi,
};
