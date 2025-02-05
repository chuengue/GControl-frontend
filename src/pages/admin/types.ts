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

export interface ItemStats {
    attack?: number;
    defense?: number;
    hp?: number;
}

export interface GrandChaseItem {
    id: string;
    name: string;
    description?: string;
    category: ItemCategory;
    rarity: Rarity;
    stats: ItemStats;
    shared?: boolean;
    armorType?: EquipmentType;
    accessoryType?: AccessoryType;
    setName?: string;
    usableBy?: string;
    iconUrl?: string;
}
