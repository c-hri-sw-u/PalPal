import 'dotenv/config';

// Helper to parse boolean environment variables
const parseBool = (value, defaultValue) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }
    return defaultValue;
};

export default {
    expo: {
        name: 'PalPal',
        slug: 'PalPal',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/icon.png',
        userInterfaceStyle: 'light',
        newArchEnabled: parseBool(process.env.NEW_ARCH_ENABLED, true),
        splash: {
            image: './assets/splash-icon.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff'
        },
        ios: {
            supportsTablet: true
        },
        android: {
            adaptiveIcon: {
                foregroundImage: './assets/adaptive-icon.png',
                backgroundColor: '#ffffff'
            },
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false
        },
        web: {
            favicon: './assets/favicon.png'
        },
        extra: {
            supabaseUrl: process.env.SUPABASE_URL || '',
            supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
            openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
            nanoApiKey: process.env.NANO_API_KEY || '',
        },
        hooks: {
            postPublish: [
                {
                    file: 'sentry-expo/upload-sourcemaps',
                    config: {
                        organization: process.env.SENTRY_ORG,
                        project: process.env.SENTRY_PROJECT,
                    },
                },
            ],
        },
    },
};
