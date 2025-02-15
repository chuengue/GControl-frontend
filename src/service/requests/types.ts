export interface IUserGameCharStats {
    attack: number;
    defense: number;
    hp: number;
    specialAttack: number;
    specialDefense: number;
    criticalStrike: number;
    criticalDamage: number;
    recHP: number;
    recMP: number;
}

export interface IUserGameChar {
    id: string;
    userId: string;
    gameCharId: string;
    level: number;
    atkTotal: number;
    stats: IUserGameCharStats;
}
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'ancestral';
export type EquipmentType =
    | 'helmet'
    | 'upper'
    | 'lower'
    | 'gloves'
    | 'shoes'
    | 'weapon';
export type AccessoryType =
    | 'earring'
    | 'piercing'
    | 'ring'
    | 'necklace'
    | 'foot_ornament'
    | 'arm_ornament'
    | 'lower_armor_ornament'
    | 'upper_armor_ornament'
    | 'lower_head'
    | 'upper_head';
export type ItemCategory =
    | 'equipment'
    | 'accessory'
    | 'slot'
    | 'pet'
    | 'etc'
    | 'scroll';
interface GetAllFilters {
    page?: number;
    limit?: number;
    id?: string;
    rarity?: Rarity;
    equipmentType?: EquipmentType;
    accessoryType?: AccessoryType;
    category?: ItemCategory;
}

export interface DropItem {
    itemId: string;
    quantity: number;
 }
 
 export interface DropData {
    drops: DropItem[];
 }

 export interface DropRateReport {
    success: boolean;
    results: {
       sessionId: string;
       attempts: number;
       totalTimeSpent: number;
       avgTimePerAttempt: number;
       dropRates: DropRateItem[];
    };
 }
 
 export interface DropRateItem {
    itemName: string;
    totalDropped: string; // Se o backend retornar como string, manter assim. Caso contrário, alterar para `number`.
    dropRate: string; // Se for sempre um número, alterar para `number`.
    avgTimePerDrop: string; // Alterar para `number` se necessário.
 }