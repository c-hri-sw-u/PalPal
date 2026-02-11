import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../../constants';
import type { GeneratedProfile } from '../../../lib/ai';

interface Props {
    profile: GeneratedProfile | null;
    name: string;
}

const TRAIT_LABELS = {
    extraversion: 'E',
    agreeableness: 'A',
    openness: 'O',
    conscientiousness: 'C',
    neuroticism: 'N',
};

export default function ProfileOverview({ profile, name }: Props) {
    if (!profile) return null;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Review Profile</Text>
            <Text style={styles.subtitle}>Is this {name}?</Text>

            <View style={styles.card}>
                <View style={styles.row}>
                    <Text style={styles.label}>MBTI</Text>
                    <View style={styles.chip}>
                        <Text style={styles.chipText}>{profile.mbti}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.label}>TRAITS</Text>
                    <View style={styles.traitsRow}>
                        {Object.entries(TRAIT_LABELS).map(([key, label]) => (
                            <View key={key} style={styles.traitBadge}>
                                <Text style={styles.traitLabel}>{label}</Text>
                                <Text style={styles.traitValue}>
                                    {profile.traits[key as keyof typeof profile.traits]}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.label}>STORY</Text>
                    <Text style={styles.bodyText} numberOfLines={4}>
                        {profile.backstory}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.label}>PSYCHE</Text>
                    <Text style={styles.bodyText} numberOfLines={4}>
                        {profile.personality_description}
                    </Text>
                </View>
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
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    section: {
        gap: SPACING.sm,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        color: COLORS.textSecondary,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    chip: {
        backgroundColor: COLORS.text,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: BORDER_RADIUS.full,
    },
    chipText: {
        color: COLORS.background,
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: SPACING.lg,
    },
    traitsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    traitBadge: {
        alignItems: 'center',
        gap: 4,
    },
    traitLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    traitValue: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.text,
    },
    bodyText: {
        fontSize: 14,
        lineHeight: 22,
        color: COLORS.text,
    },
});
