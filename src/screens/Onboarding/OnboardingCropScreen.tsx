import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image as RNImage, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import * as ImageManipulator from 'expo-image-manipulator';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';
import { ArrowLeft, Check, RotateCcw } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CROP_AREA_SIZE = SCREEN_WIDTH - 40; // Square, with padding

interface RouteParams {
  photoUri: string;
}

export default function OnboardingCropScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { photoUri } = route.params as RouteParams;

  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Shared values for transformations
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  useEffect(() => {
    if (photoUri) {
      setLoading(true);
      RNImage.getSize(photoUri, (width, height) => {
        setImageSize({ width, height });
        setLoading(false);
      }, (error) => {
        console.error('Failed to get image size', error);
        setLoading(false);
        Alert.alert('Error', 'Could not load image');
      });
    }
  }, [photoUri]);

  // Gestures
  const panGesture = Gesture.Pan()
    .onChange((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onChange((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const handleSave = async () => {
    if (!imageSize || !photoUri) return;
    setProcessing(true);

    try {
      // Calculate Base Dimensions
      // This must match the render logic below
      let baseWidth, baseHeight;
      if (imageSize.width < imageSize.height) {
        baseWidth = CROP_AREA_SIZE;
        baseHeight = CROP_AREA_SIZE * (imageSize.height / imageSize.width);
      } else {
        baseHeight = CROP_AREA_SIZE;
        baseWidth = CROP_AREA_SIZE * (imageSize.width / imageSize.height);
      }

      const s = scale.value;
      const tx = translateX.value;
      const ty = translateY.value;

      const currentWidthOnScreen = baseWidth * s;
      const factor = imageSize.width / currentWidthOnScreen;

      const imageTL_x = (-baseWidth / 2) * s + tx;
      const imageTL_y = (-baseHeight / 2) * s + ty;

      const cropTL_x = -CROP_AREA_SIZE / 2;
      const cropTL_y = -CROP_AREA_SIZE / 2;

      const diffX = cropTL_x - imageTL_x;
      const diffY = cropTL_y - imageTL_y;

      const originX = Math.max(0, diffX * factor);
      const originY = Math.max(0, diffY * factor);
      const cropW = CROP_AREA_SIZE * factor;
      const cropH = CROP_AREA_SIZE * factor;

      console.log('Cropping:', { originX, originY, cropW, cropH, imageSize });

      const result = await ImageManipulator.manipulateAsync(
        photoUri,
        [{
          crop: {
            originX,
            originY,
            width: cropW,
            height: cropH
          }
        }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setProcessing(false);
      // Navigate back to Camera screen to continue with next steps (Body photos)
      // We pass the cropped avatar back
      navigation.navigate('OnboardingCamera', {
        croppedAvatar: result.uri,
      });

    } catch (error) {
      console.error(error);
      setProcessing(false);
      Alert.alert('Error', 'Failed to crop image');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (loading || !imageSize) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Render logic
  let baseWidth, baseHeight;
  if (imageSize.width < imageSize.height) {
    baseWidth = CROP_AREA_SIZE;
    baseHeight = CROP_AREA_SIZE * (imageSize.height / imageSize.width);
  } else {
    baseHeight = CROP_AREA_SIZE;
    baseWidth = CROP_AREA_SIZE * (imageSize.width / imageSize.height);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.iconButton}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Adjust Photo</Text>
        <TouchableOpacity onPress={() => {
          scale.value = withSpring(1);
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
          savedScale.value = 1;
          savedTranslateX.value = 0;
          savedTranslateY.value = 0;
        }} style={styles.iconButton}>
          <RotateCcw color="#fff" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.editorContainer}>
        {/* The Image */}
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.imageContainer, { width: baseWidth, height: baseHeight }, animatedStyle]}>
            <RNImage
              source={{ uri: photoUri }}
              style={{ width: '100%', height: '100%' }}
            />
          </Animated.View>
        </GestureDetector>

        {/* The Overlay */}
        <View style={styles.overlay} pointerEvents="none">
          {/* Huge border trick for mask */}
          <View style={styles.maskBorder} />
          <View style={styles.cropFrame} />
        </View>

        <Text style={styles.instructionText} pointerEvents="none">
          Pinch to zoom, drag to move
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={processing}>
          {processing ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Check color="#000" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.saveButtonText}>Set Avatar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    zIndex: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageContainer: {
    // sizing handled inline
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  maskBorder: {
    width: CROP_AREA_SIZE,
    height: CROP_AREA_SIZE,
    borderWidth: 2000,
    borderColor: 'rgba(0,0,0,0.8)',
  },
  cropFrame: {
    position: 'absolute',
    width: CROP_AREA_SIZE,
    height: CROP_AREA_SIZE,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  instructionText: {
    position: 'absolute',
    bottom: 20,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  footer: {
    padding: 30,
    paddingBottom: 50,
    alignItems: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
