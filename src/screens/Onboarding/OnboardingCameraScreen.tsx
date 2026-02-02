import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';
import { uploadImage, generateFilePath, STORAGE_BUCKETS } from '../../lib/storage';
import { useAuth } from '../../hooks/useAuth';

type PhotoStep = 'avatar' | 'front' | 'back' | 'left' | 'right';

interface OnboardingState {
  avatarPhoto: string | null;
  fullBodyPhotos: Record<PhotoStep, string | null>;
  name: string;
  mbti: string;
  traits: {
    extraversion: number;
    agreeableness: number;
    openness: number;
    conscientiousness: number;
    neuroticism: number;
  };
  backstory: string;
  personalityDescription: string;
}

const INITIAL_STATE: OnboardingState = {
  avatarPhoto: null,
  fullBodyPhotos: {
    avatar: null,
    front: null,
    back: null,
    left: null,
    right: null,
  },
  name: '',
  mbti: '',
  traits: {
    extraversion: 50,
    agreeableness: 50,
    openness: 50,
    conscientiousness: 50,
    neuroticism: 50,
  },
  backstory: '',
  personalityDescription: '',
};

export default function OnboardingCameraScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const routeParams = route.params as { startFromStep?: PhotoStep };
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<PhotoStep>(routeParams.startFromStep || 'avatar');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
  const cameraRef = useRef<any>(null);

  const photoStepLabels: Record<PhotoStep, string> = {
    avatar: 'Avatar Photo',
    front: 'Front View',
    back: 'Back View',
    left: 'Left View',
    right: 'Right View',
  };

  if (!permission) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera access is required to create your Pal</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      
      if (photo.uri) {
        setCapturedPhoto(photo.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const confirmPhoto = async () => {
    if (!capturedPhoto || !user) return;

    const fileName = `photo.jpg`;
    const filePath = generateFilePath(
      step === 'avatar' ? 'PAL_AVATARS' : 'PAL_FULLBODY',
      user.id,
      fileName
    );

    try {
      // In a real app, you'd convert the URI to a Blob here
      // For now, we'll store the local URI
      if (step === 'avatar') {
        setState(prev => ({ ...prev, avatarPhoto: capturedPhoto }));
      } else {
        setState(prev => ({
          ...prev,
          fullBodyPhotos: { ...prev.fullBodyPhotos, [step]: capturedPhoto }
        }));
      }

      // Move to next step or finish
      const steps: PhotoStep[] = ['avatar', 'front', 'back', 'left', 'right'];
      const currentIndex = steps.indexOf(step);
      
      if (currentIndex < steps.length - 1) {
        const nextStep = steps[currentIndex + 1];
        
        if (step === 'avatar') {
          // Save avatar to state first, then go to crop
          setState(prev => ({ ...prev, avatarPhoto: capturedPhoto }));
          navigation.navigate('OnboardingCrop', { photoUri: capturedPhoto });
        } else {
          setState(prev => ({
            ...prev,
            fullBodyPhotos: { ...prev.fullBodyPhotos, [step]: capturedPhoto }
          }));
          setStep(nextStep);
          setCapturedPhoto(null);
        }
      } else {
        // All photos taken, go to name input
        // Note: avatar is already in state.avatarPhoto
        const allPhotos = {
          avatar: state.avatarPhoto || '',
          front: state.fullBodyPhotos.front || '',
          back: state.fullBodyPhotos.back || '',
          left: state.fullBodyPhotos.left || '',
          right: state.fullBodyPhotos.right || '',
        };
        navigation.navigate('OnboardingName', { photos: allPhotos });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save photo');
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  return (
    <View style={styles.container}>
      {capturedPhoto ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedPhoto }} style={styles.preview} />
          <View style={styles.previewButtons}>
            <TouchableOpacity style={styles.button} onPress={retakePhoto}>
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={confirmPhoto}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <CameraView style={styles.camera} ref={cameraRef}>
          <View style={styles.overlay}>
            <Text style={styles.stepLabel}>{photoStepLabels[step]}</Text>
            <Text style={styles.instruction}>
              {step === 'avatar' 
                ? 'Take a clear photo of your toy\'s face'
                : 'Take a photo from this angle'}
            </Text>
          </View>
          <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  captureButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  previewButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
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
  permissionText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
});
