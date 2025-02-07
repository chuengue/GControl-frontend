import { create } from 'zustand';
import { Character, UserCharacter } from '../interfaces/char';
import {
    getAllCharacters,
    getMyCharacters
} from '../service/requests/gameChar';
import { IUserGameCharStats } from './../service/requests/types';

interface CharStore {
    allChars: Character[];
    userChars: UserCharacter[];
    loading: boolean;
    charStats: IUserGameCharStats;
    attackTotal: number;
    setAttackTotal: (attackTotal: number) => void;
    SetCharStats: (stats: IUserGameCharStats) => void;
    fetchUserCharsData: (uid: string) => Promise<void>;
    fetchAllCharsData: () => Promise<void>;
    setUserChars: (chars: UserCharacter[]) => void;
    setAllChars: (chars: Character[]) => void;
    setLoading: (loading: boolean) => void;
}

const useCharStore = create<CharStore>(set => ({
    userChars: [],
    allChars: [],
    attackTotal: 0,
    charStats: {
        attack: 0,
        defense: 0,
        hp: 0,
        specialAttack: 0,
        specialDefense: 0,
        criticalStrike: 0,
        criticalDamage: 0,
        recHP: 0,
        recMP: 0
    },
    loading: false,

    fetchUserCharsData: async (uid: string) => {
        if (!uid) return;
        set({ loading: true });

        try {
            const response = await getMyCharacters(uid);
            if (Array.isArray(response.results)) {
                console.log(response.results);
                set({ userChars: response.results }); // Atualiza os personagens na store
            } else {
                console.error('Resposta inesperada:', response);
            }
        } catch (err) {
            console.error('Erro na requisição:', err);
        } finally {
            set({ loading: false });
        }
    },
    fetchAllCharsData: async () => {
        set({ loading: true });

        try {
            const response = await getAllCharacters();
            if (Array.isArray(response.results)) {
                set({ allChars: response.results }); // Atualiza os personagens na store
            } else {
                console.error('Resposta inesperada:', response);
            }
        } catch (err) {
            console.error('Erro na requisição:', err);
        } finally {
            set({ loading: false });
        }
    },
    setUserChars: (userChars: UserCharacter[]) => set({ userChars }),
    SetCharStats: (charStats: IUserGameCharStats) => set({ charStats }),
    setAttackTotal: (attackTotal: number) => set({ attackTotal }),
    setAllChars: (allChars: Character[]) => set({ allChars }),
    setLoading: (loading: boolean) => set({ loading })
}));

export default useCharStore;
