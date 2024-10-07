import React, {useState, useEffect, useCallback} from 'react';
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {FontAwesome5} from '@expo/vector-icons';
import axios from 'axios';
import {Link, useRouter} from 'expo-router';

interface BoxDetail {
    box_id: string;
    state: boolean;
    state_str: string;
    contents: number | null;
    password: string | null;
    decay_number: number | null;
    spawned_at: string;
    opened_at: string | null;
    is_burned: boolean;
    opener_wallet: string | null;
    contributor_count: number;
}

interface BoxesResponse {
    total: number;
    boxes: BoxDetail[];
}

const PAGE_SIZE = 10;

export default function RecentBoxes() {
    const router = useRouter();
    const [boxes, setBoxes] = useState<BoxDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [offset, setOffset] = useState(0);
    const [totalBoxes, setTotalBoxes] = useState(0);

    const fetchRecentBoxes = useCallback(async (newOffset: number) => {
        try {
            const response = await axios.get<BoxesResponse>(`https://ewnscan.hexato.io/box?limit=${PAGE_SIZE}&offset=${newOffset}&exclude_burned=false`);
            setBoxes(response.data.boxes);
            setTotalBoxes(response.data.total);
            setOffset(newOffset);
        } catch (error) {
            console.error('Error fetching recent boxes:', error);
            Alert.alert('Error', 'Failed to fetch recent boxes. Please try again later.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchRecentBoxes(0);
        const interval = setInterval(() => fetchRecentBoxes(0), 900000); // 15 minutes
        return () => clearInterval(interval);
    }, [fetchRecentBoxes]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRecentBoxes(0);
    };

    const handlePrevious = () => {
        if (offset > 0) {
            fetchRecentBoxes(offset - PAGE_SIZE);
        }
    };

    const handleNext = () => {
        if (offset + PAGE_SIZE < totalBoxes) {
            fetchRecentBoxes(offset + PAGE_SIZE);
        }
    };

    const BoxItem = ({box}: { box: BoxDetail }) => (


        <TouchableOpacity onPress={() => router.push(`/box/${box.box_id}`)} className="p-4 bg-neutral-800 rounded mb-4">

            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-orange-500 font-bold text-base">{box.box_id}</Text>
                <View className="flex-row items-center">
                    <FontAwesome5
                        name={box.state ? 'box-open' : 'box'}
                        size={24}
                        color="#EAB308"
                        className="mr-2"
                    />

                    {box.state ? (
                        <FontAwesome5
                            name={box.is_burned ? 'fire' : 'money-bill-wave'}
                            size={24}
                            color={box.is_burned ? '#EF4444' : '#22C55E'}
                            className="ml-2"
                        />
                    ) : (
                        <Text className="text-neutral-400 text-lg ml-2">
                            <FontAwesome5 name="question" size={24} color="#FFA500" className="mr-2"/>
                        </Text>
                    )}
                </View>
            </View>
            <View className="flex-row justify-between mb-1">
                <Text className="text-neutral-400">Spawned:</Text>
                <Text className="text-neutral-300">{new Date(box.spawned_at).toLocaleString()}</Text>
            </View>
            {box.opened_at && (
                <View className="flex-row justify-between mb-1">
                    <Text className="text-neutral-400">Opened:</Text>
                    <Text className="text-neutral-300">{new Date(box.opened_at).toLocaleString()}</Text>
                </View>
            )}
            {box.state && (
                <View className="flex-row justify-between mb-1">
                    <Text className="text-neutral-400">Contributors:</Text>
                    <Text className="text-neutral-300">{box.contributor_count}</Text>
                </View>
            )}
            {box.contents !== null && (
                <View className="flex-row justify-between mb-1">
                    <Text className="text-neutral-400">Contents:</Text>
                    <Text className="text-neutral-300">{box.contents}</Text>
                </View>
            )}
            {box.password && (
                <View className="flex-row justify-between mb-1">
                    <Text className="text-neutral-400">Password:</Text>
                    <Text className="text-neutral-300">{box.password}</Text>
                </View>
            )}

        </TouchableOpacity>


    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-neutral-900">
                <ActivityIndicator size="large" color="#FFA500"/>
            </View>
        );
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#171717'}}>
            <StatusBar style="light"/>
            <ScrollView
                className="flex-1 p-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFA500"/>
                }
            >
                <Text className="text-2xl font-bold text-orange-500 mb-6">Recent Boxes ({totalBoxes})</Text>
                {boxes.map(box => (

                    <BoxItem key={box.box_id} box={box}/>

                ))}
                <View className="h-20"/>
            </ScrollView>
            <View
                className="flex-row justify-between p-4 bg-neutral-900 border-t border-neutral-700 absolute bottom-0 left-0 right-0">
                <TouchableOpacity
                    className={`bg-orange-700 py-2 px-4 rounded ${offset === 0 ? 'opacity-50' : ''}`}
                    onPress={handlePrevious}
                    disabled={offset === 0}
                >
                    <Text className="text-white font-bold">Previous</Text>
                </TouchableOpacity>
                <Text className="text-neutral-300 self-center">
                    {offset + 1}-{Math.min(offset + PAGE_SIZE, totalBoxes)} of {totalBoxes}
                </Text>
                <TouchableOpacity
                    className={`bg-orange-700 py-2 px-4 rounded ${offset + PAGE_SIZE >= totalBoxes ? 'opacity-50' : ''}`}
                    onPress={handleNext}
                    disabled={offset + PAGE_SIZE >= totalBoxes}
                >
                    <Text className="text-white font-bold">Next</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}