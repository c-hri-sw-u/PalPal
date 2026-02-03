import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, STORAGE_BUCKETS } from '../../constants';
import { uploadImage, generateFilePath } from '../../lib/storage';
import { createPal, GeneratedProfile } from '../../lib/ai';
import { useAuth } from '../../hooks/useAuth';

type PhotoStep = 'avatar' | 'front' | 'back' | 'left' | 'right';

interface OnboardingState {
  avatarPhoto: string | null;
  fullBodyPhotos: Record<PhotoStep, string | null>;
  name: string;
  profile: GeneratedProfile | null;
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
  profile: null,
};

export default function OnboardingCameraScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const routeParams = (route.params || {}) as {
    startFromStep?: PhotoStep;
    name?: string;
    photos?: any;
    profile?: GeneratedProfile;
  };
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<PhotoStep>(routeParams.startFromStep || 'avatar');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
  const cameraRef = useRef<any>(null);

  // Handle return from Crop Screen
  useEffect(() => {
    if (route.params?.croppedAvatar) {
      console.log('Received cropped avatar:', route.params.croppedAvatar);
      // Update state with cropped avatar
      setState(prev => ({ ...prev, avatarPhoto: route.params.croppedAvatar }));
      // Advance to next step (Front View)
      setStep('front');
      // Clear param to prevent re-triggering
      navigation.setParams({ croppedAvatar: undefined });
    }
  }, [route.params?.croppedAvatar]);

  // Initialize state from params if available
  useEffect(() => {
    if (routeParams.name && routeParams.profile) {
      setState(prev => ({
        ...prev,
        name: routeParams.name || '',
        profile: routeParams.profile || null,
        avatarPhoto: routeParams.photos?.avatar || null,
        fullBodyPhotos: {
          ...prev.fullBodyPhotos,
          ...(routeParams.photos?.front ? { front: routeParams.photos.front } : {}),
          ...(routeParams.photos?.back ? { back: routeParams.photos.back } : {}),
          ...(routeParams.photos?.left ? { left: routeParams.photos.left } : {}),
          ...(routeParams.photos?.right ? { right: routeParams.photos.right } : {}),
        }
      }));
    }
  }, [routeParams.name, routeParams.profile]);

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

  const handleSkip = async () => {
    // Treat skip as confirming a null photo
    await processStep(null);
  };

  const confirmPhoto = async () => {
    if (!capturedPhoto) return;
    await processStep(capturedPhoto);
  };

  const processStep = async (photoUri: string | null) => {
    if (!user) return;

    try {
      if (step === 'avatar' && photoUri) {
        setState(prev => ({ ...prev, avatarPhoto: photoUri }));
      } else {
        setState(prev => ({
          ...prev,
          fullBodyPhotos: { ...prev.fullBodyPhotos, [step]: photoUri }
        }));
      }

      // Move to next step or finish
      const steps: PhotoStep[] = ['avatar', 'front', 'back', 'left', 'right'];
      const currentIndex = steps.indexOf(step);

      if (currentIndex < steps.length - 1) {
        const nextStep = steps[currentIndex + 1];

        if (step === 'avatar' && photoUri) {
          // Save avatar to state first, then go to crop
          setState(prev => ({ ...prev, avatarPhoto: photoUri }));
          navigation.navigate('OnboardingCrop', { photoUri: photoUri });
        } else {
          // Verify we have profile data before proceeding in full body flow
          // If not (e.g. came here directly?), we might need to handle that. 
          // But assuming flow is correct:

          setStep(nextStep);
          setCapturedPhoto(null);
        }
      } else {
        // Last step finished. Create the Pal!
        await finalizeCreation(photoUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save photo');
    }
  };

  const finalizeCreation = async (lastPhotoUri: string | null) => {
    if (!user || !state.name || !state.profile) {
      console.error("Missing data for creation", { state, user });
      Alert.alert('Error', 'Missing profile data. Please start over.');
      return;
    }

    // Ensure we have current step photo included in the list
    const finalPhotos = { ...state.fullBodyPhotos };
    if (step !== 'avatar') {
      finalPhotos[step] = lastPhotoUri;
    }

    // Build the photos array. 
    // Note: The AI helper expects [front, back, left, right]. 
    // Should we handle nulls? Yes, just pass empty strings for missing photos.
    const photosArray = [
      finalPhotos.front || '',
      finalPhotos.back || '',
      finalPhotos.left || '',
      finalPhotos.right || ''
    ];

    // Show loading? Ideally yes.
    try {
      const pal = await createPal(
        user.id,
        state.name,
        state.avatarPhoto || '', // This should be the cropped one
        photosArray,
        state.profile
      );

      if (pal) {
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', 'Failed to create your Pal');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'An error occurred while creating your Pal');
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
        <View style={{ flex: 1 }}>
          <CameraView style={styles.camera} ref={cameraRef} />
          <View style={styles.overlay}>
            <Text style={styles.stepLabel}>{photoStepLabels[step]}</Text>
            <Text style={styles.instruction}>
              {step === 'avatar'
                ? 'Take a clear photo of your toy\'s face'
                : 'Take a photo from this angle'}
            </Text>
            {step !== 'avatar' && (
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
            <View style={styles.captureButtonInner} />
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
  skipButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.full,
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
