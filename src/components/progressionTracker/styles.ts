import { Box, keyframes, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

// Gradient animations
export const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Level progress bar with gradient
export const LevelProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[800],
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(45deg, #CD7F32 30%, #C0C0C0 50%, #FFD700 100%)',
    backgroundSize: '200% 200%',
    animation: `${gradientAnimation} 3s ease infinite`,
  },
}));

// ATK progress bar with neon glow
export const AtkProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[800],
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(90deg, #00ff87 0%, #60efff 100%)',
    boxShadow: '0 0 10px rgba(0, 255, 135, 0.5)',
  },
}));

// Stats card with glass effect
export const StatsCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
}));

// Circular progress indicator
export const CircularProgressContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '120px',
  height: '120px',
}));

// Character card with hover effect
export const CharacterProgressCard = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(145deg, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0.05))',
  borderRadius: '16px',
  padding: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(25, 118, 210, 0.2)',
  },
})); 