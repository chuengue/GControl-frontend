import { doc, getFirestore, setDoc } from 'firebase/firestore';

import { createUserWithEmailAndPassword, getAuth, updateProfile } from 'firebase/auth';

const auth = getAuth();
const db = getFirestore();

export const registerUser = async (
    displayName: string,
    email: string,
    password: string,
    nickNameGC: string
) => {
    if (!email || !password) {
        throw new Error('Email and password must be provided');
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
            nickNameGC: nickNameGC,
            createdAt: new Date(),
            role: 'user'
        });
        if (auth.currentUser) {
            await updateProfile(user, {
                displayName: displayName,
                photoURL: user.photoURL
            });

        }

        return userCredential;
    } catch (error) {
        console.error('Error during user registration:', error);
        throw error; // Lança o erro para ser tratado pelo chamador
    }
};
