'use client';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { CharCard } from '../../components';
import { getCharacter } from '../../service/requests/gameChar';
import { useSession } from '../../SessionContext';

// Interface para os dados dos personagens
interface Character {
    name: string;
    level: number;
    classes: { img: string; className: string }[];
}

function MyChars() {
    const [chars, setChars] = useState<Character[]>([]); // Definindo o tipo de chars como um array de Character
    const { session, setLoading } = useSession();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getCharacter(); // Usa a função getCharacter
                // Verifica se a resposta contém a chave 'results' e se é um array
                if (Array.isArray(response.results)) {
                    setChars(response.results); // Armazena os dados recebidos
                } else {
                    console.error('Resposta inesperada:', response);
                }
            } catch (err) {
                console.error('Erro na requisição:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData(); // Chama a função para fazer a requisição
    }, []); // Colocando setLoading na lista de dependências para evitar loops

    return (
        <>
            {/* Você pode exibir seus personagens ou outros componentes aqui */}
            {chars.length > 0 ? (
                <CharCard chars={chars} />
            ) : (
                <div>Sem personagens para exibir.</div>
            )}
        </>
    );
}

export default MyChars;
