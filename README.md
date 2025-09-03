# React Native Music App 🎵

A cross-platform music streaming app built with [Expo](https://expo.dev) and React Native, supporting Android, iOS, and web. The project uses file-based routing for modular development and is ready for rapid prototyping and production.

## Features

- User authentication (Google Sign-In)
- Browse, search, and play songs
- Manage playlists and favorites
- Artist profiles and track details
- Floating player and playback controls
- Responsive UI with [NativeWind](https://www.nativewind.dev/) and Tailwind CSS
- Persistent queue and user library
- File-based routing for scalable navigation

## Technologies Used

- React Native & Expo
- TypeScript
- NativeWind (Tailwind CSS for React Native)
- Expo Router
- Redux Toolkit (state management)
- Expo Audio
- Google Sign-In integration

## Project Structure

```
app/                # Main app screens and routing
  (modals)/         # Modal screens
  (tabs)/           # Tab navigation and sub-screens
components/         # Reusable UI components
constants/          # App-wide constants and config
helpers/            # Utility functions
hooks/              # Custom React hooks
services/           # API and business logic
store/              # Redux slices and store
styles/             # Shared styles
types/              # TypeScript type definitions
assets/             # Images, fonts, and Lottie files
```

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npx expo start
   ```

   You can open the app in:
   - Development build
   - Android emulator
   - iOS simulator
   - Expo Go

3. **Edit your app**

   - Main screens are in the `app/` directory.
   - Routing is handled automatically ([learn more](https://docs.expo.dev/router/introduction)).

## Resetting the Project

To start fresh, run:

```bash
npm run reset-project
```

This will archive the current code to `app-example/` and create a blank `app/` directory for new development.

## Development Tips

- Use the `components/` folder for reusable UI elements.
- Store business logic and API calls in `services/`.
- Manage global state with Redux in `store/`.
- Add new screens in `app/` and they will be routed automatically.
- For custom hooks, use the `hooks/` directory.

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Guides](https://docs.expo.dev/guides)
- [Expo Tutorial](https://docs.expo.dev/tutorial/introduction/)
- [NativeWind Docs](https://www.nativewind.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

## Community

- [Expo on GitHub](https://github.com/expo/expo)
- [Expo Discord](https://chat.expo.dev)
