import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';

import { firebaseAuth } from './firebase/firebaseConfig';

// A importação de firebaseAuth para pegar o usuário

interface PrivateRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean; // Se for necessário ser admin para acessar a rota
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, adminOnly }) => {
    const [loading, setLoading] = useState(true); // Para controlar o carregamento enquanto verificamos a autenticação
    const [isAdmin, setIsAdmin] = useState(false); // Para armazenar se o usuário é admin
    const location = useLocation();

    useEffect(() => {
        const checkUserRole = async () => {
            const user = firebaseAuth.currentUser;
            if (user) {
                try {
                    const idTokenResult = await user.getIdTokenResult();
                    // Verifica se o usuário é admin
                    setIsAdmin(!!idTokenResult.claims.admin);
                } catch (error) {
                    console.log('Erro ao verificar o papel do usuário:', error);
                }
            }
            setLoading(false);
        };

        checkUserRole();
    }, []);

    // Se ainda estiver carregando, não renderiza nada
    if (loading) {
        return null; // Ou um loader de carregamento, se necessário
    }

    // Verifica se a rota requer ser admin
    if (adminOnly && !isAdmin) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute;
