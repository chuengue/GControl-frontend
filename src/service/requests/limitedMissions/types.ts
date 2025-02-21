// Representação do status da missão com attemptId e status
export interface MissionStatus {
    attemptId: string;
    status: boolean;
}

// Representação de uma missão concluída por um personagem
export interface MissionCompleted {
    name: string;
    imgUrl: string;
    status: MissionStatus[]; // Array de status com attemptId e status
}

// Representação de um personagem com suas missões
export interface CharacterLogMissions {
    id: string;
    name: string;
    thumbImgUrl: string;
    missionsCompleted: {
        [missionId: string]: MissionCompleted; // Map de missões completadas por ID de missão
    };
}

// Estrutura da resposta com o resultado da consulta
interface MissionResponse {
    success: boolean;
    results: CharacterLogMissions[];
}


export interface MissionResult {
    id: string;
    missionId: string;
    type: 'daily' | 'weekly';
    max_attempts: number;
    mission_name: string;
    mission_imgUrl: string;
    mission_type: string; // Pode ser um enum se houver tipos fixos de missão
}

export interface ApiGetAllLimitedMissionResponse {
    success: boolean;
    results: MissionResult[];
}
