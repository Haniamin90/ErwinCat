import React, {ComponentProps} from 'react';
import {FontAwesome5} from '@expo/vector-icons';
import {StyleProp, ViewStyle} from 'react-native';

type FontAwesome5IconName = ComponentProps<typeof FontAwesome5>['name'];

interface TabBarIconProps {
    name: FontAwesome5IconName;
    color?: string;
    size?: number;
    style?: StyleProp<ViewStyle>;
    solid?: boolean;
}

export function TabBarIcon({name, color = 'white', size = 24, style}: TabBarIconProps) {
    return (
        <FontAwesome5
            name={name}
            size={size}
            color={color}
            style={[{marginBottom: -3}, style]}
        />
    );
}