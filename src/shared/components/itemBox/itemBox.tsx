import { Add, CheckCircle, Inventory, Remove } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import React, { useState } from 'react';

import {
  AccessoryType,
  EquipmentType,
  ItemCategory,
  ItemStats,
  Rarity
} from '../../../pages/admin/types';
import {
  ACCESSORY_TYPES_ENUM,
  EQUIPMENT_TYPE_ENUM,
  ITEM_CATEGORY_ENUM,
  RARITIES_ENUM
} from './itemsEnum';

export interface ItemBoxPropsItem {
  id: string;
  userInventoryItemId?: string;
  name: string;
  description?: string;
  category: ItemCategory;
  rarity: Rarity;
  stats: ItemStats;
  shared?: boolean;
  armorType?: EquipmentType;
  accessoryType?: AccessoryType;
  equipped?: boolean;
  quantity?: number;
  setName?: string;
  iconUrl?: string;
}

const ItemBox: React.FC<{
  item: ItemBoxPropsItem;
  IsDefault?: boolean;
  defaultType?: EquipmentType;
  hasChangeQuantity?: boolean;
  hasMoveItem?: boolean;
  hasOnEquip?: boolean;
  hasOnUnequip?: boolean;
  onMoveTitle?: string;
  onChangeQuantity?: (item, value) => void;
  onMoveItem?: (item) => void;
  onEquip?: (item) => void;
  onUnequip?: (item) => void;
  hasDetails?: boolean;
}> = ({
  item,
  IsDefault = false,
  defaultType,
  hasChangeQuantity,
  hasMoveItem,
  hasOnEquip = false,
  onMoveTitle,
  hasOnUnequip = false,
  onChangeQuantity,
  hasDetails = true,
  onMoveItem,
  onEquip,
  onUnequip
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const getIconUrl = (rarity: string) => {
    if (IsDefault) return '/assets/images/inv/bg_common.png';
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

  const handleContextMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuOpen(true);
    handlePopoverClose(); // Fecha o Popover ao abrir o menu de contexto
  };

  const handleCloseContextMenu = () => {
    setContextMenuOpen(false);
  };

  const getColor = () => {
    if (IsDefault) {
      return 'white';
    }
    return theme.palette.raritiesColors[item?.rarity || 'common'];
  };

  return (
    <Card
      sx={{
        width: 74,
        height: 74,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: getColor(),
        backgroundImage: `url(${getIconUrl(item.rarity)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        cursor: 'pointer',
        position: 'relative'
      }}
      onMouseEnter={handlePopoverOpen}
      onMouseLeave={handlePopoverClose}
      onContextMenu={handleContextMenu}
    >
      <CardContent
        sx={{
          width: '100%',
          height: '100%',
          padding: '0px !important',
          position: 'relative'
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
          {IsDefault ? (
            <Typography>{defaultType}</Typography>
          ) : (
            <img
              src={item.iconUrl}
              alt={item.name}
              style={{
                width: '60px',
                height: '60px',
                objectFit: 'contain'
              }}
            />
          )}
        </Box>
        {!IsDefault && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              borderRadius: '4px',
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography
              sx={{
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {item.quantity ? item.quantity : null}
            </Typography>
          </Box>
        )}
      </CardContent>

      {!IsDefault && hasDetails && (
        <Popover
          id="mouse-over-popover"
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
                  <Typography variant="body2">{EQUIPMENT_TYPE_ENUM[item.armorType]}</Typography>
                )}
                {item.accessoryType && (
                  <Typography variant="body2">
                    {ACCESSORY_TYPES_ENUM[item.accessoryType]}
                  </Typography>
                )}

                <Typography
                  variant="body2"
                  sx={{ opacity: 0.8 }}
                  color={theme.palette.raritiesColors[item.rarity]}
                >
                  <strong> {RARITIES_ENUM[item.rarity]}</strong>
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                <strong>Tipo:</strong> {ITEM_CATEGORY_ENUM[item.category]}
              </Typography>
              <Divider />
              {(item.category === 'accessory' ||
                item.category === 'pet' ||
                item.category === 'equipment') && (
                <>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    <strong>Ataque:</strong> {item.stats.attack}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    <strong>Defesa:</strong> {item.stats.defense}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    <strong>HP:</strong> {item.stats.hp}
                  </Typography>
                </>
              )}
              <Divider />
            </Box>

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

            {item.description && (
              <Card
                elevation={0}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  p: 1,
                  mt: 1
                }}
              >
                <Typography variant="body2" sx={{ marginBottom: '12px', opacity: 0.8 }}>
                  {item.description}
                </Typography>
              </Card>
            )}
          </Box>
        </Popover>
      )}

      <Menu
        open={contextMenuOpen}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={{
          top: contextMenuPosition.y,
          left: contextMenuPosition.x
        }}
        PaperProps={{
          sx: {
            backgroundColor: '#2a2a40',
            borderRadius: '8px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)'
          }
        }}
      >
        {hasChangeQuantity && (
          <Container
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            <IconButton size="small" onClick={() => onChangeQuantity?.(item, -1)}>
              <Remove fontSize="small" />
            </IconButton>

            <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>

            <IconButton size="small" onClick={() => onChangeQuantity?.(item, 1)}>
              <Add fontSize="small" />
            </IconButton>
          </Container>
        )}

        {hasMoveItem && (
          <MenuItem onClick={() => onMoveItem?.(item)}>
            <IconButton size="small">
              <Inventory fontSize="small" />
            </IconButton>{' '}
            {onMoveTitle}
          </MenuItem>
        )}

        {hasOnUnequip && (item.category === 'accessory' || item.category === 'equipment') && (
          <MenuItem
            onClick={() => {
              item.equipped ? onUnequip?.(item) : onEquip?.(item);
            }}
          >
            <IconButton size="small">
              <CheckCircle fontSize="small" />
            </IconButton>{' '}
            {item.equipped ? 'Desequipar' : 'Equipar '}
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default ItemBox;
