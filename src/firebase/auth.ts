import {
    browserSessionPersistence,
    GithubAuthProvider,
    GoogleAuthProvider,
    setPersistence,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut
} from 'firebase/auth';

import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { firebaseAuth } from './firebaseConfig';

const db = getFirestore();
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Função para buscar dados adicionais no Firestore
export const fetchUserData = async (uid: string) => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            window.sessionStorage.setItem(
                'userAdditionalData',
                JSON.stringify(userDoc)
            );
            return userDoc.data();
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
};

// Autenticação com Google
export const signInWithGoogle = async () => {
    try {
        return setPersistence(firebaseAuth, browserSessionPersistence).then(
            async () => {
                const result = await signInWithPopup(
                    firebaseAuth,
                    googleProvider
                );
                const additionalData = await fetchUserData(result.user.uid);
                if (!additionalData) {
                }

                return {
                    success: true,
                    user: result.user,
                    additionalData, // Retorna os dados do Firestore
                    error: null
                };
            }
        );
    } catch (error: any) {
        return {
            success: false,
            user: null,
            additionalData: null,
            error: error.message
        };
    }
};

// Autenticação com GitHub
export const signInWithGithub = async () => {
    try {
        return setPersistence(firebaseAuth, browserSessionPersistence).then(
            async () => {
                const result = await signInWithPopup(
                    firebaseAuth,
                    githubProvider
                );
                const additionalData = await fetchUserData(result.user.uid);

                return {
                    success: true,
                    user: result.user,
                    additionalData,
                    error: null
                };
            }
        );
    } catch (error: any) {
        return {
            success: false,
            user: null,
            additionalData: null,
            error: error.message
        };
    }
};

// Autenticação com email e senha
export async function signInWithCredentials(email: string, password: string) {
    try {
        return setPersistence(firebaseAuth, browserSessionPersistence).then(
            async () => {
                const userCredential = await signInWithEmailAndPassword(
                    firebaseAuth,
                    email,
                    password
                );
                const additionalData = await fetchUserData(
                    userCredential.user.uid
                );
                return {
                    success: true,
                    user: userCredential.user,
                    additionalData,
                    error: null
                };
            }
        );
    } catch (error: any) {
        return {
            success: false,
            user: null,
            additionalData: null,
            error: error.message || 'Failed to sign in with email/password'
        };
    }
}

// Logout
export const firebaseSignOut = async () => {
    try {
        await signOut(firebaseAuth);
        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
};

// Observador de autenticação
export const onAuthStateChanged = (callback: (user: any) => void) => {
    return firebaseAuth.onAuthStateChanged(callback);
};
