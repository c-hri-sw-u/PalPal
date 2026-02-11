import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { User, Settings, LogOut, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();

    const menuItems = [
        { icon: Settings, label: 'Settings', onPress: () => { } },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.headerTitle}>Profile</Text>

                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <User size={32} color={COLORS.textSecondary} />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.email}>{user?.email || 'Guest'}</Text>
                        <Text style={styles.memberSince}>PalPal Member</Text>
                    </View>
                </View>

                <View style={styles.menuSection}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                            <View style={styles.menuItemLeft}>
                                <item.icon size={22} color={COLORS.text} />
                                <Text style={styles.menuItemLabel}>{item.label}</Text>
                            </View>
                            <ChevronRight size={20} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
                    <LogOut size={20} color="#FF4444" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.lg,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xl,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.xl,
    },
    avatarContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    profileInfo: {
        flex: 1,
    },
    email: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.text,
    },
    memberSince: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    menuSection: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        marginBottom: SPACING.xl,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.background,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemLabel: {
        fontSize: 16,
        color: COLORS.text,
        marginLeft: SPACING.md,
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.md,
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        borderRadius: BORDER_RADIUS.lg,
    },
    signOutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FF4444',
        marginLeft: SPACING.sm,
    },
});
