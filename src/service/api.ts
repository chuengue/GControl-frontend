import axios from 'axios';

import { getAuth } from 'firebase/auth';

const baseURL = import.meta.env.VITE_API_URL
const api = axios.create({
    baseURL: baseURL
});
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
