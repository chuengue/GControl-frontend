import api from '../../api';
import { ApiGetAllLimitedMissionResponse, ApiResponse } from './types';

export const getAllLimitedMissions = async (): Promise<ApiGetAllLimitedMissionResponse> => {
  try {
    const url = `/limited-missions`;

    const response = await api.get<ApiGetAllLimitedMissionResponse>(url);
    return response.data; // Retorna os dados da requisição
  } catch (error) {
    console.error('Erro missões limitadas:', error);
    throw error; // Lança o erro para ser tratado externamente
  }
};
export const removeLimitedMissions = async (missionId: string): Promise<void> => {
  try {
    const url = `/limited-missions/${missionId}`;

    await api.delete(url);
  } catch (error) {
    console.error('Erro ao excluir missão:', error);
    throw error; // Lança o erro para ser tratado externamente
  }
};

export const getUserMissionsLogs = async (userId: string): Promise<ApiResponse> => {
  try {
    const url = `/limited-missions-log/${userId}`;

    const response = await api.get<ApiResponse>(url);
    return response.data; // Retorna os dados da requisição
  } catch (error) {
    console.error('Erro recuperar logs de missão:', error);
    throw error; // Lança o erro para ser tratado externamente
  }
};
export const getUserMissionsLogsHistoric = async (
  userId: string,
  startDate?: string,
  endDate?: string,
  page: number = 1, 
  limit: number = 10,
  charName?:string,
  missionName?:string 
): Promise<ApiResponse> => {
  try {
    const url = `/limited-missions-log/${userId}/historic`;

    // Enviando os parâmetros no corpo da requisição com o método POST
    const response = await api.post<ApiResponse>(url, {
      startDate,
      endDate,
      page,
      limit,
      charName,
      missionName
    });

    return response.data; // Retorna os dados da requisição
  } catch (error) {
    console.error('Erro ao recuperar histórico de logs:', error);
    throw error; // Lança o erro para ser tratado externamente
  }
};



export const registerCompletedMission = async (
  userId: string,
  userCharId: string,
  limitedMissionId: string
): Promise<void> => {
  try {
    const url = `/users/${userId}/${userCharId}/limited-missions-log/${limitedMissionId}`;

    await api.post(url);
  } catch (error) {
    console.error('Erro ao completar missão:', error);
    throw error; // Lança o erro para ser tratado externamente
  }
};
export const removeRegisterCompletedMission = async (
  userCharId: string,
  limitedMissionId: string
): Promise<void> => {
  try {
    const url = `/${userCharId}/limited-missions-log/${limitedMissionId}`;

    await api.delete(url);
  } catch (error) {
    console.error('Erro ao remover registro de missão:', error);
    throw error; // Lança o erro para ser tratado externamente
  }
};
export const createLimitedMission = async (data: {
  missionId: string;
  type: string;
  max_attempts: number;
}): Promise<void> => {
  try {
    const url = `/limited-missions`;

    await api.post(url, data);
  } catch (error) {
    console.error('Erro ao registrar de missão:', error);
    throw error; // Lança o erro para ser tratado externamente
  }
};
