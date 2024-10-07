import React, {createContext, useContext, useEffect, useState} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    solanaAddress: string | null;
    apiKey: string | null;
}

interface GlobalContextType {
    isLogged: boolean;
    setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    loading: boolean;
    storeSolanaAddress: (solanaAddress: string) => Promise<void>;
    storeApiKey: (apiKey: string) => Promise<void>;
    clearUserData: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobalContext must be used within a GlobalProvider');
    }
    return context;
};

const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [isLogged, setIsLogged] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeUser = async () => {
            try {
                const solanaAddress = await AsyncStorage.getItem('solanaAddress');
                const apiKey = await AsyncStorage.getItem('apiKey');

                if (solanaAddress && apiKey) {
                    setIsLogged(true);
                    setUser({solanaAddress, apiKey});
                } else {
                    setIsLogged(false);
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to initialize user:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeUser();
    }, []);

    const storeSolanaAddress = async (solanaAddress: string) => {
        try {
            await AsyncStorage.setItem('solanaAddress', solanaAddress.trim());
            setUser((prevUser) => ({
                ...prevUser,
                solanaAddress: solanaAddress.trim(),
            } as User));
            console.log('Saved Solana address');
        } catch (e) {
            console.error('Failed to save Solana address:', e);
        }
    };

    const storeApiKey = async (apiKey: string) => {
        try {
            await AsyncStorage.setItem('apiKey', apiKey);
            setUser((prevUser) => ({
                ...prevUser,
                apiKey,
            } as User));
            console.log('Saved API key');
        } catch (e) {
            console.error('Failed to save API key:', e);
        }
    };

    const clearUserData = async () => {
        try {
            await AsyncStorage.removeItem('solanaAddress');
            await AsyncStorage.removeItem('apiKey');
            setIsLogged(false);
            setUser(null);
            console.log('Cleared user data');
        } catch (e) {
            console.error('Failed to clear user data:', e);
        }
    };

    return (
        <GlobalContext.Provider
            value={{
                isLogged,
                setIsLogged,
                user,
                setUser,
                loading,
                storeSolanaAddress,
                storeApiKey,
                clearUserData,
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export default GlobalProvider;