import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants';
import { generateProfile } from '../../lib/ai';
import { useAuth } from '../../hooks/useAuth';
import type { GeneratedProfile } from '../../lib/ai';
import { Ionicons } from '@expo/vector-icons';

import ProfileMBTI from './components/ProfileMBTI';
import ProfileTraits from './components/ProfileTraits';
import ProfileStory from './components/ProfileStory';
import ProfilePsyche from './components/ProfilePsyche';
import ProfileOverview from './components/ProfileOverview';

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

const STEPS = ['MBTI', 'Personality', 'Story', 'Psyche', 'Overview'];

export default function OnboardingProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { photos, name } = route.params as RouteParams;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [profile, setProfile] = useState<GeneratedProfile | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

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

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleCreatePal();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleCreatePal = async () => {
    if (!user || !profile) return;

    // Proceed to full body photos
    navigation.navigate('OnboardingCamera', {
      startFromStep: 'front',
      name,
      photos,
      profile // Pass the generated profile
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.text} />
        <Text style={styles.loadingText}>ANALYZING...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentStep + 1) / STEPS.length) * 100}%` }
              ]}
            />
          </View>
        </View>

        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {currentStep === 0 && (
          <ProfileMBTI
            profile={profile}
            onUpdate={(p) => setProfile(p)}
          />
        )}
        {currentStep === 1 && (
          <ProfileTraits
            profile={profile}
            onUpdate={(p) => setProfile(p)}
          />
        )}
        {currentStep === 2 && (
          <ProfileStory
            profile={profile}
            name={name}
            onUpdate={(p) => setProfile(p)}
          />
        )}
        {currentStep === 3 && (
          <ProfilePsyche
            profile={profile}
            name={name}
            onUpdate={(p) => setProfile(p)}
          />
        )}
        {currentStep === 4 && (
          <ProfileOverview
            profile={profile}
            name={name}
          />
        )}
      </View>

      <View style={styles.footer}>
        {currentStep < 4 && (
          <TouchableOpacity
            onPress={regenerateProfile}
            disabled={generating}
            style={styles.regenerateLink}
          >
            {generating ? (
              <ActivityIndicator size="small" color={COLORS.textSecondary} />
            ) : (
              <Text style={styles.regenerateText}>Re-roll</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            {currentStep === STEPS.length - 1 ? 'Initialize Pal' : 'Continue'}
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  backButton: {
    padding: SPACING.sm,
  },
  placeholder: {
    width: 48,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.text,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  footer: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  continueButton: {
    width: '100%',
    padding: SPACING.md,
    backgroundColor: COLORS.text,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.background,
  },
  regenerateLink: {
    alignItems: 'center',
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  regenerateText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
});
