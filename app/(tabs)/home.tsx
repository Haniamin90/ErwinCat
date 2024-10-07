import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, Image, Platform, ScrollView, Text, TouchableOpacity, View,} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import axios from 'axios';
import {FontAwesome5} from "@expo/vector-icons";
import {useGlobalContext} from "@/context/GlobalProvider";
import {images} from "@/constants/images";

import * as Crypto from 'expo-crypto';
import {ethers} from "ethers";

const API_URL = 'https://api.erwin.lol';
const BOX_API_URL = 'https://ewnscan.hexato.io/box/latest';

interface BoxInfo {
    box_id: string;
    state: boolean;
    state_str: string;
    spawned_at: string;
}


const generateMnemonic = async () => {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    const Mnemonic = ethers.Mnemonic.fromEntropy(randomBytes);
    return Mnemonic.phrase;
};


export default function Home() {
    const {user} = useGlobalContext();
    const [isGuessing, setIsGuessing] = useState(false);
    const isGuessingRef = useRef(false);
    const [logs, setLogs] = useState<string[]>([]);
    const scrollViewRef = useRef<ScrollView>(null);
    const [boxInfo, setBoxInfo] = useState<BoxInfo | null>(null);
    const [timeElapsed, setTimeElapsed] = useState('');

    const fetchLatestBoxInfo = useCallback(async () => {
        try {
            const response = await axios.get(BOX_API_URL);
            setBoxInfo(response.data);
        } catch (error) {
            //console.error('Error fetching box info:', error);
        }
    }, []);

    useEffect(() => {
        fetchLatestBoxInfo();
        const interval = setInterval(fetchLatestBoxInfo, 900000); // 15 minutes
        return () => clearInterval(interval);
    }, [fetchLatestBoxInfo]);

    useEffect(() => {
        if (boxInfo) {
            const timer = setInterval(() => {
                const elapsed = calculateTimeElapsed(boxInfo.spawned_at);
                setTimeElapsed(elapsed);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [boxInfo]);

    const calculateTimeElapsed = useCallback((spawnedAt: string) => {
        const now = new Date();
        const spawnedDate = new Date(spawnedAt);
        const diffInSeconds = Math.floor((now.getTime() - spawnedDate.getTime()) / 1000);
        const hours = Math.floor(diffInSeconds / 3600);
        const minutes = Math.floor((diffInSeconds % 3600) / 60);
        const seconds = diffInSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    const addLog = useCallback((message: string) => {
        setLogs(prevLogs => [...prevLogs, `${new Date().toISOString()} ${message}`]);
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({animated: true});
        }, 100);
    }, []);

    // clear logs every 1 hour
    useEffect(() => {
        const timer = setInterval(() => {
            setLogs([]);
        }, 3600000);
        return () => clearInterval(timer);
    }, []);

    const generateGuesses = useCallback(async () => {
        try {
            const passwords = await Promise.all(Array(50).fill(null).map(() => generateMnemonic()));
            addLog(`🔑️ Generated ${passwords.length} guesses`);
            // console.log(passwords);
            return passwords;
        } catch (error) {
            addLog(`⚠️ Error generating guesses ${error}`);
            setIsGuessing(false);
            isGuessingRef.current = false;
            return [];
        }
    }, [addLog]);

    const submitGuesses = useCallback(async (guesses: string[]) => {
        addLog('➡️ Submitting to oracle');
        try {
            const response = await axios.post(`${API_URL}/submit_guesses`, guesses, {
                headers: {
                    'x-api-key': user?.apiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 120000,
            });

            if (response.status === 202) {
                addLog('✅ Guesses accepted');
                return false;
            } else {
                addLog(`❌ Guesses rejected (${response.status}): ${response.data}`);
                return true;
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // console.error('Error submitting guesses:', error.message, error.response?.data);
                addLog(`⚠️ Error occurred: ${error.response?.data}`);
                if (error.response?.status === 401) {
                    setIsGuessing(false);
                    isGuessingRef.current = false;
                    return true;
                }
                return true;

            }
            // console.error('Unknown error submitting guesses:', error);
            addLog(`⚠️ Unknown error occurred`);
            return true;
        }
    }, [user?.apiKey, addLog]);

    const startGuessing = useCallback(() => {
        //console.log('Starting guessing!!!!!!!!!!');

        if (!user) {
            Alert.alert('Missing Information', 'Please set your API key and Solana address in the Settings.');
            setIsGuessing(false);
            isGuessingRef.current = false;
            return;
        }

        setIsGuessing(true);
        isGuessingRef.current = true;

        const guessLoop = async () => {
            if (!isGuessingRef.current) {
                // console.log('Guessing stopped');
                return;
            }

            let guesses = await generateGuesses();
            if (guesses.length > 0) {
                await submitGuesses(guesses);
            }

            setTimeout(() => {
                guessLoop();
            }, 10000);
        };

        guessLoop();
    }, [user?.apiKey, user?.solanaAddress, generateGuesses, submitGuesses]);

    const toggleGuessing = useCallback(() => {
        setIsGuessing(prevState => {
            const newState = !prevState;
            isGuessingRef.current = newState;
            addLog(newState ? 'Guessing started' : 'Guessing stopped');
            if (newState) {
                startGuessing();
            }
            return newState;
        });
    }, [addLog, startGuessing]);

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#171717'}}>

            <View className="flex-1 p-4 pb-14">
                <View className="flex-row mb-2 items-center">
                    <Image
                        source={isGuessing ? images.dance_cat : images.sideeye_cat}
                        className="w-48 h-48"
                    />
                    <View className="flex-1 items-center mr-2">
                        <FontAwesome5 name="box" size={48} color="white" className="mb-2"/>
                        <Text className="text-white text-center text-xs mb-2">
                            {boxInfo?.state_str.toUpperCase() || 'LOADING'}
                        </Text>
                        <Text className="text-white text-center text-lg font-bold">
                            {timeElapsed}
                        </Text>
                    </View>
                </View>
                <View className="flex-1 bg-black rounded-lg p-2 mb-4">
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={{paddingBottom: 8}}
                        showsVerticalScrollIndicator={true}
                        showsHorizontalScrollIndicator={true}


                    >
                        <View>
                            {logs.map((log, index) => (
                                <Text
                                    key={index}
                                    className="text-green-500 mb-1 text-sm"
                                    style={{
                                        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',

                                    }}
                                >
                                    {log}
                                </Text>
                            ))}
                        </View>
                    </ScrollView>
                </View>
                <View className="flex-row justify-between">
                    <TouchableOpacity
                        onPress={toggleGuessing}
                        className={`${isGuessing ? 'bg-red-500' : 'bg-green-500'} py-3 rounded-lg flex-1 mr-2 flex-row items-center justify-center`}
                    >
                        <FontAwesome5 name={isGuessing ? 'stop' : 'play'} size={16} color="white" className="mr-2"/>
                        <Text className="text-white text-center font-bold">
                            {isGuessing ? 'Stop Guessing' : 'Start Guessing'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setLogs([])}
                        className="bg-gray-500 py-3 px-2 rounded-lg flex-1 ml-2 flex-row items-center justify-center"
                    >
                        <FontAwesome5 name="trash" size={16} color="white" className="mr-2"/>
                        <Text className="text-white text-center font-bold">
                            Clear Logs
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};