import React, { useState, useCallback, useEffect } from 'react';
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { View, Text, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

import { images } from "@/constants/images";
import Loader from "@/components/loader";
import { useGlobalContext } from "@/context/GlobalProvider";

const Welcome: React.FC = () => {
    const { loading, isLogged, storeSolanaAddress, storeApiKey, setIsLogged } = useGlobalContext();
    const [solanaAddress, setSolanaAddress] = useState<string>('');
    const [apiKey, setApiKey] = useState<string>('');
    const [showApiKey, setShowApiKey] = useState<boolean>(false);

    useEffect(() => {
        if (isLogged) {
            router.replace('/home');
        }
    }, [isLogged]);

    const handleGetStarted = useCallback(async () => {
        if (!solanaAddress.trim() || !apiKey.trim()) {
            Alert.alert("Error", "Please enter both Solana Address and API Key");
            return;
        }

        try {
            await storeSolanaAddress(solanaAddress);
            await storeApiKey(apiKey);
            setIsLogged(true);

        } catch (error) {
            //console.error('Error saving user data:', error);
            Alert.alert("Error", "Failed to save user data. Please try again.");
        }
    }, [solanaAddress, apiKey, storeSolanaAddress, storeApiKey, setIsLogged]);

    if (loading) return <Loader isLoading={loading} />;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-neutral-900"
        >
            <StatusBar style="light"/>

            <View className="flex-1 items-center justify-center p-5">
                <Image source={images.cat} className="w-96 h-96 mb-2"/>
                <Text className="text-3xl text-gray-200 font-bold mb-5">Meow!</Text>
            </View>

            <View className="p-4 mb-8">
                <Text className="text-neutral-300 text-xl font-bold mb-4">Set up your account</Text>

                <View className="mb-4">
                    <Text className="text-neutral-300 text-base font-bold mb-1">Solana Address</Text>
                    <View className="flex flex-row items-center rounded bg-neutral-800 px-4 py-2">
                        <FontAwesome5 name="wallet" size={16} color="#B1B1B1"/>
                        <TextInput
                            placeholder='Solana Address'
                            placeholderTextColor='#B1B1B1'
                            className="text-neutral-300 text-sm ml-2 flex-1"
                            value={solanaAddress}
                            onChangeText={setSolanaAddress}
                        />
                    </View>
                </View>

                <View className="mb-6">
                    <Text className="text-neutral-300 text-base font-bold mb-1">API Key</Text>
                    <View className="flex flex-row items-center rounded bg-neutral-800 px-4 py-2">
                        <FontAwesome5 name="key" size={16} color="#B1B1B1"/>
                        <TextInput
                            placeholder='API Key'
                            placeholderTextColor='#B1B1B1'
                            className="text-neutral-300 text-sm mx-2 flex-1"
                            value={apiKey}
                            onChangeText={setApiKey}
                            secureTextEntry={!showApiKey}
                        />
                        <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)}>
                            <FontAwesome5 name={showApiKey ? 'eye-slash' : 'eye'} size={16} color="#B1B1B1"/>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    className="bg-orange-900 p-3 rounded-lg"
                    onPress={handleGetStarted}
                >
                    <Text className="text-neutral-300 text-base font-bold text-center">Get Started</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default Welcome;