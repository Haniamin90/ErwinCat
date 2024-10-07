import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    Alert,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import {FontAwesome5} from '@expo/vector-icons';
import axios from 'axios';
import {useLocalSearchParams, useRouter} from 'expo-router';

interface Contributor {
    wallet_id: string;
    guess_count: number;
    reward: number;
}

interface BoxDetail {
    box_id: string;
    state: boolean;
    state_str: string;
    spawned_at: string;
    opened_at: string | null;
    decay_number: number | null;
    opener_wallet: string | null;
    is_burned: boolean;
    contents: number | null;
    password: string | null;
    contributors: Contributor[];
    events: any[];
}

const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 5)}...${address.slice(-5)}`;
};

export default function Box() {
    const {id} = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [box, setBox] = useState<BoxDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBoxDetails = async () => {
            if (!id) {
                Alert.alert('Error', 'No box ID provided.');
                return;
            }

            try {
                const response = await axios.get<BoxDetail>(
                    `https://ewnscan.hexato.io/box/id/${id}?exclude_contributors=false&exclude_events=true`
                );
                setBox(response.data);
            } catch (error) {
                //console.error('Error fetching box details:', error);
                Alert.alert('Error', 'Failed to fetch box details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchBoxDetails();
    }, [id]);

    const renderContributor = ({item}: { item: Contributor }) => (
        <View className="bg-neutral-800 rounded-lg p-4 mb-2">
            <Text className="text-neutral-300 font-bold mb-1 text-base">{item.wallet_id}</Text>
            <Text className="text-neutral-400">Guesses: {item.guess_count}</Text>
            <Text className="text-neutral-400">Reward: {item.reward.toFixed(6)}</Text>
        </View>
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-neutral-900">
                <ActivityIndicator size="large" color="#FFA500"/>
            </View>
        );
    }

    if (!box) {
        return (
            <View className="flex-1 justify-center items-center bg-neutral-900">
                <Text className="text-white text-lg">Box not found</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#171717'}}>
            <StatusBar style="light"/>
            <View className="flex-1">
                <View className="p-4">
                    <Text className="text-2xl font-bold text-orange-500 mb-4">Box Details</Text>
                    <View className="bg-neutral-800 rounded-lg p-4 mb-4">
                        <View className="flex-row justify-between items-center mb-4">
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
                                    <FontAwesome5 name="question" size={24} color="#FFA500" className="ml-2"/>
                                )}
                            </View>
                        </View>
                        <DetailItem label="State" value={box.state_str}/>
                        <DetailItem label="Spawned" value={new Date(box.spawned_at).toLocaleString()}/>
                        {box.opened_at && (
                            <DetailItem label="Opened" value={new Date(box.opened_at).toLocaleString()}/>
                        )}
                        <DetailItem label="Contributors" value={box.contributors.length.toString()}/>
                        {box.contents !== null && (
                            <DetailItem label="Contents" value={box.contents.toString()}/>
                        )}
                        {box.password && (
                            <DetailItem label="Password" value={box.password}/>
                        )}
                        <DetailItem label="Burned" value={box.is_burned ? 'Yes' : 'No'}/>
                        {box.opener_wallet && (
                            // show only first 5 last 5 letters
                            <DetailItem label="Opener" value={formatWalletAddress(box.opener_wallet)}/>
                        )}
                        {box.decay_number !== null && (
                            <DetailItem label="Decay Number" value={box.decay_number.toString()}/>
                        )}
                    </View>
                </View>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-orange-500 mb-4 px-4">Contributors
                        ({box.contributors.length}) </Text>
                    <FlatList
                        data={box.contributors}
                        renderItem={renderContributor}
                        keyExtractor={(item) => item.wallet_id}
                        contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 80}}
                        ListEmptyComponent={
                            <Text className="text-neutral-400 text-center">No contributors found</Text>
                        }
                    />
                </View>
            </View>
            <View className="p-4 bg-neutral-900 border-t border-neutral-700 absolute bottom-0 left-0 right-0">
                <TouchableOpacity
                    className="bg-orange-700 py-2 px-4 rounded"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-bold text-center">Back</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const DetailItem = ({label, value}: { label: string; value: string }) => (
    <View className="flex-row justify-between mb-2">
        <Text className="text-neutral-400">{label}:</Text>
        <Text className="text-neutral-300">{value}</Text>
    </View>
);