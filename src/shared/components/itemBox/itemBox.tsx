import {
    Box,
    Card,
    CardContent,
    Divider,
    Popover,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import React, { useState } from 'react';
import { GrandChaseItem } from '../../../pages/admin/types';
import {
    ACCESSORY_TYPES_ENUM,
    EQUIPMENT_TYPE_ENUM,
    ITEM_CATEGORY_ENUM,
    RARITIES_ENUM
} from './itemsEnum';

const ItemBox: React.FC<{ item: GrandChaseItem }> = ({ item }) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const getIconUrl = (rarity: string) => {
        switch (rarity) {
            case 'common':
                return '/assets/images/inv/bg_common.png';
            case 'rare':
                return '/assets/images/inv/bg_rare.png';
            case 'epic':
                return '/assets/images/inv/bg_epic.png';
            case 'legendary':
                return '/assets/images/inv/bg_legendary.png';
            case 'ancestral':
                return '/assets/images/inv/bg_ancestral.png';
            default:
                return '/assets/images/inv/bg_common.png';
        }
    };
    return (
        <Card
            sx={{
                width: 74,
                height: 74,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.palette.raritiesColors[item.rarity],
                backgroundImage: `url(${getIconUrl(item.rarity)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'scale(1.1)'
                }
            }}
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
        >
            <CardContent
                sx={{
                    width: '100%',
                    height: '100%',
                    padding: '0px !important'
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%'
                    }}
                >
                    <img
                        src={item.iconUrl}
                        alt={item.name}
                        style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'contain'
                        }}
                    />
                </Box>
            </CardContent>

            <Popover
                id="mouse-over-popover"
                aria-owns={open ? 'mouse-over-popover' : undefined}
                aria-haspopup="true"
                open={open}
                anchorEl={anchorEl}
                sx={{ pointerEvents: 'none' }}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left'
                }}
                disableRestoreFocus
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
                        background: 'linear-gradient(145deg, #1e1e2f, #2a2a40)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#ffffff',
                        maxWidth: '370px',
                        minWidth: '300px',
                        padding: '16px'
                    }
                }}
            >
                <Box>
                    {/* Título do item */}
                    <Card
                        sx={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            padding: '8px',
                            textAlign: 'center',
                            marginBottom: '12px'
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            fontWeight="600"
                            color={theme.palette.raritiesColors[item.rarity]}
                        >
                            {item.name}
                        </Typography>
                    </Card>

                    {/* Detalhes do item */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: '8px',
                            flexDirection: 'column',
                            width: '100%',
                            marginBottom: '12px'
                        }}
                    >
                        <Stack
                            sx={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                paddingRight: 1
                            }}
                        >
                            {item.armorType && (
                                <Typography variant="body2">
                                    {EQUIPMENT_TYPE_ENUM[item.armorType]}
                                </Typography>
                            )}
                            {item.accessoryType && (
                                <Typography variant="body2">
                                    {ACCESSORY_TYPES_ENUM[item.accessoryType]}
                                </Typography>
                            )}

                            <Typography
                                variant="body2"
                                sx={{ opacity: 0.8 }}
                                color={
                                    theme.palette.raritiesColors[item.rarity]
                                }
                            >
                                <strong> {RARITIES_ENUM[item.rarity]}</strong>
                            </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            <strong>Tipo:</strong>{' '}
                            {ITEM_CATEGORY_ENUM[item.category]}
                        </Typography>
                        <Divider />
                        {(item.category === 'accessory' ||
                            item.category === 'pet' ||
                            item.category === 'equipment') && (
                            <>
                                <Typography
                                    variant="body2"
                                    sx={{ opacity: 0.8 }}
                                >
                                    <strong>Ataque:</strong> {item.stats.attack}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ opacity: 0.8 }}
                                >
                                    <strong>Defesa:</strong>{' '}
                                    {item.stats.defense}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ opacity: 0.8 }}
                                >
                                    <strong>HP:</strong> {item.stats.hp}
                                </Typography>
                            </>
                        )}
                        <Divider />
                    </Box>

                    {/* Conjunto do item */}
                    {item.setName && (
                        <Typography
                            variant="body2"
                            sx={{
                                fontStyle: 'italic',
                                opacity: 0.8,
                                marginBottom: '12px'
                            }}
                        >
                            <strong>Conjunto:</strong> {item.setName}
                        </Typography>
                    )}

                    {/* Usuário ou tipo de armadura */}
                    {item.usableBy && (
                        <Typography
                            variant="body2"
                            sx={{ fontStyle: 'italic', opacity: 0.8 }}
                        >
                            <strong>Usável por:</strong> {item.usableBy}
                        </Typography>
                    )}

                    {/* Descrição do item */}
                    {item.description && (
                        <Card
                            elevation={0}
                            sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                p: 1,
                                mt: 1
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{ marginBottom: '12px', opacity: 0.8 }}
                            >
                                {item.description}
                            </Typography>
                        </Card>
                    )}
                </Box>
            </Popover>
        </Card>
    );
};

export default ItemBox;
