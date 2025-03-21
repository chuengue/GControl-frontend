import api from "../../api";
import { CreateEquipmentSetRequest, EquipmentSetsResponse } from "./types";


export const getEquipmentSet = async (
    page: number = 1,
    limit: number = 20
): Promise<EquipmentSetsResponse> => {
    try {
        const url = `/equip-sets`;
        const response = await api.get<EquipmentSetsResponse>(url);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        throw error;
    }
};

export const createEquipmentSet = async (data: CreateEquipmentSetRequest): Promise<EquipmentSetsResponse> => {
    try {
        const url = `/equip-sets`;
        const response = await api.post<EquipmentSetsResponse>(url, data);
        return response.data;
    } catch (error) {
        console.error('Erro ao criar set de equipamento:', error);
        throw error;
    }
};