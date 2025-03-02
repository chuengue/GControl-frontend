import { alpha, SxProps, Theme } from '@mui/material';
import theme from '../../../../../theme';

export const styles = {
  tableContainer: {
    borderRadius: '16px',
    bgcolor: alpha(theme.palette.grey[900], 0.7),
    overflow: 'auto',
    maxWidth: '100%',
    height: 'calc(100vh - 280px)',
    backdropFilter: 'blur(10px)',
    '&::-webkit-scrollbar': {
      height: '6px',
      width: '6px'
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: alpha(theme.palette.grey[900], 0.5),
      borderRadius: '3px'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: alpha(theme.palette.grey[700], 0.5),
      borderRadius: '3px',
      '&:hover': {
        backgroundColor: alpha(theme.palette.grey[600], 0.6)
      }
    },
    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
    border: `1px solid ${alpha(theme.palette.grey[800], 0.3)}`
  } as SxProps<Theme>,

  tableHead: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    bgcolor: alpha(theme.palette.grey[900], 0.7),
    backdropFilter: 'blur(10px)',
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '2px',
      background: `linear-gradient(90deg, 
        ${alpha(theme.palette.primary.main, 0.3)}, 
        ${alpha(theme.palette.primary.light, 0.3)})`
    }
  } as SxProps<Theme>,

  stickyCell: {
    position: 'sticky',
    left: 0,
    zIndex: 3,
    bgcolor: alpha(theme.palette.grey[900], 0.95),
    backdropFilter: 'blur(10px)',
    padding: '12px',
    color: theme.palette.grey[300],
    borderBottom: 'none',
    '&::after': {
      content: '""',
      position: 'absolute',
      right: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      width: '1px',
      height: '70%',
      background: `linear-gradient(180deg, 
        transparent,
        ${alpha(theme.palette.grey[500], 0.2)},
        transparent)`
    }
  } as SxProps<Theme>,

  headerCell: {
    minWidth: '90px',
    position: 'sticky',
    top: 0,
    bgcolor: alpha(theme.palette.grey[900], 0.95),
    backdropFilter: 'blur(10px)',
    zIndex: 2,
    padding: '8px 4px',
    borderBottom: 'none'
  } as SxProps<Theme>,

  scrollButton: (direction: 'left' | 'right'): SxProps<Theme> => ({
    position: 'absolute',
    [direction]: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 4,
    backgroundColor: alpha(theme.palette.grey[900], 0.9),
    width: 40,
    height: 40,
    borderRadius: '50%',
    '&:hover': {
      backgroundColor: alpha(theme.palette.grey[800], 0.95),
      transform: 'translateY(-50%) scale(1.1)'
    },
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    border: `1px solid ${alpha(theme.palette.grey[700], 0.3)}`,
    color: theme.palette.grey[300],
    '&:active': {
      transform: 'translateY(-50%) scale(0.95)'
    }
  }),

  sortableRow: {
    '&:hover': {
      bgcolor: alpha(theme.palette.grey[800], 0.3)
    },
    transition: 'background-color 0.2s ease'
  } as SxProps<Theme>,

  characterCell: {
    position: 'sticky',
    left: 0,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    padding: '8px 12px',
    cursor: 'grab',
    borderBottom: `1px solid ${alpha(theme.palette.grey[700], 0.2)}`,
    bgcolor: alpha(theme.palette.grey[900], 0.95),
    backdropFilter: 'blur(10px)',
    '&:hover': {
      bgcolor: alpha(theme.palette.grey[800], 0.95)
    },
    borderRight: `1px solid ${alpha(theme.palette.grey[700], 0.2)}`,
    '&::after': {
      content: '""',
      position: 'absolute',
      right: -1,
      top: 0,
      height: '100%',
      width: '1px',
      background: `linear-gradient(180deg, 
        transparent,
        ${alpha(theme.palette.primary.main, 0.1)} 30%,
        ${alpha(theme.palette.primary.main, 0.1)} 70%,
        transparent
      )`
    }
  } as SxProps<Theme>,

  downloadButton: {
    bgcolor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    '&:hover': {
      bgcolor: alpha(theme.palette.primary.main, 0.2)
    },
    transition: 'all 0.2s ease',
    borderRadius: '12px',
    padding: '8px 16px',
    gap: 1
  } as SxProps<Theme>
}; 