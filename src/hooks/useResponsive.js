import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design utilities
 * Provides mobile detection and screen size information
 */
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
    isSmallMobile: window.innerWidth < 480,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isSmallMobile: width < 480,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Initial check
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

/**
 * Hook for detecting if user is on a touch device
 */
export const useTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouchDevice();
  }, []);

  return isTouchDevice;
};

/**
 * Hook for managing mobile-specific behaviors
 */
export const useMobileBehavior = () => {
  const { isMobile, isSmallMobile } = useResponsive();
  const isTouchDevice = useTouchDevice();

  const getEmojiPickerSize = () => {
    if (isSmallMobile) return { width: 260, height: 320 };
    if (isMobile) return { width: 280, height: 350 };
    return { width: 350, height: 400 };
  };

  const getModalSize = () => {
    if (isSmallMobile) return 'w-full h-full';
    if (isMobile) return 'w-11/12 max-h-[90vh]';
    return 'w-96 max-h-[80vh]';
  };

  const shouldShowMobileLayout = isMobile;

  return {
    isMobile,
    isSmallMobile,
    isTouchDevice,
    shouldShowMobileLayout,
    getEmojiPickerSize,
    getModalSize,
  };
};

export default useResponsive;
