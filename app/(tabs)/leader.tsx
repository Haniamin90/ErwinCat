import React, {useState, useEffect, useCallback} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Alert,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {Feather} from '@expo/vector-icons';
import axios from 'axios';

interface Contributor {
    wallet_id: string;
    guess_count: number;
    open_count: number;
    burn_count: number;
    contribution_count: number;
    tokens_earned: number;
}

interface LeaderboardResponse {
    total: number;
    contributors: Contributor[];
}

type SortBy = 'guess_count' | 'open_count' | 'burn_count' | 'contribution_count' | 'tokens_earned';
type SortOrder = 'asc' | 'desc';

const PAGE_SIZE = 20;

const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 5)}...${address.slice(-5)}`;
};

export default function LeaderBoard() {
    const [contributors, setContributors] = useState<Contributor[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sortBy, setSortBy] = useState<SortBy>('open_count');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);

    const fetchLeaderboard = useCallback(async (newOffset: number = offset) => {
        try {
            const response = await axios.get<LeaderboardResponse>('https://ewnscan.hexato.io/leaderboard', {
                params: {
                    sort_by: sortBy,
                    order: sortOrder,
                    limit: PAGE_SIZE,
                    offset: newOffset,
                },
            });
            setContributors(response.data.contributors);
            setTotal(response.data.total);
            setOffset(newOffset);
        } catch (error) {
            //console.error('Error fetching leaderboard:', error);
            Alert.alert('Error', 'Failed to fetch leaderboard. Please try again later.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [sortBy, sortOrder, offset]);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLeaderboard(0);
    };

    const toggleSort = (newSortBy: SortBy) => {
        if (newSortBy === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('desc');
        }
        setOffset(0);
    };

    const SortHeader = ({title, sortKey}: { title: string; sortKey: SortBy }) => (
        <TouchableOpacity
            className="flex-1 flex-row items-center justify-center"
            onPress={() => toggleSort(sortKey)}
        >
            <Text className="text-orange-500 font-bold text-sm">{title}</Text>
            {sortBy === sortKey && (
                <Feather
                    name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="#FFA500"
                    style={{marginLeft: 4}}
                />
            )}
        </TouchableOpacity>
    );

    const ContributorItem = ({item, index}: { item: Contributor; index: number }) => (
        <View className="flex-row py-3 border-b border-neutral-700">
            <Text className="flex-1 text-neutral-300 text-center text-sm">{offset + index + 1}</Text>
            <Text className="flex-2 text-neutral-300 text-center text-sm">{formatWalletAddress(item.wallet_id)}</Text>
            <Text className="flex-1 text-neutral-300 text-center text-sm">{item.open_count}</Text>
            <Text className="flex-1 text-neutral-300 text-center text-sm">{item.burn_count}</Text>
            <Text className="flex-1 text-neutral-300 text-center text-sm">{item.guess_count}</Text>
            <Text className="flex-1 text-neutral-300 text-center text-sm">{item.tokens_earned.toFixed(2)}</Text>
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
            <View className="flex-1 p-4">
                <Text className="text-2xl font-bold text-orange-500 mb-6">Leaderboard</Text>
                <View className="flex-1 bg-neutral-800 rounded-lg overflow-hidden">
                    <View className="flex-row py-3 px-4 bg-neutral-700">
                        <Text className="flex-1 text-orange-500 font-bold text-sm text-center">Rank</Text>
                        <Text className="flex-2 text-orange-500 font-bold text-sm text-center">Wallet</Text>
                        <SortHeader title="Opens" sortKey="open_count"/>
                        <SortHeader title="Burns" sortKey="burn_count"/>
                        <SortHeader title="Guesses" sortKey="guess_count"/>
                        <SortHeader title="Tokens" sortKey="tokens_earned"/>
                    </View>
                    <FlatList
                        data={contributors}
                        renderItem={({item, index}) => <ContributorItem item={item} index={index}/>}
                        keyExtractor={(item) => item.wallet_id}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFA500"/>
                        }
                    />
                </View>
            </View>
            <View className="flex-row justify-between p-4 bg-neutral-800 border-t border-neutral-700">
                <TouchableOpacity
                    className={`bg-orange-600 py-2 px-4 rounded ${offset === 0 ? 'opacity-50' : ''}`}
                    onPress={() => offset > 0 && fetchLeaderboard(offset - PAGE_SIZE)}
                    disabled={offset === 0}
                >
                    <Text className="text-white font-bold">Previous</Text>
                </TouchableOpacity>
                <Text className="text-neutral-300 self-center">
                    {offset + 1}-{Math.min(offset + PAGE_SIZE, total)} of {total}
                </Text>
                <TouchableOpacity
                    className={`bg-orange-600 py-2 px-4 rounded ${offset + PAGE_SIZE >= total ? 'opacity-50' : ''}`}
                    onPress={() => offset + PAGE_SIZE < total && fetchLeaderboard(offset + PAGE_SIZE)}
                    disabled={offset + PAGE_SIZE >= total}
                >
                    <Text className="text-white font-bold">Next</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>

    );
}