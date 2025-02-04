import { create } from 'zustand';
import { Character, UserCharacter } from '../interfaces/char';
import {
    getAllCharacters,
    getMyCharacters
} from '../service/requests/gameChar';

interface CharStore {
    allChars: Character[];
    userChars: UserCharacter[];
    loading: boolean;
    fetchUserCharsData: (uid: string) => Promise<void>;
    fetchAllCharsData: () => Promise<void>;
    setUserChars: (chars: UserCharacter[]) => void;
    setAllChars: (chars: Character[]) => void;
    setLoading: (loading: boolean) => void;
}

const useCharStore = create<CharStore>(set => ({
    userChars: [],
    allChars: [],
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
    setAllChars: (allChars: Character[]) => set({ allChars }),
    setLoading: (loading: boolean) => set({ loading })
}));

export default useCharStore;
