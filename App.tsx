import { useEffect } from 'react';
import { useColorScheme, ActivityIndicator, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './src/hooks/useAuth';
import HomeScreen from './src/screens/HomeScreen';
import AuthScreen from './src/screens/Auth/AuthScreen';
import OnboardingCameraScreen from './src/screens/Onboarding/OnboardingCameraScreen';
import OnboardingCropScreen from './src/screens/Onboarding/OnboardingCropScreen';
import OnboardingNameScreen from './src/screens/Onboarding/OnboardingNameScreen';
import OnboardingProfileScreen from './src/screens/Onboarding/OnboardingProfileScreen';
import { COLORS } from './src/constants';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

// [DEBUG] Network Connectivity Test
import { supabase } from './src/lib/supabase';

// Helper for timeout
const fetchWithTimeout = async (resource: string, options: any = {}) => {
  const { timeout = 5000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

function NetworkTest() {
  useEffect(() => {
    const testConnection = async () => {
      console.log('--- STARTING NETWORK TEST (v2) ---');
      console.log('Is URL defined?', typeof URL !== 'undefined');
      console.log('Is URLSearchParams defined?', typeof URLSearchParams !== 'undefined');

      try {
        console.log('Pinging Google...');
        const google = await fetchWithTimeout('https://www.google.com', { method: 'HEAD', timeout: 3000 });
        console.log('Google Reachable:', google.status);
      } catch (e: any) {
        console.error('Google Unreachable:', e.message || e);
      }

      try {
        console.log('Pinging JSONPlaceholder...');
        // Test a known working public JSON API
        const json = await fetchWithTimeout('https://jsonplaceholder.typicode.com/todos/1', { method: 'GET', timeout: 5000 });
        console.log('JSONPlaceholder Reachable:', json.status);
      } catch (e: any) {
        console.error('JSONPlaceholder Unreachable:', e.message || e);
      }

      try {
        console.log('Pinging Supabase.com (Main Site)...');
        const sbMain = await fetchWithTimeout('https://supabase.com', { method: 'GET', timeout: 5000 });
        console.log('Supabase.com Reachable:', sbMain.status);
      } catch (e: any) {
        console.error('Supabase.com Unreachable:', e.message || e);
      }

      try {
        const sbUrl = 'https://ybbyyuxdjxwfxreiwjkq.supabase.co';
        console.log(`Pinging Project URL: '${sbUrl}'...`);
        const sb = await fetchWithTimeout(sbUrl, { method: 'GET', timeout: 5000 });
        console.log('Project URL Reachable:', sb.status);
        const text = await sb.text();
        console.log('Project URL Body Length:', text.length);
      } catch (e: any) {
        console.error('Project URL Unreachable:', e.message || e);
        // Log detailed error info if available
        if (e.cause) console.log('Error Cause:', JSON.stringify(e.cause));
        console.log('Error JSON:', JSON.stringify(e));
        if (e.name === 'AbortError') {
          console.error('Request timed out - check simulator network/DNS');
        }
      }

      try {
        console.log('Testing Supabase Client...');
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) console.error('Supabase Client Error:', error);
        else console.log('Supabase Client Success (count):', data);
      } catch (e: any) {
        console.error('Supabase Client Exception:', e.message || e);
      }

      console.log('--- END NETWORK TEST ---');
    };
    testConnection();
  }, []);
  return null;
}

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
              name="OnboardingCrop"
              component={OnboardingCropScreen}
              options={{ title: 'Crop Photo', headerShown: false }}
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
          <NetworkTest />
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootNavigation />
          </GestureHandlerRootView>
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
