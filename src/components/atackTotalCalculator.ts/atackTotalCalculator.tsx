import {
    Box,
    Button,
    Grid,
    Paper,
    Snackbar,
    TextField,
    Typography
} from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { blue } from '@mui/material/colors';
import React, { useState } from 'react';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
    <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
));

const InputField = ({ label, value, onChange }) => (
    <TextField
        label={label}
        value={value}
        onChange={onChange}
        fullWidth
        sx={{ mb: 2 }}
    />
);

function TotalAtkCalculator() {
    const [formValues, setFormValues] = useState({
        ATK: '',
        DEF: '',
        HP: '',
        sATK: '',
        sDEF: '',
        crit_r: '',
        crit_d: '',
        rec_HP: '',
        rec_MP: ''
    });

    const [result, setResult] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const handleChange = field => e => {
        setFormValues({ ...formValues, [field]: e.target.value });
    };

    const calculateATKTotal = () => {
        const { ATK, DEF, HP, sATK, sDEF, crit_r, crit_d, rec_HP, rec_MP } =
            formValues;

        const values = {
            atk: parseFloat(ATK.replace(/,/g, '.')),
            def: parseFloat(DEF.replace(/,/g, '.')),
            hp: parseFloat(HP.replace(/,/g, '.')),
            satk: parseFloat(sATK.replace(/,/g, '.')),
            sdef: parseFloat(sDEF.replace(/,/g, '.')),
            critR: parseFloat(crit_r.replace(/,/g, '.')) / 100,
            critD: 1.2 + parseFloat(crit_d.replace(/,/g, '.')) / 100,
            recHPVal: parseFloat(rec_HP.replace(/,/g, '.')),
            recMPVal: parseFloat(rec_MP.replace(/,/g, '.'))
        };

        if (checkError(values)) {
            // Cálculo ofensivo
            const o1 = 0.8 * values.atk;
            const o2 =
                (7407 / 125) *
                (values.atk + values.satk) *
                (100 + values.recMPVal) *
                (1 / 10000);
            const o3 =
                (o1 + o2) * (1 - values.critR + values.critR * values.critD);

            // Cálculo defensivo
            const d1 = values.def * 0.7 + values.sdef * 0.14;
            const d2 = (values.hp + (values.hp * values.recHPVal) / 100) * 0.7;
            const d3 = d1 + d2;

            const finalResult = Math.round(o3 + d3);
            const estError = Math.round(0.000089 * (o3 + d3));

            setResult(`${finalResult} ± ${estError}`);
            setErrorMessage('');
        } else {
            setErrorMessage(
                'Valores inseridos inválidos. Verifique os campos.'
            );
            setResult('');
        }

        setOpenSnackbar(true);
    };

    const checkError = values => {
        return Object.values(values).every(
            value => !isNaN(value) && value >= 0
        );
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
                    color: 'secondary',
                    marginBottom: 2
                }}
            >
                Cálculo de Ataque Total
            </Typography>

            <Grid container spacing={1}>
                {[
                    { label: 'Ataque', field: 'ATK' },
                    { label: 'Defesa', field: 'DEF' },
                    { label: 'HP', field: 'HP' },
                    { label: 'Ataque Especial', field: 'sATK' },
                    { label: 'Defesa Especial', field: 'sDEF' },
                    { label: 'Chance Crítico (%)', field: 'crit_r' },
                    { label: 'Dano Crítico (%)', field: 'crit_d' },
                    { label: 'Recuperação HP (%)', field: 'rec_HP' },
                    { label: 'Recuperação MP (%)', field: 'rec_MP' }
                ].map(({ label, field }, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                        <InputField
                            label={label}
                            value={formValues[field]}
                            onChange={handleChange(field)}
                        />
                    </Grid>
                ))}
                <Grid item xs={12} sm={6}>
                    <Paper
                        elevation={3}
                        sx={{
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
                            Ataque Total: {result && result}
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
                    '&:hover': {
                        backgroundColor: 'primary.dark'
                    }
                }}
                onClick={calculateATKTotal}
                fullWidth
            >
                Calcular
            </Button>

            <Box sx={{ mt: 2 }}>
                {errorMessage && (
                    <Snackbar
                        open={openSnackbar}
                        autoHideDuration={3000}
                        onClose={handleCloseSnackbar}
                    >
                        <Alert severity="error">{errorMessage}</Alert>
                    </Snackbar>
                )}
            </Box>
        </Paper>
    );
}

export default TotalAtkCalculator;
