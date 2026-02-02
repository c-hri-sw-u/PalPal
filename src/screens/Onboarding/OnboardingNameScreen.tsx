import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';

interface RouteParams {
  photos?: {
    avatar: string;
    front: string;
    back: string;
    left: string;
    right: string;
  };
  avatarPhoto?: string;
}

export default function OnboardingNameScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { photos, avatarPhoto } = route.params as RouteParams;
  const [name, setName] = useState('');

  // Handle case where we have avatar from crop but need to take full body photos
  const hasAvatar = photos?.avatar || avatarPhoto;
  const needsFullBody = !photos?.front && !photos?.back && !photos?.left && !photos?.right;
  
  // If we have avatar but need full body, we should redirect to camera for full body
  // For now, show a message that full body photos will be taken after
  const hasFullPhotos = photos?.front || photos?.back || photos?.left || photos?.right;

  const handleNext = () => {
    if (!name.trim()) {
      return;
    }
    
    if (hasAvatar && needsFullBody) {
      // Go take full body photos first
      navigation.navigate('OnboardingCamera', { 
        // Pass current photos state
        startFromStep: 'front' 
      });
    } else if (hasFullPhotos) {
      // We have full photos, go to profile
      const allPhotos = {
        avatar: photos.avatar || avatarPhoto || '',
        front: photos.front || '',
        back: photos.back || '',
        left: photos.left || '',
        right: photos.right || '',
      };
      navigation.navigate('OnboardingProfile', { photos: allPhotos, name: name.trim() });
    } else {
      // Fallback - go to camera
      navigation.navigate('OnboardingCamera');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Give your Pal a name</Text>
      <Text style={styles.subtitle}>
        What would you like to call your new companion?
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter a name..."
        placeholderTextColor={COLORS.textSecondary}
        value={name}
        onChangeText={setName}
        autoFocus
        onSubmitEditing={handleNext}
      />

      <TouchableOpacity 
        style={[styles.button, !name.trim() && styles.buttonDisabled]} 
        onPress={handleNext}
        disabled={!name.trim()}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  },
  input: {
    width: '100%',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.text,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  button: {
    width: '100%',
    padding: SPACING.md,
    backgroundColor: COLORS.text,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
