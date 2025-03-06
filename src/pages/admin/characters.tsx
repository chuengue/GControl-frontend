import { Cancel as CancelIcon, Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { alpha, Box, Card, Checkbox, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { blue } from '@mui/material/colors';
import React, { useEffect, useState } from 'react';

import theme from '../../../theme';
import { Character } from '../../interfaces/char';
import { updateCharacter } from '../../service/requests/gameChar';
import useCharStore from '../../stores/charStore';
import { useSnackbarStore } from '../../stores/snackBarStore';

const CharacterManagement = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { allChars, fetchAllCharsData } = useCharStore();
  const { showSnackbar } = useSnackbarStore();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedChar, setEditedChar] = useState<Character | null>(null);

  useEffect(() => {
    const loadCharacters = async () => {
      setLoading(true);
      try {
        await fetchAllCharsData();
      } catch (error) {
        showSnackbar('Erro ao carregar personagens', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadCharacters();
  }, []);

  const handleEdit = (char: Character) => {
    setEditingId(char.id);
    setEditedChar({ ...char });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedChar(null);
  };

  const handleSave = async () => {
    if (!editedChar) return;

    try {
      await updateCharacter(editedChar.id, {
        name: editedChar.name,
        defaultImgUrl: editedChar.defaultImgUrl,
        thumbImgUrl: editedChar.thumbImgUrl,
        awakeningImg: editedChar.awakeningImg,
        haveAwakening: editedChar.haveAwakening,
        color: editedChar.color
      });
      await fetchAllCharsData();
      showSnackbar('Personagem atualizado com sucesso', 'success');
      setEditingId(null);
      setEditedChar(null);
    } catch (error) {
      showSnackbar('Erro ao atualizar personagem', 'error');
    }
  };

  const handleChange = (field: keyof Character, value: string | boolean) => {
    if (!editedChar) return;
    setEditedChar({ ...editedChar, [field]: value });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Typography variant="h5" gutterBottom sx={{ color: 'white', mb: 2 }}>
        Gerenciamento de Personagens
      </Typography>

      <Card
        sx={{
          bgcolor: alpha(blue[900], 0.9),
          borderRadius: '12px',
          boxShadow: `0 4px 16px ${alpha('#000', 0.2)}`,
          backdropFilter: 'blur(8px)',
          border: `1px solid ${alpha(blue[400], 0.1)}`,
          overflow: 'auto'
        }}
      >
        <TableContainer component={Paper} sx={{ bgcolor: 'transparent' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', py: 1, px: 2 }}>Nome</TableCell>
                <TableCell sx={{ color: 'white', py: 1, px: 2 }}>Imagem Padrão</TableCell>
                <TableCell sx={{ color: 'white', py: 1, px: 2 }}>Imagem Thumb</TableCell>
                <TableCell sx={{ color: 'white', py: 1, px: 2 }}>Imagem Awakening</TableCell>
                <TableCell sx={{ color: 'white', py: 1, px: 2 }}>Awakening</TableCell>
                <TableCell sx={{ color: 'white', py: 1, px: 2 }}>Cor</TableCell>
                <TableCell sx={{ color: 'white', py: 1, px: 2, width: '100px' }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allChars.map((char) => (
                <TableRow key={char.id} hover sx={{ '&:hover': { bgcolor: alpha(blue[800], 0.3) } }}>
                  <TableCell sx={{ py: 1, px: 2 }}>
                    {editingId === char.id ? (
                      <TextField
                        fullWidth
                        value={editedChar?.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        size="small"
                        sx={{ input: { color: 'white', py: 0.5 } }}
                      />
                    ) : (
                      <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>{char.name}</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 1, px: 2 }}>
                    {editingId === char.id ? (
                      <TextField
                        fullWidth
                        value={editedChar?.defaultImgUrl || ''}
                        onChange={(e) => handleChange('defaultImgUrl', e.target.value)}
                        size="small"
                        sx={{ input: { color: 'white', py: 0.5 } }}
                      />
                    ) : (
                      <Tooltip title={char.defaultImgUrl}>
                        <Typography sx={{ color: 'white', fontSize: '0.875rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {char.defaultImgUrl}
                        </Typography>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 1, px: 2 }}>
                    {editingId === char.id ? (
                      <TextField
                        fullWidth
                        value={editedChar?.thumbImgUrl || ''}
                        onChange={(e) => handleChange('thumbImgUrl', e.target.value)}
                        size="small"
                        sx={{ input: { color: 'white', py: 0.5 } }}
                      />
                    ) : (
                      <Tooltip title={char.thumbImgUrl}>
                        <Typography sx={{ color: 'white', fontSize: '0.875rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {char.thumbImgUrl}
                        </Typography>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 1, px: 2 }}>
                    {editingId === char.id ? (
                      <TextField
                        fullWidth
                        value={editedChar?.awakeningImg || ''}
                        onChange={(e) => handleChange('awakeningImg', e.target.value)}
                        size="small"
                        sx={{ input: { color: 'white', py: 0.5 } }}
                      />
                    ) : (
                      <Tooltip title={char.awakeningImg}>
                        <Typography sx={{ color: 'white', fontSize: '0.875rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {char.awakeningImg}
                        </Typography>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 1, px: 2 }}>
                    {editingId === char.id ? (
                      <Checkbox
                        checked={editedChar?.haveAwakening || false}
                        onChange={(e) => handleChange('haveAwakening', e.target.checked)}
                        size="small"
                        sx={{ color: 'white', py: 0 }}
                      />
                    ) : (
                      <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>
                        {char.haveAwakening ? 'Sim' : 'Não'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 1, px: 2 }}>
                    {editingId === char.id ? (
                      <TextField
                        fullWidth
                        value={editedChar?.color || ''}
                        onChange={(e) => handleChange('color', e.target.value)}
                        size="small"
                        sx={{ input: { color: 'white', py: 0.5 } }}
                      />
                    ) : (
                      <Typography sx={{ color: 'white', fontSize: '0.875rem' }}>{char.color}</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 1, px: 2 }}>
                    {editingId === char.id ? (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Salvar">
                          <IconButton onClick={handleSave} color="success" size="small">
                            <SaveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancelar">
                          <IconButton onClick={handleCancel} color="error" size="small">
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Tooltip title="Editar">
                        <IconButton onClick={() => handleEdit(char)} color="primary" size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default CharacterManagement; 