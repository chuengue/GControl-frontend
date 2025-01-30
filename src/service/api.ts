import axios from 'axios';

import { getAuth } from 'firebase/auth';

const api = axios.create({
    baseURL: 'http://localhost:3333/api' // Substitua pela sua API
});

// Adiciona o token a cada requisição
api.interceptors.request.use(
    async config => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const token = await user.getIdToken(); // Obtém o access_token do Firebase
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default api;
