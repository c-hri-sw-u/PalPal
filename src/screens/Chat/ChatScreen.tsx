import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import type { Pal } from '../../types';
import { MessageCircle, Plus } from 'lucide-react-native';

export default function ChatScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const [pals, setPals] = useState<Pal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadPals();
        }
    }, [user]);

    const loadPals = async () => {
        const timeoutId = setTimeout(() => {
            setLoading(false);
        }, 10000);

        try {
            const { data, error } = await supabase
                .from('pals')
                .select('*')
                .eq('owner_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
            }

            setPals(data || []);
        } catch (e) {
            console.error('loadPals exception:', e);
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    };

    const handleCreatePal = () => {
        navigation.navigate('OnboardingCamera');
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {pals.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <MessageCircle size={64} color={COLORS.textSecondary} strokeWidth={1.5} />
                    </View>
                    <Text style={styles.emptyTitle}>No Pals Yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Create your first Pal to start chatting!
                    </Text>
                    <TouchableOpacity style={styles.createButton} onPress={handleCreatePal}>
                        <Plus size={20} color={COLORS.background} style={{ marginRight: 8 }} />
                        <Text style={styles.createButtonText}>Create Your First Pal</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.listContainer}>
                    <Text style={styles.headerTitle}>Chats</Text>
                    <FlatList
                        data={pals}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.palCard}>
                                {item.avatar_url && (
                                    <Image
                                        source={{ uri: item.avatar_url }}
                                        style={styles.palAvatar}
                                    />
                                )}
                                <View style={styles.palInfo}>
                                    <Text style={styles.palName}>{item.name}</Text>
                                    <Text style={styles.palPreview}>Tap to start chatting...</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.palsList}
                    />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 100,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
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
        marginBottom: SPACING.xl,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        backgroundColor: COLORS.text,
        borderRadius: BORDER_RADIUS.full,
    },
    createButtonText: {
        color: COLORS.background,
        fontSize: 16,
        fontWeight: '600',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.lg,
    },
    palsList: {
        gap: SPACING.sm,
    },
    palCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
    },
    palAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: SPACING.md,
    },
    palInfo: {
        flex: 1,
    },
    palName: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.text,
    },
    palPreview: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
});
