import { createUserWithEmailAndPassword, getAuth, updateProfile } from 'firebase/auth';
const auth = getAuth()

export const registerUser = async (
    displayName: string,
    email: string,
    password: string
) => {
    console.log({email})
    if (!email || !password) {
        throw new Error('Email and password must be provided');
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        // Atualiza o perfil do usuário com o displayName e photoURL
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, {
                displayName: displayName,
                photoURL: auth.currentUser.photoURL,
            });
            console.log('Profile updated successfully');
        }


        return userCredential;
    } catch (error) {
        console.error('Error during user registration:', error);
        throw error; // Lança o erro para ser tratado pelo chamador
    }
};
