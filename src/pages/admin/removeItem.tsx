import { Box, Button, Container, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';

import { deleteItem } from '../../service/requests/items';
import { useSnackbarStore } from '../../stores/snackBarStore';

const RemoveItemPage = () => {
    const [itemId, setItemId] = useState('');
    const { showSnackbar } = useSnackbarStore();

    const [loading, setLoading] = useState(false);

    const handleRemoveItem = async () => {
        try {
            setLoading(true);
            const register = await deleteItem(itemId);
            showSnackbar(register.results.message, 'success', {
                vertical: 'top',
                horizontal: 'center'
            });
        } catch (err) {
            showSnackbar(err.response.data.error, 'error', {
                vertical: 'top',
                horizontal: 'center'
            });
        } finally {
            setLoading(false);
            setItemId('');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                mt={5}
            >
                <Typography variant="h4" gutterBottom>
                    Remover Item
                </Typography>
                <TextField
                    label="ID do Item"
                    variant="outlined"
                    fullWidth
                    value={itemId}
                    onChange={e => setItemId(e.target.value)}
                    margin="normal"
                    disabled={loading}
                />
                <Button
                    variant="contained"
                    onClick={handleRemoveItem}
                    disabled={loading}
                >
                    {loading ? 'Removendo...' : 'Remover'}
                </Button>
            </Box>
        </Container>
    );
};

export default RemoveItemPage;
