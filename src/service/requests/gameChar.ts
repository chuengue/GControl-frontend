import { ApiResponseChar } from '../../shared/types';
import useProgressStore from '../../stores/progressStore';
import api from '../api';
import { AtkTotalLogResponse, IUserGameChar } from './types';

export const getMyCharacters = async (userId: string) => {
  try {
    // Monta a URL com ou sem o charId
    const url = `/users/${userId}/characters`;

    const response = await api.get(url);
    return response.data; // Retorna os dados da requisição
  } catch (error) {
    console.error('Erro ao buscar o personagens:', error);
    throw error; // Lança o erro para ser tratado externamente
  }
};
export const getUserCharDetails = async (userId: string, charId: string) => {
  try {
    const url = `/users/${userId}/characters/${charId}`;

    const response = await api.get(url);
    return response.data; // Retorna os dados da requisição
  } catch (error) {
    console.error('Erro ao buscar o personagens:', error);
    throw error; // Lança o erro para ser tratado externamente
  }
};
export const getAllCharacters = async (charId?: string): Promise<ApiResponseChar> => {
  try {
    // Monta a URL com ou sem o charId
    const url = charId ? `/characters/${charId}` : '/characters';

    const response = await api.get<ApiResponseChar>(url);
    return response.data; // Retorna os dados da requisição
  } catch (error) {
    console.error('Erro ao buscar o personagem:', error);
    throw error; // Lança o erro para ser tratado externamente
  }
};
export const deleteUserGameChar = async (userId: string, userCharId: string) => {
  try {
    // Monta a URL com ou sem o charId
    const url = `/users/${userId}/characters/${userCharId}`;

    const response = await api.delete(url);
    return response.data; // Retorna os dados da requisição
  } catch (error) {
    console.error('Erro ao excluir personagem:', error);
    throw error; // Lança o erro para ser tratado externamente
  }
};
export const RegisterUserCharacter = async (
  userId: string,
  charId: string,
  data: {
    atkTotal: number;
    level: number;
    isVisibleInRanking: boolean;
    stats?: {
      attack?: number | null;
      defense?: number | null;
      hp?: number | null;
      specialAttack?: number | null;
      specialDefense?: number | null;
      criticalStrike?: number | null;
      criticalDamage?: number | null;
      recHP?: number | null;
      recMP?: number | null;
    };
  }
): Promise<IUserGameChar[]> => {
  if (!userId || typeof userId !== 'string') {
    throw new Error('ID do usuário inválido.');
  }

  if (!charId || typeof charId !== 'string') {
    throw new Error('ID do personagem inválido.');
  }

  if (typeof data.atkTotal !== 'number' || isNaN(data.atkTotal) || data.atkTotal < 0) {
    throw new Error('ATK Total deve ser um número positivo.');
  }

  if (typeof data.level !== 'number' || isNaN(data.level) || data.level < 1 || data.level > 85) {
    throw new Error('Level deve ser um número entre 1 e 85.');
  }

  try {
    const response = await api.post(`/users/${userId}/characters/${charId}`, {
      atkTotal: data.atkTotal,
      level: data.level,
      isVisibleInRanking: data.isVisibleInRanking,
      stats: data.stats || null // Envia stats como null se não fornecido
    });
    return response.data; // Retorna os dados da requisição
  } catch (error) {
    if (error.status === 409) {
      throw new Error('Personagem já associado ao usuário.');
    }

    throw error; // Lança o erro para ser tratado externamente
  }
};
export const getUserCharAtkHistoric = async (userCharId: string): Promise<AtkTotalLogResponse> => {
  try {
    const url = `/characters/${userCharId}/attack-historic`;

    const response = await api.get<AtkTotalLogResponse>(url);
    return response.data; // Retorna os dados da requisição
  } catch (error) {
    console.error('Erro ao buscar o histórico do personagens:', error);
    throw error;
  }
};
export const updateUserGameChar = async (
  userCharId: string,
  userId: string,
  { atkTotal, level }: { atkTotal: number; level: number }
): Promise<void> => {
  try {
    const url = `/users/characters/${userCharId}`;
    const url2 = `/users/${userId}/characters/${userCharId}`;


    const currentChar = await api.get(url2);
    const currentData = currentChar.data;

    // Calculate improvements
    const improvements: { levelGained?: number; atkGained?: number } = {};
    
    if (level > currentData.level) {
      improvements.levelGained = level - currentData.level;
    }
    if (atkTotal > currentData.atkTotal) {
      improvements.atkGained = atkTotal - currentData.atkTotal;
    }

    // Update character data
    await api.put(url, {
      atkTotal,
      level
    });

    // Update progress store if there are improvements
    if (Object.keys(improvements).length > 0) {
      const progressStore = useProgressStore.getState();
      progressStore.updateRecentImprovements(userCharId, improvements);
    }
  } catch (error) {
    console.error('Erro ao atualizar o personagem:', error);
    throw error;
  }
};
export const updateCharacter = async (charId: string, data: {
  name?: string;
  defaultImgUrl?: string;
  thumbImgUrl?: string;
  awakeningImg?: string;
  haveAwakening?: boolean;
  color?: string;
}): Promise<void> => {
  try {
    const url = `/characters/${charId}`;
    await api.put(url, data);
  } catch (error) {
    console.error('Erro ao atualizar o personagem:', error);
    throw error;
  }
};
export const toggleAwakened = async (userCharId: string) => {
  try {
    const response = await api.put(`/characters/${userCharId}/toggle-awakened`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
