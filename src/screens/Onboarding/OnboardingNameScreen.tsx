import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';

interface RouteParams {
  photos: {
    avatar: string;
    front: string;
    back: string;
    left: string;
    right: string;
  };
}

export default function OnboardingNameScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { photos } = route.params as RouteParams;
  const [name, setName] = useState('');

  const handleNext = () => {
    if (!name.trim()) {
      return;
    }
    navigation.navigate('OnboardingProfile', { photos, name: name.trim() });
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
