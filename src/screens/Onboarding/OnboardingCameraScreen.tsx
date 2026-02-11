// ... imports
import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image as RNImage, Alert, Dimensions, SafeAreaView, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Image as ImageIcon } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';
import { createPal, GeneratedProfile } from '../../lib/ai';
import { useAuth } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons'; // Assuming Ionicons is available, if not we'll use lucide-react-native matching CropScreen

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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [isCreating, setIsCreating] = useState(false);
  const cameraRef = useRef<any>(null);

  // Handle return from Crop Screen


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

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCapturedPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const handleSkip = async () => {
    // If skipping front step, we skip all body photos and finish
    if (step === 'front') {
      await finalizeCreation(null);
      return;
    }

    // Otherwise treat skip as confirming a null photo for this step
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

    setIsCreating(true);

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
        setIsCreating(false);
        Alert.alert('Error', 'Failed to create your Pal');
      }
    } catch (e) {
      console.error(e);
      setIsCreating(false);
      Alert.alert('Error', 'An error occurred while creating your Pal');
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  return (
    <View style={styles.container}>
      {capturedPhoto ? (
        <View style={styles.container}>
          <RNImage source={{ uri: capturedPhoto }} style={styles.fullScreenPreview} />
          <View style={styles.previewOverlay}>
            <View style={styles.previewButtonContainer}>
              <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto} disabled={isCreating}>
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={confirmPhoto} disabled={isCreating}>
                {isCreating ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.confirmButtonText}>Use Photo</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <CameraView style={styles.camera} ref={cameraRef} />
          <SafeAreaView style={styles.overlay}>
            <View style={styles.headerSpacer} />
            <View style={styles.instructionContainer}>
              <Text style={styles.stepLabel}>{photoStepLabels[step]}</Text>
              <Text style={styles.instruction}>
                {step === 'avatar'
                  ? 'Take a clear photo of your toy\'s face'
                  : 'Take a photo from this angle'}
              </Text>
            </View>

            <View style={styles.bottomControls}>
              <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                <ImageIcon color="#fff" size={28} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>

              {step !== 'avatar' && (
                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                  <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
              )}
            </View>
          </SafeAreaView>
        </View>
      )}

      {isCreating && step !== 'avatar' && capturedPhoto && (
        <View style={styles.fullScreenLoading}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Creating your Pal...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSpacer: {
    height: 60,
  },
  instructionContainer: {
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  stepLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  instruction: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  bottomControls: {
    width: '100%',
    flexDirection: 'row', // Updated to row for side-by-side buttons
    alignItems: 'center',
    justifyContent: 'center', // Center the capture button
    marginBottom: 50,
    height: 100,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  captureButtonInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#fff',
  },
  skipButton: {
    position: 'absolute',
    right: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  fullScreenPreview: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'contain',
    backgroundColor: '#000',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 50,
    paddingTop: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  previewButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  retakeButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  retakeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  confirmButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
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
  fullScreenLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  galleryButton: {
    position: 'absolute',
    left: 40,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
