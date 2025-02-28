import api from '../../api';
import { RankingResponse } from './types';

export const getRankingList = async (
    page: number = 1,
    limit: number = 20
): Promise<RankingResponse> => {
    try {
        const url = `/ranking?page=${page}&limit=${limit}`;
        const response = await api.get<RankingResponse>(url);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        throw error;
    }
};

export const toggleVisibility = async(userCharId:string) =>{
    try {
        const url = `/ranking/${userCharId}`;

        await api.put(url)
    } catch (error) {
        
    }
}