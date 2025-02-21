export interface LimitedMission {
    name: string;
    imgUrl: string;
    status: boolean[];
}

export interface CharacterMissions {
    id: string;
    name: string;
    thumbImgUrl: string;
    missionsCompleted: Record<string, LimitedMission>; // O ID da missão como chave
}

export interface ApiResponse {
    success: boolean;
    results: CharacterMissions[];
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
