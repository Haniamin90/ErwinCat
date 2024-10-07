import React, {useState, useEffect, useCallback} from 'react';
import {
    View,
    Text,
    ScrollView,
    Alert,
    ActivityIndicator,
    RefreshControl,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {FontAwesome5} from '@expo/vector-icons';
import axios from 'axios';
import {useGlobalContext} from "@/context/GlobalProvider";

interface WalletStats {
    guess_count: number;
    open_count: number;
    burn_count: number;
    contribution_count: number;
    tokens_earned: number;
}

interface BoxDetail {
    box_id: string;
    state_str: string;
    is_burned: boolean;
    opener_wallet: string;
    rewards: number;
    guesses: number;
    spawned_at: string;
    opened_at: string;
}

interface BoxesResponse {
    total: number;
    boxes: BoxDetail[];
}

const PAGE_SIZE = 10;

export default function WalletStats() {
    const {user} = useGlobalContext();
    const [stats, setStats] = useState<WalletStats | null>(null);
    const [boxes, setBoxes] = useState<BoxDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [offset, setOffset] = useState(0);
    const [totalBoxes, setTotalBoxes] = useState(0);

    const fetchWalletStats = useCallback(async () => {
        if (!user?.solanaAddress) {
            Alert.alert('Error', 'No Solana address found. Please check your settings.');
            setLoading(false);
            return;
        }

        try {
            const statsResponse = await axios.get(`https://ewnscan.hexato.io/wallet/${user.solanaAddress}`);
            setStats(statsResponse.data);
            setTotalBoxes(statsResponse.data.contribution_count);

            await fetchBoxes(0);
        } catch (error) {
            //console.error('Error fetching wallet data:', error);
            Alert.alert('Error', 'Failed to fetch wallet data. Please try again later.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.solanaAddress]);

    const fetchBoxes = async (newOffset: number) => {
        try {
            const boxesResponse = await axios.get<BoxesResponse>(
                `https://ewnscan.hexato.io/wallet/${user?.solanaAddress}/boxes?limit=${PAGE_SIZE}&offset=${newOffset}&is_opener=false&exclude_burned=false`
            );
            setBoxes(boxesResponse.data.boxes);
            setOffset(newOffset);
        } catch (error) {
            //console.error('Error fetching boxes:', error);
            Alert.alert('Error', 'Failed to fetch boxes. Please try again later.');
        }
    };

    useEffect(() => {
        fetchWalletStats();
        const interval = setInterval(fetchWalletStats, 900000); // 15 minutes
        return () => clearInterval(interval);
    }, [fetchWalletStats]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchWalletStats();
    };

    const StatItem = ({label, value, icon}: { label: string; value: number; icon: string }) => (
        <View className="bg-neutral-800 rounded-lg p-4 mb-4">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <FontAwesome5 name={icon} size={24} color="#FFA500" className="mr-4"/>
                    <Text className="text-lg font-semibold text-neutral-300">{label}</Text>
                </View>
                <Text className="text-2xl font-bold text-orange-500">{value.toLocaleString()}</Text>
            </View>
        </View>
    );

    const BoxItem = ({item}: { item: BoxDetail }) => (
        <View className="flex-row py-2 border-b border-neutral-700">
            <Text className="flex-1 text-neutral-300 text-center">{item.box_id.slice(0, 8)}</Text>
            <Text className="flex-1 text-neutral-300 text-center">
                {item.is_burned ?
                    <FontAwesome5 name="fire" size={16} color="#EF4444"/> :
                    <FontAwesome5 name="money-bill-wave" size={16} color="#22C55E"/>
                }
            </Text>
            <Text className="flex-1 text-neutral-300 text-center">{item.rewards.toFixed(4)}</Text>
            <Text className="flex-1 text-neutral-300 text-center">{item.guesses}</Text>
        </View>
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
                <Text className="text-2xl font-bold text-orange-500 mb-1">Wallet Stats</Text>
                <Text className="text-neutral-300 text-base mb-6">{user?.solanaAddress}</Text>
                {stats && (
                    <View>
                        <StatItem label="Guesses" value={stats.guess_count} icon="dice"/>
                        <StatItem label="Openings" value={stats.open_count} icon="box-open"/>
                        <StatItem label="Burns" value={stats.burn_count} icon="fire"/>
                        <StatItem label="Contributions" value={stats.contribution_count} icon="hands-helping"/>
                        <StatItem label="Tokens Earned" value={stats.tokens_earned} icon="coins"/>
                    </View>
                )}

                <Text className="text-2xl font-bold text-orange-500 mt-8 mb-4">Wallet Boxes ({totalBoxes})</Text>
                <View className="bg-neutral-800 rounded-lg p-4 mb-20">
                    <View className="flex-row py-2 border-b border-neutral-600">
                        <Text className="flex-1 font-bold text-orange-500 text-center">Box ID</Text>
                        <Text className="flex-1 font-bold text-orange-500 text-center">State</Text>
                        <Text className="flex-1 font-bold text-orange-500 text-center">Rewards</Text>
                        <Text className="flex-1 font-bold text-orange-500 text-center">Guesses</Text>
                    </View>
                    <FlatList
                        data={boxes}
                        renderItem={BoxItem}
                        keyExtractor={item => item.box_id}
                        scrollEnabled={false}
                    />
                </View>
            </ScrollView>
            <View
                className="flex-row justify-between p-4 bg-neutral-900 border-t border-neutral-700 absolute bottom-0 left-0 right-0">
                <TouchableOpacity
                    className={`bg-orange-700 py-2 px-4 rounded ${offset === 0 ? 'opacity-50' : ''}`}
                    onPress={() => offset > 0 && fetchBoxes(offset - PAGE_SIZE)}
                    disabled={offset === 0}
                >
                    <Text className="text-white font-bold">Previous</Text>
                </TouchableOpacity>
                <Text className="text-neutral-300 self-center">
                    {offset + 1}-{Math.min(offset + PAGE_SIZE, totalBoxes)} of {totalBoxes}
                </Text>
                <TouchableOpacity
                    className={`bg-orange-700 py-2 px-4 rounded ${offset + PAGE_SIZE >= totalBoxes ? 'opacity-50' : ''}`}
                    onPress={() => offset + PAGE_SIZE < totalBoxes && fetchBoxes(offset + PAGE_SIZE)}
                    disabled={offset + PAGE_SIZE >= totalBoxes}
                >
                    <Text className="text-white font-bold">Next</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>

    );
}