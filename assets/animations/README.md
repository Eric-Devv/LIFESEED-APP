# Animation Assets

This directory is for Lottie animation JSON files.

## Required Animations

- `success.json` - Success/completion animation
- `loading.json` - Loading animation (optional)
- `celebration.json` - Celebration animation (optional)

## Getting Lottie Animations

1. Visit [LottieFiles](https://lottiefiles.com/)
2. Search for animations (e.g., "success", "checkmark", "celebration")
3. Download JSON files
4. Place them in this directory

## Usage

```typescript
import LottieView from 'lottie-react-native';

<LottieView
  source={require('../../assets/animations/success.json')}
  autoPlay
  loop={false}
/>
```

For now, the app uses custom animated components that don't require Lottie files.
