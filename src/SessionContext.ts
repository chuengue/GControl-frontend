import * as React from 'react';

export interface Session {
    user: {
        name?: string;
        email?: string;
        image?: string;
        displayName?: string;
        uid: string;
        role: string;
        nickname: string;
    };
}

interface SessionContextType {
    session: Session | null;
    setSession: (session: Session) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

const SessionContext = React.createContext<SessionContextType>({
    session: null,
    setSession: () => {},
    loading: true,
    setLoading: () => {} // Função padrão vazia para evitar erros
});
export default SessionContext;

export const useSession = () => React.useContext(SessionContext);
