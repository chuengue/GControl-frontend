import { Card } from '@mui/material';
import { alpha, useTheme } from '@mui/material';
import React, { ReactNode } from 'react';

interface CardCustomProps {
  children: ReactNode;
}

export const CardCustom = ({ children }: CardCustomProps) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.05)} 100%)`,
        backdropFilter: 'blur(10px)',
        p: 2,
        width: "max-content",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        paddingX: { lg: "12px", xl: "24px" },
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.2)}`
        }
      }}
    >
      {children}
    </Card>
  );
}