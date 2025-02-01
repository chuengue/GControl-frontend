'use client';
import { Container } from '@mui/material';
import Grid from '@mui/material/Grid2';
import * as React from 'react';
import { useEffect } from 'react';
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
    const { chars, setChars, fetchData } = useCharStore();
    const uid = session?.user.uid || '';
    useEffect(() => {
        fetchData(uid);
    }, []);

    return (
        <Container>
            <Grid container spacing={2}>
                {chars.length > 0 ? (
                    <CharCard chars={chars} />
                ) : (
                    <div>Sem personagens para exibir.</div>
                )}
            </Grid>
        </Container>
    );
}

export default MyChars;
