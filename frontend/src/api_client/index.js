/**
 * SheetFlow Backend API Client Library
 * Auto-configured client SDK for SheetFlow FastAPI Backend
 * Base URL: https://sheetflow-backend-jzbo.onrender.com
 */

import axios from 'axios';

const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sheetflow-backend-jzbo.onrender.com';

export const apiClient = axios.create({
    baseURL: DEFAULT_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Helper for managing Auth Token
let authToken = localStorage.getItem('sheetflow_token') || null;

if (authToken) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
}

export const setAuthToken = (token) => {
    authToken = token;
    if (token) {
        localStorage.setItem('sheetflow_token', token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        localStorage.removeItem('sheetflow_token');
        delete apiClient.defaults.headers.common['Authorization'];
    }
};

export const getAuthToken = () => authToken;

/**
 * Auth Endpoints
 */
export const authApi = {
    /**
     * S'inscrire sur la plateforme
     * @param {{ email: string, password: string, full_name?: string }} data 
     */
    async register(data) {
        const res = await apiClient.post('/auth/register', data);
        return res.data;
    },

    /**
     * Se connecter (OAuth2 form-urlencoded ou JSON)
     * @param {{ username: string, password: string }} credentials 
     */
    async login(credentials) {
        const formData = new URLSearchParams();
        formData.append('username', credentials.username || credentials.email);
        formData.append('password', credentials.password);

        const res = await apiClient.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (res.data?.access_token) {
            setAuthToken(res.data.access_token);
        }
        return res.data;
    },

    /**
     * Obtenir l'utilisateur connecté courant
     */
    async getMe() {
        const res = await apiClient.get('/auth/me');
        return res.data;
    },

    /**
     * Lister tous les utilisateurs (Admin)
     */
    async listUsers() {
        const res = await apiClient.get('/admin/users');
        return res.data;
    },

    logout() {
        setAuthToken(null);
    }
};

/**
 * Workbooks (Classeurs Excel) Endpoints
 */
export const workbooksApi = {
    /**
     * Lister les classeurs de l'utilisateur
     */
    async list() {
        const res = await apiClient.get('/workbooks');
        return res.data;
    },

    /**
     * Importer / Créer un classeur Excel
     * @param {FormData|Object} data 
     */
    async import(data) {
        const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
        const res = await apiClient.post('/workbooks', data, { headers });
        return res.data;
    },

    /**
     * Obtenir les détails d'un classeur avec ses feuilles
     * @param {string} workbookId 
     */
    async get(workbookId) {
        const res = await apiClient.get(`/workbooks/${workbookId}`);
        return res.data;
    },

    /**
     * Supprimer un classeur
     * @param {string} workbookId 
     */
    async delete(workbookId) {
        const res = await apiClient.delete(`/workbooks/${workbookId}`);
        return res.data;
    },

    /**
     * Renommer un classeur
     * @param {string} workbookId 
     * @param {{ filename: string }} updateData 
     */
    async rename(workbookId, updateData) {
        const res = await apiClient.patch(`/workbooks/${workbookId}`, updateData);
        return res.data;
    },

    /**
     * Obtenir l'URL de téléchargement du classeur Excel
     * @param {string} workbookId 
     */
    getDownloadUrl(workbookId) {
        return `${DEFAULT_BASE_URL}/workbooks/${workbookId}/download`;
    }
};

/**
 * Worksheets (Feuilles de calcul) Endpoints
 */
export const worksheetsApi = {
    /**
     * Récupérer les données complètes d'une feuille de calcul
     * @param {string} workbookId 
     * @param {string} worksheetId 
     */
    async get(workbookId, worksheetId) {
        const res = await apiClient.get(`/workbooks/${workbookId}/worksheets/${worksheetId}`);
        return res.data;
    },

    /**
     * Modifier les cellules d'une feuille de calcul
     * @param {string} workbookId 
     * @param {string} worksheetId 
     * @param {{ edits: Array<{ row: number, column: number, value: any }> }} editData 
     */
    async edit(workbookId, worksheetId, editData) {
        const res = await apiClient.put(`/workbooks/${workbookId}/worksheets/${worksheetId}`, editData);
        return res.data;
    }
};

/**
 * Child Sheets (Feuilles Enfants) Endpoints
 */
export const childSheetsApi = {
    /**
     * Lister les relations de feuilles enfants d'un classeur
     * @param {string} workbookId 
     */
    async list(workbookId) {
        const res = await apiClient.get(`/workbooks/${workbookId}/child-sheets`);
        return res.data;
    },

    /**
     * Créer une feuille enfant par filtrage
     * @param {string} workbookId 
     * @param {{ parent_worksheet_id: string, child_sheet_name: string, selected_columns: string[], filter_criteria?: object }} requestData 
     */
    async create(workbookId, requestData) {
        const res = await apiClient.post(`/workbooks/${workbookId}/child-sheets`, requestData);
        return res.data;
    },

    /**
     * Obtenir le statut d'une feuille enfant (vérifier si obsolète)
     * @param {string} workbookId 
     * @param {string} relationshipId 
     */
    async getStatus(workbookId, relationshipId) {
        const res = await apiClient.get(`/workbooks/${workbookId}/child-sheets/${relationshipId}/status`);
        return res.data;
    },

    /**
     * Resynchroniser une feuille enfant avec sa feuille parent
     * @param {string} workbookId 
     * @param {string} relationshipId 
     */
    async sync(workbookId, relationshipId) {
        const res = await apiClient.post(`/workbooks/${workbookId}/child-sheets/${relationshipId}/sync`);
        return res.data;
    }
};

/**
 * Conversions / Génération Word & PDF Endpoints
 */
export const conversionsApi = {
    /**
     * Lancer la conversion d'une feuille en document Word
     * @param {string} worksheetId 
     */
    async convert(worksheetId) {
        const res = await apiClient.post(`/worksheets/${worksheetId}/convert`);
        return res.data;
    },

    /**
     * Obtenir l'état d'une conversion
     * @param {string} conversionId 
     */
    async get(conversionId) {
        const res = await apiClient.get(`/conversions/${conversionId}`);
        return res.data;
    },

    /**
     * URL de téléchargement du document Word généré
     * @param {string} conversionId 
     */
    getDownloadUrl(conversionId) {
        return `${DEFAULT_BASE_URL}/conversions/${conversionId}/download`;
    }
};

/**
 * Health Endpoints
 */
export const healthApi = {
    async check() {
        const res = await apiClient.get('/health');
        return res.data;
    },
    async checkDb() {
        const res = await apiClient.get('/health/db');
        return res.data;
    }
};

export default {
    client: apiClient,
    setAuthToken,
    getAuthToken,
    auth: authApi,
    workbooks: workbooksApi,
    worksheets: worksheetsApi,
    childSheets: childSheetsApi,
    conversions: conversionsApi,
    health: healthApi
};
