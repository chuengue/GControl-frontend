import { GetAllFilters, GrandChaseItem } from '../../pages/admin/types';
import api from '../api';

export const getItems = async (itemId: string) => {
    try {
        // Monta a URL com ou sem o charId
        const url = itemId ? `/item/${itemId}` : '/item';

        const response = await api.get(url);
        return response.data; // Retorna os dados da requisição
    } catch (error) {
        console.error('Erro ao buscar items:', error);
        throw error; // Lança o erro para ser tratado externamente
    }
};

export const getItemsFilters = async (filters?: GetAllFilters) => {
    try {
        let url = '/item';

        const defaultFilters = {
            page: 1,
            limit: 60,
            ...filters
        };

        const queryParams = new URLSearchParams();

        Object.entries(defaultFilters).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, value.toString());
            }
        });

        url += `?${queryParams.toString()}`;

        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar itens:', error);
        throw error;
    }
};
export const deleteItem = async (itemId: string) => {
    try {
        // Monta a URL com ou sem o charId
        const url = `/item/${itemId}`;

        const response = await api.delete(url);
        return response.data; // Retorna os dados da requisição
    } catch (error) {
        console.error('Erro ao excluir items:', error);
        throw error; // Lança o erro para ser tratado externamente
    }
};

export const registerItem = async (item: Omit<GrandChaseItem, 'id'>) => {
    try {
        const response = await api.post(`/create-items`, item);
        return response.data; // Retorna os dados da requisição
    } catch (error) {
        if (error.status === 409) {
            throw new Error(Error.name);
        }

        throw error; // Lança o erro para ser tratado externamente
    }
};
