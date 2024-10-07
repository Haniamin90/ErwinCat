import {Tabs} from 'expo-router';
import React from 'react';
import {TabBarIcon} from '@/components/navigation/TabBarIcon';

export default function TabLayout() {

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#FFA001",
                tabBarInactiveTintColor: "#CDCDE0",
                tabBarShowLabel: false,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: "bold",
                    paddingBottom: 10,

                },
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: "#171717",
                    borderTopWidth: 0,
                    height: 65,
                    paddingHorizontal: 30,

                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({color, focused}) => (
                        <TabBarIcon name='home' color={color}/>
                    ),
                }}
            />
            <Tabs.Screen
                name="walletStats"
                options={{
                    title: 'Wallet Stats',
                    tabBarIcon: ({color, focused}) => (
                        <TabBarIcon name='wallet' color={color}/>
                    ),
                }}
            />
            <Tabs.Screen
                name="boxes"
                options={{
                    title: 'Recent Boxes',
                    tabBarIcon: ({color, focused}) => (
                        <TabBarIcon name='box' color={color}/>
                    ),
                }}
            />
            <Tabs.Screen
                name="leader"
                options={{
                    title: 'Leader Board',
                    tabBarIcon: ({color, focused}) => (
                        <TabBarIcon name='trophy' color={color}/>
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({color, focused}) => (
                        <TabBarIcon name='cog' color={color}/>
                    ),
                }}
            />

        </Tabs>
    );
}
