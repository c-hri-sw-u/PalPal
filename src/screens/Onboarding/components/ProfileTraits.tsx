import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../constants';
import type { GeneratedProfile } from '../../../lib/ai';

interface Props {
    profile: GeneratedProfile | null;
    onUpdate: (profile: GeneratedProfile) => void;
}

const TRAIT_LABELS = {
    extraversion: {
        label: '🗣️ Extraversion',
        description: 'How outgoing and energetic they are.',
    },
    agreeableness: {
        label: '🤝 Agreeableness',
        description: 'How cooperative, polite, and kind they are.',
    },
    openness: {
        label: '🎨 Openness',
        description: 'How creative, curious, and open to new ideas they are.',
    },
    conscientiousness: {
        label: '🎯 Conscientiousness',
        description: 'How organized, responsible, and hardworking they are.',
    },
    neuroticism: {
        label: '🌪️ Neuroticism',
        description: 'How sensitive to stress and negative emotions they are.',
    },
};

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ProfileTraits({ profile, onUpdate }: Props) {
    if (!profile) return null;

    const updateTrait = (trait: keyof GeneratedProfile['traits'], value: number) => {
        onUpdate({
            ...profile,
            traits: { ...profile.traits, [trait]: value }
        });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Personality</Text>
            <Text style={styles.subtitle}>Fine-tune the core personality traits.</Text>

            <View style={styles.list}>
                {Object.entries(TRAIT_LABELS).map(([key, { label, description }]) => {
                    const value = profile.traits[key as keyof typeof profile.traits] ?? 50;
                    return (
                        <View key={key} style={styles.row}>
                            <View style={styles.header}>
                                <View style={styles.labelContainer}>
                                    <Text style={styles.label}>{label}</Text>
                                    <Text style={styles.description}>{description}</Text>
                                </View>
                                <Text style={styles.value}>{value}%</Text>
                            </View>
                            <TouchableOpacity
                                activeOpacity={1}
                                style={styles.track}
                                onPress={(e) => {
                                    const x = e.nativeEvent.locationX;
                                    const trackWidth = SCREEN_WIDTH - (SPACING.xl * 2);
                                    const percentage = Math.round((x / trackWidth) * 100);
                                    const clamped = Math.min(100, Math.max(0, percentage));
                                    updateTrait(key as any, clamped);
                                }}
                            >
                                <View style={[styles.fill, { width: `${value}%` }]} />
                            </TouchableOpacity>
                        </View>
                    );
                })}
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
    list: {
        gap: SPACING.xl,
    },
    row: {
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
        alignItems: 'center',
    },
    labelContainer: {
        flex: 1,
        paddingRight: SPACING.sm,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
    description: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    track: {
        height: 8,
        backgroundColor: '#F0F0F0',
        borderRadius: BORDER_RADIUS.full,
        position: 'relative',
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        backgroundColor: COLORS.text,
        borderRadius: BORDER_RADIUS.full,
    },
});
