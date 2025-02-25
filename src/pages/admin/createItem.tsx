import { Button, Checkbox, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { registerItem } from '../../service/requests/items';
import useCharStore from '../../stores/charStore';
import { useSnackbarStore } from '../../stores/snackBarStore';
import { accessoriesOptions, armorTypeOptions, categoryOptions, raritiesOptions } from './consts';
import { GrandChaseItem } from './types';

const CreateItem = () => {
  const { allChars, fetchAllCharsData } = useCharStore();
  const { showSnackbar } = useSnackbarStore();
  const [loading, setLoading] = useState<boolean>(false);

  const [item, setItem] = useState<Omit<GrandChaseItem, 'id'>>({
    name: '',
    category: 'equipment',
    rarity: 'common',
    stats: { attack: 0, defense: 0, hp: 0 },
    shared: false,
    iconUrl: ''
  });

  useEffect(() => {
    const getAllChars = async () => {
      if (!allChars || allChars.length === 0) {
        await fetchAllCharsData();
      }
    };
    getAllChars();
  }, [allChars, fetchAllCharsData]);

  const handleChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name?.startsWith('stats.')) {
      const statName = name.split('.')[1];
      setItem(prevItem => ({
        ...prevItem,
        stats: { ...prevItem.stats, [statName]: value }
      }));
    } else {
      setItem(prevItem => ({ ...prevItem, [name as string]: value }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Capitaliza a primeira letra de cada palavra no nome
    setItem(prevItem => ({
      ...prevItem,
      name: prevItem.name.replace(/\b\w/g, char => char.toUpperCase())
    }));

    try {
      setLoading(true);
      const register = await registerItem({
        ...item,
        name: item.name.replace(/\b\w/g, char => char.toUpperCase())
      });
      showSnackbar(register.results.message, 'success', {
        vertical: 'top',
        horizontal: 'center'
      });
      setItem(prevItem => {
        return { ...prevItem, armorType: '', category: '', accessoryType: '' };
      });
    } catch (err) {
      showSnackbar(err.response.data.error, 'error', {
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
        {/* Nome e Descrição */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Item Name"
            variant="outlined"
            name="name"
            value={item.name}
            onChange={handleChange}
            disabled={loading}
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
            disabled={loading}
            onBlur={() => {
              setItem(prevItem => ({
                ...prevItem,
                name: prevItem.name.replace(/_/g, ' ')
              }));
            }}
            multiline
            rows={3}
          />
        </Grid>

        {/* Categoria e Raridade */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={item.category}
              onChange={handleChange}
              label="Category"
              disabled={loading}
            >
              {categoryOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
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

        {/* Tipo de Armadura ou Acessório */}
        {item.category === 'equipment' && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Armor Type</InputLabel>
              <Select
                name="armorType"
                value={item.armorType || ''}
                onChange={handleChange}
                label="Armor Type"
                disabled={loading}
              >
                {armorTypeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
        {item.category === 'accessory' && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de acessório</InputLabel>
              <Select
                name="accessoryType"
                value={item.accessoryType || ''}
                onChange={handleChange}
                label="Tipo de acessório"
                disabled={loading}
              >
                {accessoriesOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        {/* Grupo de Stats (Attack, Defense, HP) */}
        {(item.category === 'equipment' ||
          item.category === 'accessory' ||
          item.category === 'pet') && (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ padding: 3, backgroundColor: 'secondary' }}>
              <Typography variant="h6" gutterBottom>
                Stats
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Attack"
                    variant="outlined"
                    name="stats.attack"
                    value={item.stats.attack || ''}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Defense"
                    variant="outlined"
                    name="stats.defense"
                    value={item.stats.defense || ''}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
                {(item.category === 'equipment' || item.category === 'accessory') && (
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="HP"
                      variant="outlined"
                      name="stats.hp"
                      value={item.stats.hp || ''}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>
        )}

        {/* Set Name e Usable By */}
        {(item.category === 'equipment' || item.category === 'accessory') && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Set Name"
              variant="outlined"
              name="setName"
              value={item.setName || ''}
              onChange={handleChange}
              disabled={loading}
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
              disabled={loading}
              label="Usable By"
              MenuProps={{
                PaperProps: {
                  style: { maxHeight: 200, overflowY: 'auto' }
                }
              }}
            >
              {allChars.map(char => (
                <MenuItem value={char.name} key={char.id}>
                  {char.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Icon URL e Shared Checkbox */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Icon URL"
            variant="outlined"
            disabled={loading}
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
                disabled={loading}
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
            label="Não permitido no armazém?"
          />
        </Grid>

        {/* Botão de Submit */}
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
            fullWidth
            sx={{ padding: 2 }}
          >
            {loading ? 'Registrando...' : 'Registrar'}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default CreateItem;
