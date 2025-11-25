# CareNotely Mobile Documentation

## Overview
CareNotely Mobile is the companion mobile application for the CareNotely platform, designed for care workers to view shifts, record observations, and manage their schedule.

## Technology Stack
- **Framework**: React Native (via Expo)
- **Routing**: Expo Router
- **Language**: TypeScript
- **Styling**: React Native StyleSheet (Standard)
- **Storage**: `expo-secure-store`
- **Icons**: `@expo/vector-icons`

## Project Structure

```
/
├── app/                 # Expo Router screens and layouts
│   ├── _layout.tsx      # Root layout and navigation config
│   ├── index.tsx        # Entry point (redirects to login)
│   ├── login.tsx        # Login screen
│   ├── dashboard.tsx    # Main dashboard (protected)
│   └── signup.tsx       # Placeholder signup screen
├── lib/                 # Shared utilities and services
│   ├── api.ts           # Base API client
│   ├── auth.ts          # Authentication service
│   └── storage.ts       # Secure token storage
├── .env                 # Environment variables
└── package.json         # Dependencies
```

## Authentication

The app uses a token-based authentication system integrated with the CareNotely backend (Better Auth).

### Flow
1.  User enters credentials on `login.tsx`.
2.  `auth.signIn()` calls the backend API (`/api/auth/sign-in/email`).
3.  On success, the session token is stored securely using `expo-secure-store`.
4.  User is redirected to `dashboard.tsx`.
5.  Subsequent API requests in `lib/api.ts` automatically attach the `Authorization: Bearer <token>` header.

### Security
- **Token Storage**: Tokens are stored in the device's secure keychain/keystore, not in plain text or async storage.
- **Origin Header**: The app sends an `Origin` header (configured via env var) to satisfy backend CORS/CSRF requirements.

## Configuration

The app uses environment variables for configuration.

### `.env` File
Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=https://carenotely.vercel.app
```

- `EXPO_PUBLIC_API_URL`: The base URL for the backend API.

## Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start the App**:
    ```bash
    npx expo start
    ```

## Deployment

### Environment Variables
When building for production (EAS Build), ensure the environment variables are set in your EAS configuration or build secrets. The `.env` file is not bundled; the values are read at build time.

### Android/iOS
- The app is compatible with standard Expo build workflows (`eas build`).

## Performance Best Practices

To ensure the app remains fast and responsive, we follow these guidelines:

1.  **Render Optimization**:
    - Use `React.memo` for components that receive the same props frequently but don't need to re-render.
    - Use `useCallback` and `useMemo` to prevent unnecessary calculation and function recreation on every render.

2.  **List Performance**:
    - Always use `FlatList` or `SectionList` for long lists.
    - Implement `getItemLayout` where possible to skip measurement calculations.
    - Use `windowSize` and `initialNumToRender` to optimize memory usage.

3.  **Image Optimization**:
    - Use `expo-image` for caching and optimized image loading.
    - properly size images before bundling or serving them.

4.  **Network**:
    - Prefetch data where appropriate.
    - Use efficient caching strategies (e.g., React Query or SWR) for API responses.

