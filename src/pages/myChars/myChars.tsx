'use client';
import { Container } from '@mui/material';
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
        <Container>
            <Grid container spacing={2}>
                {userChars.length > 0 ? (
                    <CharCard
                        chars={userChars}
                        onAddCharacter={onAddCharacter}
                        details
                    />
                ) : (
                    <div>Sem personagens para exibir.</div>
                )}
            </Grid>
        </Container>
    );
}

export default MyChars;
