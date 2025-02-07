import { Box, MenuItem, Select, Tab, Tabs, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
    accessoriesOptions,
    armorTypeOptions,
    categoryOptions,
    raritiesOptions
} from '../../../pages/admin/consts';
import { getItemsFilters } from '../../../service/requests/items';
import {
    AccessoryType,
    EquipmentType,
    ItemCategory,
    Rarity
} from '../../../service/requests/types';
import ItemBox from '../itemBox/itemBox';

const categories = ['equipment', 'accessory', 'slot', 'pet', 'etc', 'scroll'];

export default function Inventory() {
    const [selectedCategory, setSelectedCategory] =
        useState<ItemCategory>('equipment');
    const [search, setSearch] = useState('');
    const [selectedRarity, setSelectedRarity] = useState<Rarity>('');
    const [selectedAccessoryType, setSelectedAccessoryType] =
        useState<AccessoryType>('');
    const [selectedEquipmentType, setSelectedEquipmentType] =
        useState<EquipmentType>('');
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const data = await getItemsFilters({
                    category: selectedCategory,
                    rarity: selectedRarity,
                    search: search,
                    accessoryType: selectedAccessoryType,
                    equipmentType: selectedEquipmentType,
                    page: page
                });
                setItems(data.results); // Atualiza os itens com a resposta da requisição
                console.log(data);
            } catch (error) {
                console.error('Erro ao buscar itens:', error);
            }
        };

        fetchItems();
    }, [
        selectedCategory,
        selectedRarity,
        selectedAccessoryType,
        selectedEquipmentType,
        search,
        page
    ]);

    const handleChangeTab = (newValue: ItemCategory) => {
        setPage(1);
        setSelectedAccessoryType(''); // Reseta os filtros de tipo de acessório
        setSelectedEquipmentType(''); // Reseta os filtros de tipo de equipamento
        setSearch(''); // Limpa a pesquisa
        setSelectedCategory(newValue); // Atualiza a categoria selecionada
    };

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            {/* Tabs de categorias */}
            <Tabs
                value={selectedCategory}
                onChange={(_, newValue) => handleChangeTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
            >
                {categoryOptions.map(category => (
                    <Tab
                        key={category.value}
                        label={category.label}
                        value={category.value}
                    />
                ))}
            </Tabs>

            {/* Filtros */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                    label="Buscar Item"
                    variant="outlined"
                    fullWidth
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {selectedCategory === 'equipment' && (
                    <Select
                        value={selectedEquipmentType}
                        onChange={e => setSelectedEquipmentType(e.target.value)}
                        displayEmpty
                        sx={{ width: 200 }}
                    >
                        <MenuItem value="">Tipo</MenuItem>
                        {armorTypeOptions.map(armorType => (
                            <MenuItem
                                key={armorType.label}
                                value={armorType.value}
                            >
                                {armorType.label}
                            </MenuItem>
                        ))}
                    </Select>
                )}
                {selectedCategory === 'accessory' && (
                    <Select
                        value={selectedAccessoryType}
                        onChange={e => setSelectedAccessoryType(e.target.value)}
                        displayEmpty
                        sx={{ width: 200 }}
                    >
                        <MenuItem value="">Tipo</MenuItem>
                        {accessoriesOptions.map(accessory => (
                            <MenuItem
                                key={accessory.label}
                                value={accessory.value}
                            >
                                {accessory.label}
                            </MenuItem>
                        ))}
                    </Select>
                )}
                <Select
                    value={selectedRarity}
                    onChange={e => setSelectedRarity(e.target.value)}
                    displayEmpty
                    sx={{ width: 200 }}
                >
                    <MenuItem value="">Todas Raridades</MenuItem>
                    {raritiesOptions.map(rarity => (
                        <MenuItem key={rarity.label} value={rarity.value}>
                            {rarity.label}
                        </MenuItem>
                    ))}
                </Select>
            </Box>

            {/* Inventário com Scroll e Grid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: 1,
                    mt: 2,
                    maxHeight: '400px',
                    overflowY: 'auto',
                    p: 2,
                    borderRadius: 2
                }}
            >
                {items.length > 0 ? (
                    items.map(item => (
                        <Box
                            key={item.id}
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <ItemBox item={item} />
                        </Box>
                    ))
                ) : (
                    <Box sx={{ width: '100%', textAlign: 'center', mt: 2 }}>
                        Nenhum item encontrado
                    </Box>
                )}
            </Box>
        </Box>
    );
}
