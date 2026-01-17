import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro - 375x812)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

/**
 * Scale based on screen width
 */
export const scale = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scale based on screen height
 */
export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Moderate scale - combines width and height scaling
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Get responsive font size
 */
export const getFontSize = (size: number): number => {
  return moderateScale(size, 0.3);
};

/**
 * Check if device is tablet
 */
export const isTablet = (): boolean => {
  return SCREEN_WIDTH >= 768;
};

/**
 * Check if device is small screen
 */
export const isSmallScreen = (): boolean => {
  return SCREEN_WIDTH < 375;
};

/**
 * Get card width based on screen size
 */
export const getCardWidth = (): number => {
  if (isTablet()) {
    return SCREEN_WIDTH * 0.45;
  }
  return SCREEN_WIDTH - 32; // Full width minus padding
};

/**
 * Get number of columns for grid layouts
 */
export const getColumns = (): number => {
  if (isTablet()) {
    return 2;
  }
  return 1;
};

/**
 * Get responsive padding
 */
export const getPadding = (): number => {
  if (isTablet()) {
    return 24;
  }
  return 16;
};

/**
 * Get responsive margin
 */
export const getMargin = (): number => {
  if (isTablet()) {
    return 20;
  }
  return 16;
};

export { SCREEN_WIDTH, SCREEN_HEIGHT };
