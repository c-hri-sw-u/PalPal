import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Platform } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../constants';
import type { GeneratedProfile } from '../../../lib/ai';

interface Props {
    profile: GeneratedProfile | null;
    name: string;
    onUpdate: (profile: GeneratedProfile) => void;
}

export default function ProfilePsyche({ profile, name, onUpdate }: Props) {
    if (!profile) return null;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Inner Psyche</Text>
            <Text style={styles.subtitle}>How does {name} think and feel?</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={profile.personality_description}
                    onChangeText={(text) => onUpdate({ ...profile, personality_description: text })}
                    multiline
                    placeholder={`Describe their inner mind...`}
                    placeholderTextColor={COLORS.textSecondary}
                    scrollEnabled={false}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: SPACING.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xl,
        textAlign: 'center',
    },
    inputContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        minHeight: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    input: {
        fontSize: 16,
        color: COLORS.text,
        lineHeight: 24,
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        textAlignVertical: 'top',
    },
});
