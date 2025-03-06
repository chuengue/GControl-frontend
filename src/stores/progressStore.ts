import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CharacterGoal {
  atkGoal: number;
  levelGoal: number;
  recentImprovements: {
    levelGained: number;
    atkGained: number;
    date: string;
  };
}

interface ProgressStore {
  characterGoals: Record<string, CharacterGoal>;
  setCharacterGoal: (charId: string, goal: Partial<CharacterGoal>) => void;
  updateRecentImprovements: (charId: string, improvements: { levelGained?: number; atkGained?: number }) => void;
}

const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      characterGoals: {},
      setCharacterGoal: (charId, goal) =>
        set((state) => ({
          characterGoals: {
            ...state.characterGoals,
            [charId]: {
              ...state.characterGoals[charId],
              ...goal,
              recentImprovements: state.characterGoals[charId]?.recentImprovements || {
                levelGained: 0,
                atkGained: 0,
                date: new Date().toISOString()
              }
            }
          }
        })),
      updateRecentImprovements: (charId, improvements) =>
        set((state) => ({
          characterGoals: {
            ...state.characterGoals,
            [charId]: {
              ...state.characterGoals[charId],
              recentImprovements: {
                ...state.characterGoals[charId]?.recentImprovements,
                ...improvements,
                date: new Date().toISOString()
              }
            }
          }
        }))
    }),
    {
      name: 'character-progress-storage'
    }
  )
);

export default useProgressStore; 