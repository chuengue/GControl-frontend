export interface EquipmentSet {
  id: string;
  name: string;
  totalPieces: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'; // Enum de raridades
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface EquipmentSetsResponse {
  message: string;
  data: EquipmentSet[];
}

export interface CreateEquipmentSetRequest {
  name: string;
  rarity: string;
  totalPieces: number;
}
