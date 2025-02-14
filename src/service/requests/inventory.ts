import { GetAllFilters } from '../../pages/admin/types';
import api from '../api';

export const addItemToInventory = async (
    userCharId: string,
    data: {
        itemId: string;
        quantity: number;
        equipped: boolean;
    }
) => {
    try {
        const url = `/users/${userCharId}/inventory`;

        const response = await api.post(url, data);
        return response.data; // Retorna os dados da requisição
    } catch (error) {
        console.error('Erro ao buscar items:', error);
        throw error; // Lança o erro para ser tratado externamente
    }
};
export const updateQuantityItem = async (
    userCharId: string,
    userItemId: string,
    data: {
        quantity: number;
    }
) => {
    try {
        const url = `/users/${userCharId}/inventory/${userItemId}/quantity`;

        const response = await api.put(url, data);
        return response.data; // Retorna os dados da requisição
    } catch (error) {
        console.error('Erro ao buscar items:', error);
        throw error; // Lança o erro para ser tratado externamente
    }
};

export const moveItemForWarehouse = async (
    userId: string,
    userCharId: string,
    ItemId: string,
    data: {
        quantity: number;
    }
) => {
    try {
        const url = `/users/${userId}/inventory/${ItemId}/move/${userCharId}`;

        const response = await api.post(url, data);
        return response.data; // Retorna os dados da requisição
    } catch (error) {
        console.error('Erro ao buscar items:', error);
        throw error; // Lança o erro para ser tratado externamente
    }
};

export const getUserCharItems = async (
    userCharId: string,
    filters?: GetAllFilters
) => {
    try {
        let url = `/users/${userCharId}/inventory`;

        const defaultFilters = {
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
export const deleteItem = async (userCharId: string, UserItemId: string) => {
    try {
        const url = `/users/${userCharId}/inventory/${UserItemId}`;

        const response = await api.delete(url);
        return response.data; // Retorna os dados da requisição
    } catch (error) {
        console.error('Erro ao excluir items:', error);
        throw error; // Lança o erro para ser tratado externamente
    }
};
export const equipItem = async (userCharId: string, UserItemId: string) => {
    try {
        const url = `/users/${userCharId}/inventory/${UserItemId}/equip`;

        const response = await api.put(url);
        return response.data; // Retorna os dados da requisição
    } catch (error) {
        console.error('Erro ao excluir items:', error);
        throw error; // Lança o erro para ser tratado externamente
    }
};
export const unequipItem = async (userCharId: string, UserItemId: string) => {
    try {
        const url = `/users/${userCharId}/inventory/${UserItemId}/unequip`;

        const response = await api.put(url);
        return response.data; // Retorna os dados da requisição
    } catch (error) {
        console.error('Erro ao excluir items:', error);
        throw error; // Lança o erro para ser tratado externamente
    }
};
