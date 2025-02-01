import { create } from 'zustand';
import { UserCharacter } from '../interfaces/char';
import { getMyCharacters } from '../service/requests/gameChar';

interface CharStore {
    chars: UserCharacter[];
    loading: boolean;
    fetchData: (uid: string) => Promise<void>;
    setChars: (chars: UserCharacter[]) => void;
    setLoading: (loading: boolean) => void;
}

const useCharStore = create<CharStore>(set => ({
    chars: [],
    loading: false,

    fetchData: async (uid: string) => {
        if (!uid) return;
        set({ loading: true });

        try {
            const response = await getMyCharacters(uid);
            if (Array.isArray(response.results)) {
                console.log(response.results);
                set({ chars: response.results }); // Atualiza os personagens na store
            } else {
                console.error('Resposta inesperada:', response);
            }
        } catch (err) {
            console.error('Erro na requisição:', err);
        } finally {
            set({ loading: false });
        }
    },

    setChars: (chars: UserCharacter[]) => set({ chars }),
    setLoading: (loading: boolean) => set({ loading })
}));

export default useCharStore;
