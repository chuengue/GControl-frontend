import { Card } from '@mui/material';
import { blue } from '@mui/material/colors';
import React, { ReactNode } from 'react';

interface CardCustomProps {
  children: ReactNode;
}

export const CardCustom = ({ children }: CardCustomProps) => {
  return (
    <Card
      sx={{
        bgcolor: blue[600],
        p: 1,
        width:"max-content",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        paddingX: "24px",
      }}
    >
      {children}
    </Card>
  );
}