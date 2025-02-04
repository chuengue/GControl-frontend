import {
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField
} from '@mui/material';
import React, { useState } from 'react';

import useCharStore from '../../stores/charStore';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'ancestral';

type equipmentType =
    | 'helmet'
    | 'upper'
    | 'lower'
    | 'gloves'
    | 'shoes'
    | 'weapon';

interface ItemStats {
    attack?: number;
    defense?: number;
    hp?: number;
}

type ItemCategory =
    | 'equipment'
    | 'accessory'
    | 'slot'
    | 'pet'
    | 'etc'
    | 'scroll';

interface GrandChaseItem {
    id: string;
    name: string;
    description?: string;
    category: ItemCategory;
    rarity: Rarity;
    stats: ItemStats; // Stats deve ser um objeto
    shared?: boolean;
    ArmorType?: equipmentType;
    usableBy: string;
    iconUrl?: string;
}

const CreateItem = () => {
    const { allChars, fetchAllCharsData } = useCharStore();
    const [item, setItem] = useState<GrandChaseItem>({
        id: '',
        name: '',
        category: 'equipment', // Default category is 'equipment'
        rarity: 'common',
        stats: { attack: 0, defense: 0, hp: 0 }, // Stats default value
        shared: false,
        usableBy: '',
        ArmorType: undefined,
        iconUrl: ''
    });

    const getAllChars = async () => {
        if (!allChars || allChars.length === 0) {
            await fetchAllCharsData();
        }
    };

    React.useEffect(() => {
        getAllChars();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<
            | HTMLInputElement
            | HTMLTextAreaElement
            | { name?: string; value: unknown }
        >
    ) => {
        const { name, value } = e.target;
        if (name?.startsWith('stats.')) {
            // Para campos de stats, atualizar o objeto stats
            const statName = name.split('.')[1];
            setItem(prevItem => ({
                ...prevItem,
                stats: {
                    ...prevItem.stats,
                    [statName]: value
                }
            }));
        } else {
            setItem(prevItem => ({
                ...prevItem,
                [name as string]: value
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(item);
    };
    return (
        <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Item Name"
                        variant="outlined"
                        name="name"
                        value={item.name}
                        onChange={handleChange}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Description"
                        variant="outlined"
                        name="description"
                        value={item.description || ''}
                        onChange={handleChange}
                        multiline
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                            name="category"
                            value={item.category}
                            onChange={handleChange}
                            label="Category"
                        >
                            <MenuItem value="equipment">Equipment</MenuItem>
                            <MenuItem value="accessory">Accessory</MenuItem>
                            <MenuItem value="slot">Slot</MenuItem>
                            <MenuItem value="pet">Pet</MenuItem>
                            <MenuItem value="etc">Etc</MenuItem>
                            <MenuItem value="scroll">Scroll</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Rarity</InputLabel>
                        <Select
                            name="rarity"
                            value={item.rarity}
                            onChange={handleChange}
                            label="Rarity"
                        >
                            <MenuItem value="common">Common</MenuItem>
                            <MenuItem value="rare">Rare</MenuItem>
                            <MenuItem value="epic">Epic</MenuItem>
                            <MenuItem value="legendary">Legendary</MenuItem>
                            <MenuItem value="ancestral">Ancestral</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                {/* ArmorType Field appears only if category is 'equipment' */}
                {item.category === 'equipment' && (
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Armor Type</InputLabel>
                            <Select
                                name="ArmorType"
                                value={item.ArmorType || ''}
                                onChange={handleChange}
                                label="Armor Type"
                            >
                                <MenuItem value="helmet">Helmet</MenuItem>
                                <MenuItem value="upper">Upper</MenuItem>
                                <MenuItem value="lower">Lower</MenuItem>
                                <MenuItem value="gloves">Gloves</MenuItem>
                                <MenuItem value="shoes">Shoes</MenuItem>
                                <MenuItem value="weapon">Weapon</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                )}

                {(item.category === 'equipment' ||
                    item.category === 'accessory' ||
                    item.category === 'pet') && (
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Attack"
                            variant="outlined"
                            name="stats.attack"
                            value={item.stats.attack || ''}
                            onChange={handleChange}
                        />
                    </Grid>
                )}

                {(item.category === 'equipment' ||
                    item.category === 'accessory' ||
                    item.category === 'pet') && (
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Defense"
                            variant="outlined"
                            name="stats.defense"
                            value={item.stats.defense || ''}
                            onChange={handleChange}
                        />
                    </Grid>
                )}

                {(item.category === 'equipment' ||
                    item.category === 'accessory') && (
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="HP"
                            variant="outlined"
                            name="stats.hp"
                            value={item.stats.hp || ''}
                            onChange={handleChange}
                        />
                    </Grid>
                )}

                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Usable By</InputLabel>
                        <Select
                            name="usableBy"
                            value={item.usableBy || ''}
                            onChange={handleChange}
                            label="Usable By"
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        maxHeight: 200, // Define uma altura máxima para o dropdown
                                        overflowY: 'auto' // Adiciona rolagem vertical caso necessário
                                    }
                                }
                            }}
                        >
                            {allChars.map(char => {
                                return (
                                    <MenuItem value={char.name} key={char.id}>
                                        {char.name}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Icon URL"
                        variant="outlined"
                        name="iconUrl"
                        value={item.iconUrl || ''}
                        onChange={handleChange}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={item.shared || false}
                                onChange={e =>
                                    handleChange({
                                        target: {
                                            name: 'shared',
                                            value: e.target.checked
                                        }
                                    })
                                }
                            />
                        }
                        label="Nao permitido no armazem ?"
                    />
                </Grid>

                <Grid item xs={12}>
                    <Button variant="contained" color="primary" type="submit">
                        Submit
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};

export default CreateItem;
