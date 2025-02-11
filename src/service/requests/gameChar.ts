import api from '../api';
import { IUserGameChar } from './types';

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
        const url = `users/${userId}/characters/${charId}`;

        const response = await api.get(url);
        return response.data; // Retorna os dados da requisição
    } catch (error) {
        console.error('Erro ao buscar o personagens:', error);
        throw error; // Lança o erro para ser tratado externamente
    }
};
export const getAllCharacters = async (charId?: string) => {
    try {
        // Monta a URL com ou sem o charId
        const url = charId ? `/characters/${charId}` : '/characters';

        const response = await api.get(url);
        return response.data; // Retorna os dados da requisição
    } catch (error) {
        console.error('Erro ao buscar o personagem:', error);
        throw error; // Lança o erro para ser tratado externamente
    }
};
export const RegisterUserCharacter = async (
    userId: string,
    charId: string,
    data: {
        atkTotal: number;
        level: number;
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

    if (
        typeof data.atkTotal !== 'number' ||
        isNaN(data.atkTotal) ||
        data.atkTotal < 0
    ) {
        throw new Error('ATK Total deve ser um número positivo.');
    }

    if (
        typeof data.level !== 'number' ||
        isNaN(data.level) ||
        data.level < 1 ||
        data.level > 85
    ) {
        throw new Error('Level deve ser um número entre 1 e 85.');
    }

    try {
        const response = await api.post(
            `/users/${userId}/characters/${charId}`,
            {
                atkTotal: data.atkTotal,
                level: data.level,
                stats: data.stats || null // Envia stats como null se não fornecido
            }
        );
        return response.data; // Retorna os dados da requisição
    } catch (error) {
        if (error.status === 409) {
            throw new Error('Personagem já associado ao usuário.');
        }

        throw error; // Lança o erro para ser tratado externamente
    }
};
