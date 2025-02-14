export interface Character {
    id: string;
    name: string;
    defaultImgUrl: string;
    thumbImgUrl: string;
    awakeningImg: string | null;
    haveAwakening: number;
    color: string;
    created_at: string;
    updated_at: string;
}
export interface CharacterWithUserCharId {
    id: string;
    userCharId: string;
    name: string;
    defaultImgUrl: string;
    thumbImgUrl: string;
    awakeningImg: string | null;
    haveAwakening: number;
    color: string;
    created_at: string;
    updated_at: string;
}
export interface Mission {
    id: string;
    name: string;
    level: number;
    type: string;
    imgUrl: string;
    created_at: string;
    updated_at: string;
}

export interface Session {
    sessionId: string;
    missionId: string;
    name: string | null;
    userCharId: string;
    attempts: number;
    totalTimeSpent: number;
    avgTimePerAttempt: number;
    character: Character;
    mission: Mission;
    created_at:string;
    updated_at: string;
}
export interface SessionPayload {
    attempts: number;
    name: string | null;
    timeSpent: string;

}
export interface CharacterClass {
    className: string;
    img: string;
}



export interface ApiResponseChar {
    success: boolean;
    results: Character[];
}
