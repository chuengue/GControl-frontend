import { IUserGameCharStats } from './service/requests/types';
export interface Character {
    id: string;
    name: string;
    defaultImgUrl: string;
    thumbImgUrl: string;
    classes: { img: string; className: string }[];
    HaveAwakening: boolean;
    awakeningImg: string;
    color: string;
}
interface IItem {
    id: string;
    name: string;
    description: string | null;
    category: string;
    rarity: string;
    attack: number;
    defense: number;
    hp: number;
    shared: number;
    armorType: string | null;
    accessoryType: string | null;
    setName: string | null;
    usableBy: string;
    iconUrl: string;
    createdAt: string;
    updatedAt: string;
}

export interface IUserGameCharDetails {
    id: string;
    userId: string;
    gameCharId: string;
    level: number;
    atkTotal: number;
    stats: IUserGameCharStats;
    gameChar: Character;
    equippedItems: IItem[];
}
