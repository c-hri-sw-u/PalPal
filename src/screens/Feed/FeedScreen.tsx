import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { COLORS, SPACING } from '../../constants';
import { Newspaper } from 'lucide-react-native';

export default function FeedScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>Feed</Text>

                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <Newspaper size={64} color={COLORS.textSecondary} strokeWidth={1.5} />
                    </View>
                    <Text style={styles.emptyTitle}>Coming Soon</Text>
                    <Text style={styles.emptySubtitle}>
                        Your Pals' adventures and updates will appear here!
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.lg,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    emptySubtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingHorizontal: SPACING.xl,
    },
});
