import { Button, FormControl, Grid, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import React, { ChangeEvent, useState } from 'react';
import { createEquipmentSet } from '../../service/requests/sets/sets';
import { useSnackbarStore } from '../../stores/snackBarStore';
import { raritiesOptions } from './consts';

interface EquipmentSetForm {
    name: string;
    rarity: string;
    totalPieces: number;
}

const CreateSet = () => {
    const { showSnackbar } = useSnackbarStore();
    const [loading, setLoading] = useState<boolean>(false);

    const [set, setSet] = useState<EquipmentSetForm>({
        name: '',
        rarity: 'common',
        totalPieces: 0
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        const { name, value } = e.target;
        setSet(prevSet => ({
            ...prevSet,
            [name as string]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            await createEquipmentSet({
                ...set,
                name: set.name.replace(/\b\w/g, char => char.toUpperCase())
            });
            
            showSnackbar('Set created successfully!', 'success', {
                vertical: 'top',
                horizontal: 'center'
            });

            // Reset form
            setSet({
                name: '',
                rarity: 'common',
                totalPieces: 2
            });
        } catch (err) {
            showSnackbar(err.response?.data?.error || 'Error creating set', 'error', {
                vertical: 'top',
                horizontal: 'center'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h4" gutterBottom>
                        Create Equipment Set
                    </Typography>
                </Grid>

                {/* Set Name */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Set Name"
                        variant="outlined"
                        name="name"
                        value={set.name}
                        onChange={handleChange}
                        disabled={loading}
                        onBlur={() => {
                            setSet(prevSet => ({
                                ...prevSet,
                                name: prevSet.name.replace(/_/g, ' ')
                            }));
                        }}
                    />
                </Grid>

                {/* Rarity */}
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Rarity</InputLabel>
                        <Select
                            name="rarity"
                            value={set.rarity}
                            onChange={handleChange}
                            label="Rarity"
                            disabled={loading}
                        >
                            {raritiesOptions.map(option => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                {/* Total Pieces */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Total Pieces"
                        variant="outlined"
                        name="totalPieces"
                        type="number"
                        value={set.totalPieces}
                        onChange={handleChange}
                        disabled={loading}
                        InputProps={{
                            inputProps: { min: 2 }
                        }}
                    />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        fullWidth
                    >
                        {loading ? 'Creating...' : 'Create Set'}
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};

export default CreateSet; 