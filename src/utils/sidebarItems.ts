import { NAVIGATION, NavigationCustom } from '../App';
import { firebaseAuth } from '../firebase/firebaseConfig';

// Função para obter a navegação filtrada com base na role do usuário
export const getFilteredNavigationForUser =
    async (): Promise<NavigationCustom> => {
        try {
            const user = firebaseAuth.currentUser;

            if (user) {
                const idTokenResult = await user.getIdTokenResult();

                // Verificando se o usuário é admin
                if (idTokenResult.claims.admin) {
                   /*  console.log('Usuário é admin'); */
                    return NAVIGATION; // Retorna a navegação com todos os itens, incluindo os de admin
                } else {
                    /* console.log('Usuário regular'); */
                    return NAVIGATION.filter(item => item.role !== 'admin'); // Filtra a navegação para não incluir itens de admin
                }
            } else {
                /* console.log('Usuário não autenticado'); */
                return NAVIGATION.filter(item => item.role !== 'admin'); // Retorna a navegação sem itens de admin se o usuário não estiver autenticado
            }
        } catch (error) {
            /* console.log('Erro ao verificar o papel do usuário:', error); */
            return NAVIGATION; // Retorna a navegação padrão em caso de erro
        }
    };
