import { Box, Button, Grid, Paper, Snackbar, TextField, Typography } from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { blue, grey } from '@mui/material/colors';
import React, { useState } from 'react';

import { IUserGameCharStats } from '../../service/requests/types';
import useCharStore from '../../stores/charStore';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
    <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

const InputField = ({ label, value, onChange, error }) => (
    <TextField
        label={label}
        value={value}
        onChange={onChange}
        fullWidth
        sx={{ mb: 2 }}
        inputProps={{ pattern: '^\\d*(\\.\\d{0,2})?$' }}
        error={error}
        helperText={error ? 'Campo obrigatório' : ''}
    />
);

function TotalattackCalculator() {
    const { charStats, SetCharStats, setAttackTotal, attackTotal } =
        useCharStore();
    const [estError, setEstError] = useState<Number>(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [errors, setErrors] = useState<Record<string, boolean>>({});

    const handleChange = field => e => {
        const value = e.target.value;
        if (/^\d*(\.\d{0,2})?$/.test(value) || value === '') {
            SetCharStats({ ...charStats, [field]: value });
            setErrors(prev => ({ ...prev, [field]: false })); // Remove erro se o campo for preenchido
        }
    };

    const calculateattackTotal = () => {
        const values: IUserGameCharStats = {
            attack: parseFloat(String(charStats.attack) || '0'),
            defense: parseFloat(String(charStats.defense) || '0'),
            hp: parseFloat(String(charStats.hp) || '0'),
            specialAttack: parseFloat(String(charStats.specialAttack) || '0'),
            specialDefense: parseFloat(String(charStats.specialDefense) || '0'),
            criticalStrike:
                parseFloat(String(charStats.criticalStrike) || '0') / 100,
            criticalDamage:
                1.2 + parseFloat(String(charStats.criticalDamage) || '0') / 100,
            recHP: parseFloat(String(charStats.recHP) || '0'),
            recMP: parseFloat(String(charStats.recMP) || '0')
        };

        const missingFields = checkError(values);

        if (Object.keys(missingFields).length === 0) {
            const o1 = 0.8 * values.attack;
            const o2 =
                (7407 / 125) *
                (values.attack + values.specialAttack) *
                (100 + values.recMP) *
                (1 / 10000);
            const o3 =
                (o1 + o2) *
                (1 -
                    values.criticalStrike +
                    values.criticalStrike * values.criticalDamage);

            const d1 = values.defense * 0.7 + values.specialDefense * 0.14;
            const d2 = (values.hp + (values.hp * values.recHP) / 100) * 0.7;
            const d3 = d1 + d2;

            const finalResult = Math.round(o3 + d3);
            const estCalcError = Math.round(0.000089 * (o3 + d3));

            setEstError(estCalcError);
            setAttackTotal(finalResult);
            setErrorMessage('');
        } else {
            setErrorMessage('Preencha todos os campos obrigatórios.');
            setEstError(0);
            setErrors(missingFields);
        }

        setOpenSnackbar(true);
    };

    const checkError = values => {
        const missingFields: Record<string, boolean> = {};
        Object.entries(values).forEach(([key, value]) => {
            if (isNaN(value) || value === 0) {
                missingFields[key] = true;
            }
        });
        return missingFields;
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <Paper
            elevation={3}
            sx={{
                maxWidth: 'auto',
                margin: 'auto',
                padding: 3,
                backgroundColor: blue[900],
                borderRadius: 2
            }}
        >
            <Typography
                variant="h4"
                fontFamily="Faktos"
                sx={{
                    textAlign: 'center',
                    color: 'white',
                    marginBottom: 2
                }}
            >
                Cálculo de Ataque Total
            </Typography>

            <Grid container spacing={1}>
                {[
                    { label: 'Ataque', field: 'attack' },
                    { label: 'Defesa', field: 'defense' },
                    { label: 'HP', field: 'hp' },
                    { label: 'Ataque Especial', field: 'specialAttack' },
                    { label: 'Defesa Especial', field: 'specialDefense' },
                    { label: 'Chance Crítico (%)', field: 'criticalStrike' },
                    { label: 'Dano Crítico (%)', field: 'criticalDamage' },
                    { label: 'Recuperação HP (%)', field: 'recHP' },
                    { label: 'Recuperação MP (%)', field: 'recMP' }
                ].map(({ label, field }, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                        <InputField
                            label={label}
                            value={charStats[field] || ''}
                            onChange={handleChange(field)}
                            error={errors[field] || false}
                        />
                    </Grid>
                ))}
                <Grid item xs={12} sm={6}>
                    <Paper
                        elevation={3}
                        sx={{
                            bgcolor: grey[900],
                            width: '100%',
                            borderRadius: '4px',
                            boxShadow: 3,
                            padding: '14px'
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{
                                textAlign: 'start',
                                marginLeft: '10px',
                                fontWeight: 'bold',
                                color: 'white',
                                width: '100%'
                            }}
                        >
                            Ataque Total: {attackTotal} ± {String(estError)}
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            <Button
                variant="contained"
                size="large"
                sx={{
                    mt: 2,
                    backgroundColor: blue[600],
                    borderRadius: '8px',
                    color: '#fff',
                    '&:hover': { backgroundColor: 'primary.dark' }
                }}
                onClick={calculateattackTotal}
                fullWidth
            >
                Calcular
            </Button>

            <Box sx={{ mt: 2 }}>
                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={3000}
                    onClose={handleCloseSnackbar}
                >
                    <Alert severity={errorMessage ? 'error' : 'success'}>
                        {errorMessage || 'Cálculo realizado com sucesso!'}
                    </Alert>
                </Snackbar>
            </Box>
        </Paper>
    );
}

export default TotalattackCalculator;
