import {
    AccessoryType,
    EquipmentType,
    ItemCategory,
    Rarity
} from '../../../pages/admin/types';
import { ItemBoxPropsItem } from './itemBox';

export function formatItemBoxPropsItem(data: any): ItemBoxPropsItem {
    const item = data.item;

    return {
        id: data.item.id,
        userInventoryItemId: data.id,
        name: item.name,
        description: item.description || undefined,
        category: item.category as ItemCategory,
        rarity: item.rarity as Rarity,
        stats: {
            attack: item.stats.attack,
            defense: item.stats.defense,
            hp: item.stats.hp
        },
        shared: item.shared || false,
        armorType: item.armorType as EquipmentType | undefined,
        accessoryType: item.accessoryType as AccessoryType | undefined,
        equipped: data.equipped === 1, // 0 ou 1
        quantity: data.quantity || 1,
        setName: item.setName || undefined,
        iconUrl: item.iconUrl || undefined
    };
}
