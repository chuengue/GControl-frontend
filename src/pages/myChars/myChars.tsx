'use client';
import { Box, Container } from '@mui/material';
import Grid from '@mui/material/Grid2';
import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CharCard } from '../../components';
import { useSession } from '../../SessionContext';
import useCharStore from '../../stores/charStore';

// Interface para os dados dos personagens
interface Character {
  name: string;
  level: number;
  classes: { img: string; className: string }[];
}

function MyChars() {
  const { session, setLoading } = useSession();
  const { userChars, fetchUserCharsData } = useCharStore();
  const navigate = useNavigate();
  const uid = session?.user.uid || '';
  useEffect(() => {
    fetchUserCharsData(uid);
  }, []);

  function onAddCharacter() {
    navigate('/chars/add-user-char');
  }
  return (
    <Box width="100%" maxHeight="90vh" sx={{
      overflowY: "auto",
      paddingBottom: {lg:"40px",xl:"0px"}

    }}>

    <Container >
      <Grid container spacing={2}>
        <CharCard chars={userChars} onAddCharacter={onAddCharacter} details />
      </Grid>
    </Container>
    </Box>
  );
}

export default MyChars;
