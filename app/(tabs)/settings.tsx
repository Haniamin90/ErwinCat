import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {FontAwesome5} from '@expo/vector-icons';
import {useGlobalContext} from "@/context/GlobalProvider";
import {router} from "expo-router";

const Settings: React.FC = () => {
    const {user, storeSolanaAddress, storeApiKey, clearUserData, setIsLogged, setUser} = useGlobalContext();
    const [solanaAddress, setSolanaAddress] = useState(user?.solanaAddress || '');
    const [apiKey, setApiKey] = useState(user?.apiKey || '');
    const [showApiKey, setShowApiKey] = useState(false);

    useEffect(() => {
        if (user) {
            setSolanaAddress(user.solanaAddress || '');
            setApiKey(user.apiKey || '');
        }
    }, [user]);

    const saveSettings = async () => {
        try {
            await storeSolanaAddress(solanaAddress);
            await storeApiKey(apiKey);
            Alert.alert('Success', 'Settings saved successfully');
        } catch (error) {
            //console.error('Error saving settings:', error);
            Alert.alert('Error', 'Failed to save settings');
        }
    };

    const handleClearData = () => {
        Alert.alert(
            "Clear Account Data",
            "Are you sure you want to clear all your account data? This action cannot be undone.",
            [
                {text: "Cancel", style: "cancel"},
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                        await clearUserData();
                        setSolanaAddress('');
                        setApiKey('');
                        setIsLogged(false);
                        setUser(null);
                        Alert.alert("Success", "Account data has been cleared", [
                            {
                                text: "OK",
                                onPress: () => {
                                    router.replace('/');
                                }
                            }
                        ]);
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#171717'}}>
            <StatusBar style="light"/>
            <ScrollView contentContainerStyle={{padding: 16}}>
                <Text className="text-neutral-200 text-2xl font-bold mb-6">Settings</Text>

                <View className="mb-4">
                    <Text className="text-neutral-300 text-lg mb-2">Solana Address</Text>
                    <TextInput
                        value={solanaAddress}
                        onChangeText={setSolanaAddress}
                        className="bg-neutral-800 py-2 px-4 rounded text-neutral-300"
                        placeholderTextColor="#666"
                        placeholder="Enter your Solana address"
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-neutral-300 text-lg mb-2">API Key</Text>
                    <View className="relative">
                        <TextInput
                            value={apiKey}
                            onChangeText={setApiKey}
                            className="bg-neutral-800 py-2 pl-4 rounded text-neutral-300 pr-12"
                            placeholderTextColor="#666"
                            placeholder="Enter your API key"
                            secureTextEntry={!showApiKey}
                        />
                        <TouchableOpacity
                            className="absolute top-3 right-4"
                            onPress={() => setShowApiKey(!showApiKey)}
                        >
                            <FontAwesome5 name={showApiKey ? 'eye-slash' : 'eye'} size={20} color="#666"/>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={saveSettings}
                    className="bg-orange-900 p-3 rounded-lg mb-4"
                >
                    <Text className="text-white text-center font-bold">Save Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleClearData}
                    className="bg-red-900 p-3 rounded-lg"
                >
                    <Text className="text-white text-center font-bold">Clear Account Data</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Settings;