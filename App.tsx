import { useEffect } from 'react';
import { useColorScheme, ActivityIndicator, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import HomeScreen from './src/screens/HomeScreen';
import AuthScreen from './src/screens/Auth/AuthScreen';
import OnboardingCameraScreen from './src/screens/Onboarding/OnboardingCameraScreen';
import OnboardingNameScreen from './src/screens/Onboarding/OnboardingNameScreen';
import OnboardingProfileScreen from './src/screens/Onboarding/OnboardingProfileScreen';
import { COLORS } from './src/constants';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

function RootNavigation() {
  const { session, loading } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.text} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surface,
          },
          headerTintColor: isDark ? COLORS.textDark : COLORS.text,
          headerBackTitleVisible: false,
        }}
      >
        {session ? (
          <>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="OnboardingCamera" 
              component={OnboardingCameraScreen}
              options={{ title: 'Take Photo', headerShown: false }}
            />
            <Stack.Screen 
              name="OnboardingName" 
              component={OnboardingNameScreen}
              options={{ title: 'Name Your Pal', headerShown: false }}
            />
            <Stack.Screen 
              name="OnboardingProfile" 
              component={OnboardingProfileScreen}
              options={{ title: 'Customize Personality', headerShown: false }}
            />
          </>
        ) : (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootNavigation />
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
