import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
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
  const avatarUri = photos?.avatar || avatarPhoto;

  // If we have avatar but need full body, we should redirect to camera for full body
  // For now, show a message that full body photos will be taken after

  const handleNext = () => {
    if (!name.trim()) {
      return;
    }

    // Always go to profile creation next
    const allPhotos = {
      avatar: photos?.avatar || avatarPhoto || '',
      front: photos?.front || '',
      back: photos?.back || '',
      left: photos?.left || '',
      right: photos?.right || '',
    };
    navigation.navigate('OnboardingProfile', { photos: allPhotos, name: name.trim() });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {avatarUri && (
            <View style={styles.polaroidContainer}>
              <View style={styles.polaroidFrame}>
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.polaroidImage}
                  resizeMode="cover"
                />
              </View>
            </View>
          )}

          <Text style={styles.title}>What's your Pal's name?</Text>

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
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  polaroidContainer: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
    transform: [{ rotate: '-3deg' }],
  },
  polaroidFrame: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  polaroidImage: {
    width: 200,
    height: 200,
    borderRadius: 2,
    backgroundColor: '#f0f0f0',
  },
  input: {
    width: '100%',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 0.5,
    borderColor: COLORS.text,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: SPACING.xl,
    textAlign: 'center',
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
