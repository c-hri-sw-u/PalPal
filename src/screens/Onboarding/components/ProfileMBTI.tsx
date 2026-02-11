import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../constants';
import type { GeneratedProfile } from '../../../lib/ai';

interface Props {
    profile: GeneratedProfile | null;
    onUpdate: (profile: GeneratedProfile) => void;
}

const MBTI_OPTIONS = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

export default function ProfileMBTI({ profile, onUpdate }: Props) {
    if (!profile) return null;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>MBTI</Text>
            <Text style={styles.subtitle}>Select the personality type that best fits your Pal.</Text>

            <View style={styles.grid}>
                {MBTI_OPTIONS.map((mbti) => {
                    const isSelected = profile.mbti === mbti;
                    return (
                        <TouchableOpacity
                            key={mbti}
                            style={[
                                styles.chip,
                                isSelected && styles.chipSelected
                            ]}
                            onPress={() => onUpdate({ ...profile, mbti })}
                            activeOpacity={0.8}
                        >
                            <Text style={[
                                styles.text,
                                isSelected && styles.textSelected
                            ]}>
                                {mbti}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: SPACING.xl,
        alignItems: 'center',
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
        lineHeight: 22,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    chip: {
        width: '22%', // Roughly 4 columns
        aspectRatio: 1.6,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipSelected: {
        backgroundColor: COLORS.text,
        borderColor: COLORS.text,
        shadowOpacity: 0.3,
    },
    text: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center',
        top: Platform.select({ ios: -5, android: 0 }), // Nudge text down for visual centering
    },
    textSelected: {
        color: COLORS.background,
    },
});
