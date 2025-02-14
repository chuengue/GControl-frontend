import api from '../../api';
import { FarmSessionsResponse, MissionResponse } from './type';

// Obtém todas as missões
export const getAllMissions = async (): Promise<MissionResponse> => {
    try {
        const url = '/missions';
        const response = await api.get<MissionResponse>(url);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar missões:', error);
        throw error;
    }
};

// Obtém todas as sessões de farm do usuário
export const getAllUserSessions = async (
    userId: string
): Promise<FarmSessionsResponse> => {
    try {
        const url = `/users/${userId}/sessions/report`;
        const response = await api.get<FarmSessionsResponse>(url);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar sessões:', error);
        throw error;
    }
};

// Cria uma nova sessão de farm
export const createFarmSession = async (
    userId: string,
    userCharId: string,
    missionId: string,
    data: {
        attempts: number;
        timeSpent: string;
        name: string;
    }
): Promise<void> => {
    const url = `/users/${userId}/${userCharId}/mission/${missionId}`;
    try {
        await api.post(url, data);
    } catch (error) {
        console.error('Erro ao criar sessão de farm:', error);
        throw error;
    }
};

// Atualiza uma sessão de farm existente
export const updateFarmSession = async (
    userCharId: string,
    sessionId: string,
    missionId: string,
    data: {
        attempts: number;
        timeSpent: string;
        name: string;
    }
): Promise<void> => {
    const url = `/users/${userCharId}/mission/${missionId}/sessions/${sessionId}`;
    try {
        await api.put(url, data);
    } catch (error) {
        console.error('Erro ao atualizar sessão de farm:', error);
        throw error;
    }
};
export const deleteFarmSession = async (
    sessionId: string
): Promise<void> => {
    try {
        const url = `/sessions/${sessionId}`;
         await api.delete(url);
    } catch (error) {
        console.error('Erro ao buscar sessões:', error);
        throw error;
    }
};
