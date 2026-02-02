import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, PanResponder, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';

interface RouteParams {
  photoUri: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CROWN_SIZE = SCREEN_WIDTH - SPACING.xl * 2;

export default function OnboardingCropScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const { photoUri } = route.params as RouteParams;
  
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const handleConfirm = () => {
    // In a real app, you'd crop the image here
    // For now, just pass the URI with offset info
    navigation.navigate('OnboardingName', { 
      avatarPhoto: photoUri,
      cropOffset: offset 
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adjust your photo</Text>
      <Text style={styles.subtitle}>Move to center your toy</Text>

      <View style={styles.cropContainer}>
        {/* Crop overlay */}
        <View style={styles.cropOverlay}>
          <View style={styles.cropFrame} />
        </View>
        
        {/* Draggable image */}
        <Animated.View 
          style={[
            styles.imageContainer,
            {
              transform: [{ translateX: pan.x }, { translateY: pan.y }]
            }
          ]}
          {...panResponder.panHandlers}
        >
          <Image source={{ uri: photoUri }} style={styles.image} />
        </Animated.View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Retake</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleConfirm}>
          <Text style={styles.buttonText}>Use Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const panResponder = PanResponder.create({
  onStartShouldSetPanResponder: () => true,
  onPanResponderGrant: () => {
    pan.setOffset({
      x: pan.x._value,
      y: pan.y._value
    });
    pan.setValue({ x: 0, y: 0 });
  },
  onPanResponderMove: Animated.event(
    [
      null,
      { dx: pan.x, dy: pan.y }
    ],
    { useNativeDriver: false }
  ),
  onPanResponderRelease: () => {
    pan.flattenOffset();
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  cropContainer: {
    width: CROWN_SIZE,
    height: CROWN_SIZE,
    position: 'relative',
  },
  cropOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cropFrame: {
    width: CROWN_SIZE,
    height: CROWN_SIZE,
    borderWidth: 2,
    borderColor: COLORS.text,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'transparent',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: CROWN_SIZE,
    height: CROWN_SIZE * 1.2, // Slightly larger to allow movement
    resizeMode: 'cover',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.text,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.text,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: COLORS.text,
  },
});
