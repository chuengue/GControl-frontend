import { Mission, Session } from "../../../shared/types";

export interface FarmSessionsResponse {
    success: boolean;
    results: {
        userId: string;
        sessions: Session[];
    };
}

export interface MissionResponse {
    success: boolean;
    results: Mission[];
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    page: number;
}