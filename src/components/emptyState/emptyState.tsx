import { Box, Button, Typography, alpha, useTheme } from '@mui/material';
import { blue } from '@mui/material/colors';
import React from 'react';
import { useNavigate } from 'react-router';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionRoute?: string;
  imagePath?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  actionRoute,
  imagePath = '/assets/images/empty_state.svg'
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
        minHeight: '400px',
        bgcolor: alpha(blue[900], 0.4),
        borderRadius: '20px',
        border: `1px solid ${alpha(blue[400], 0.1)}`,
        backdropFilter: 'blur(8px)'
      }}
    >
      <img
        src={imagePath}
        alt="Empty state illustration"
        style={{
          width: '200px',
          height: '200px',
          marginBottom: '24px',
          opacity: 0.9
        }}
      />

      <Typography
        variant="h5"
        sx={{
          color: 'white',
          fontWeight: 400,
          mb: 1,
          fontFamily: 'faktos'
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: alpha('#fff', 0.7),
          maxWidth: '400px',
          mb: 3
        }}
      >
        {description}
      </Typography>

      {actionLabel && actionRoute && (
        <Button
          variant="contained"
          onClick={() => navigate(actionRoute)}
          sx={{
            bgcolor: alpha(blue[400], 0.2),
            border: `1px solid ${alpha(blue[400], 0.3)}`,
            color: 'white',
            px: 4,
            py: 1.5,
            borderRadius: '12px',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: alpha(blue[400], 0.3),
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 12px ${alpha(blue[400], 0.2)}`
            }
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState; 