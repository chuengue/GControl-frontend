import { IUserGameCharDetails } from '../../../type';

export interface RankingList extends IUserGameCharDetails {
  nickname: string;
}
export interface RankingResponse {
  success: boolean;
  results: { data: RankingList[]; total: number; page: number; limit: number };
}
