import api from '../api';

export const getMyCharacters = async (userId: string) => {
    try {
        // Monta a URL com ou sem o charId
        const url = userId ? `/user-char/${userId}` : '/chars';

        const response = await api.get(url);
        return response.data; // Retorna os dados da requisição
    } catch (error) {
        console.error('Erro ao buscar o personagens:', error);
        throw error; // Lança o erro para ser tratado externamente
    }
};

export const getCharacters = async (charId?: string) => {
    try {
        // Monta a URL com ou sem o charId
        const url = charId ? `/chars/${charId}` : '/chars';

        const response = await api.get(url);
        return response.data; // Retorna os dados da requisição
    } catch (error) {
        console.error('Erro ao buscar o personagem:', error);
        throw error; // Lança o erro para ser tratado externamente
    }
};
