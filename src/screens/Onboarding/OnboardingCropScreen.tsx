import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ImageEditor } from 'expo-image-editor';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';

interface RouteParams {
  photoUri: string;
}

export default function OnboardingCropScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const { photoUri } = route.params as RouteParams;
  const [editorVisible, setEditorVisible] = useState(true);

  const handleSave = (result: any) => {
    // result.uri contains the cropped image
    navigation.navigate('OnboardingName', { 
      avatarPhoto: result.uri,
    });
  };

  if (!photoUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No image to edit</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageEditor
        visible={editorVisible}
        onCloseEditor={() => setEditorVisible(false)}
        imageUri={photoUri}
        onEditingComplete={(result) => {
          setEditorVisible(false);
          handleSave(result);
        }}
        minimumCropDimensions={{
          width: 300,
          height: 300,
        }}
        allowedAspectRatios={[
          {
            id: '1:1',
            label: 'Square (1:1)',
          },
        ]}
        lockAspectRatio={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: SPACING.xl,
  },
  button: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.text,
    borderRadius: BORDER_RADIUS.full,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
