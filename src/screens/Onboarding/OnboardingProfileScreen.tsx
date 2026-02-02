import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';
import { generateProfile, createPal } from '../../lib/ai';
import { useAuth } from '../../hooks/useAuth';
import type { GeneratedProfile } from '../../lib/ai';

interface RouteParams {
  photos: {
    avatar: string;
    front: string;
    back: string;
    left: string;
    right: string;
  };
  name: string;
}

const MBTI_OPTIONS = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

const TRAIT_LABELS = {
  extraversion: 'Extraversion',
  agreeableness: 'Agreeableness',
  openness: 'Openness',
  conscientiousness: 'Conscientiousness',
  neuroticism: 'Neuroticism',
};

export default function OnboardingProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { photos, name } = route.params as RouteParams;
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState<GeneratedProfile | null>(null);
  const [showMBTISelector, setShowMBTISelector] = useState(false);

  useEffect(() => {
    loadGeneratedProfile();
  }, []);

  const loadGeneratedProfile = async () => {
    setLoading(true);
    const generated = await generateProfile({ name, avatarUrl: photos.avatar });
    setProfile(generated);
    setLoading(false);
  };

  const regenerateProfile = async () => {
    setGenerating(true);
    const generated = await generateProfile({ name, avatarUrl: photos.avatar });
    setProfile(generated);
    setGenerating(false);
  };

  const handleCreatePal = async () => {
    if (!user || !profile) return;

    setLoading(true);
    const pal = await createPal(
      user.id,
      name,
      photos.avatar,
      [photos.front, photos.back, photos.left, photos.right],
      profile
    );

    if (pal) {
      navigation.navigate('Home');
    } else {
      alert('Failed to create your Pal');
    }
    setLoading(false);
  };

  const updateTrait = (trait: keyof typeof profile.traits, value: number) => {
    setProfile(prev => prev ? {
      ...prev,
      traits: { ...prev.traits, [trait]: value }
    } : null);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.text} />
        <Text style={styles.loadingText}>Creating your Pal's personality...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Customize {name}'s Personality</Text>
      
      {/* MBTI Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MBTI Type</Text>
        <TouchableOpacity 
          style={styles.mbtiButton}
          onPress={() => setShowMBTISelector(!showMBTISelector)}
        >
          <Text style={styles.mbtiText}>{profile?.mbti}</Text>
        </TouchableOpacity>
        
        {showMBTISelector && (
          <View style={styles.mbtiGrid}>
            {MBTI_OPTIONS.map(mbti => (
              <TouchableOpacity
                key={mbti}
                style={[
                  styles.mbtiOption,
                  profile?.mbti === mbti && styles.mbtiOptionSelected
                ]}
                onPress={() => {
                  setProfile(prev => prev ? { ...prev, mbti } : null);
                  setShowMBTISelector(false);
                }}
              >
                <Text style={[
                  styles.mbtiOptionText,
                  profile?.mbti === mbti && styles.mbtiOptionTextSelected
                ]}>
                  {mbti}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Trait Sliders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personality Traits</Text>
        {Object.entries(TRAIT_LABELS).map(([key, label]) => (
          <View key={key} style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>{label}</Text>
            <Text style={styles.sliderValue}>
              {profile?.traits[key as keyof typeof profile.traits]}
            </Text>
          </View>
        ))}
        
        {Object.entries(TRAIT_LABELS).map(([key, label]) => (
          <View key={key} style={styles.sliderContainer}>
            <Text style={styles.sliderMin}>0</Text>
            <View style={styles.sliderTrack}>
              <TouchableOpacity
                style={[
                  styles.sliderThumb,
                  { left: `${((profile?.traits[key as keyof typeof profile.traits] ?? 50) / 100) * 100 - 5}%` }
                ]}
              />
            </View>
            <Text style={styles.sliderMax}>100</Text>
          </View>
        ))}
        
        {/* Simplified slider for MVP - tap to increment/decrement */}
        <View style={styles.quickSlider}>
          {Object.entries(TRAIT_LABELS).map(([key, label]) => (
            <View key={key} style={styles.quickSliderRow}>
              <Text style={styles.quickSliderLabel}>{label.slice(0, 4)}</Text>
              <TouchableOpacity 
                style={styles.quickSliderBtn}
                onPress={() => updateTrait(key as any, Math.max(0, (profile?.traits[key as keyof typeof profile.traits] ?? 50) - 10))}
              >
                <Text style={styles.quickSliderBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quickSliderValue}>
                {profile?.traits[key as keyof typeof profile.traits]}
              </Text>
              <TouchableOpacity 
                style={styles.quickSliderBtn}
                onPress={() => updateTrait(key as any, Math.min(100, (profile?.traits[key as keyof typeof profile.traits] ?? 50) + 10))}
              >
                <Text style={styles.quickSliderBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Backstory */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backstory</Text>
        <TextInput
          style={styles.textArea}
          value={profile?.backstory}
          onChangeText={(text) => setProfile(prev => prev ? { ...prev, backstory: text } : null)}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Personality Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personality Description</Text>
        <TextInput
          style={styles.textArea}
          value={profile?.personality_description}
          onChangeText={(text) => setProfile(prev => prev ? { ...prev, personality_description: text } : null)}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={regenerateProfile}
          disabled={generating}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            {generating ? 'Generating...' : 'Regenerate with AI'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleCreatePal}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating...' : `Create ${name}!`}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.xxl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  mbtiButton: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.text,
    alignItems: 'center',
  },
  mbtiText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  mbtiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: SPACING.md,
  },
  mbtiOption: {
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  mbtiOptionSelected: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  mbtiOptionText: {
    fontSize: 12,
    color: COLORS.text,
  },
  mbtiOptionTextSelected: {
    color: COLORS.background,
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sliderLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  sliderValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sliderMin: {
    fontSize: 12,
    color: COLORS.textSecondary,
    width: 20,
  },
  sliderMax: {
    fontSize: 12,
    color: COLORS.textSecondary,
    width: 30,
    textAlign: 'right',
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  sliderThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: COLORS.text,
    borderRadius: 8,
    top: -4,
  },
  quickSlider: {
    marginTop: SPACING.md,
  },
  quickSliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickSliderLabel: {
    width: 60,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  quickSliderBtn: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  quickSliderBtnText: {
    fontSize: 18,
    color: COLORS.text,
  },
  quickSliderValue: {
    width: 40,
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.text,
  },
  textArea: {
    width: '100%',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  button: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.text,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.text,
  },
  secondaryButtonText: {
    color: COLORS.text,
  },
});
