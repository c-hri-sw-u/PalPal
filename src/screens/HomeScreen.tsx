import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Pal } from '../types';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, signOut } = useAuth();
  const [pals, setPals] = useState<Pal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPals();
    }
  }, [user]);

  const loadPals = async () => {
    const { data, error } = await supabase
      .from('pals')
      .select('*')
      .eq('owner_id', user?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPals(data);
    }
    setLoading(false);
  };

  const handleCreatePal = () => {
    navigation.navigate('OnboardingCamera');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {pals.length === 0 ? (
        // Empty state - no pals yet
        <View style={styles.emptyContainer}>
          <Text style={styles.title}>Welcome to PalPal 🧸</Text>
          <Text style={styles.subtitle}>
            Create your first Pal companion!
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleCreatePal}>
            <Text style={styles.buttonText}>Create Your First Pal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Pals list
        <View style={styles.palsContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Pals</Text>
            <TouchableOpacity onPress={signOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
          
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
                  <Text style={styles.palMBTI}>{item.mbti}</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.palsList}
          />

          <TouchableOpacity 
            style={[styles.button, styles.addButton]} 
            onPress={handleCreatePal}
          >
            <Text style={styles.buttonText}>+ Add New Pal</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.text,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
  palsContainer: {
    flex: 1,
    padding: SPACING.lg,
    paddingTop: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  signOutText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  palsList: {
    gap: SPACING.md,
  },
  palCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  palAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SPACING.md,
  },
  palInfo: {
    flex: 1,
  },
  palName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  palMBTI: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addButton: {
    marginTop: SPACING.lg,
  },
});
