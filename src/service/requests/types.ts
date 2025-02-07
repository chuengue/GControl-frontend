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
