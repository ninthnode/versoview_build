"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyUser } from "@/redux/auth/authActions";
import { useRouter, usePathname } from "next/navigation";
import { ProtectedRoutes, AuthRoutes, PublicRoutes } from "@/routes/index";
import Loader from "@/components/Loader";
import { setPostEdit } from "@/redux/posts/postActions";
import { Image, Flex } from '@chakra-ui/react';

// Constants
const SPLASH_DURATION = 3000;
const BLINK_INTERVAL = 1000;
const LOADER_IMAGES = ["/assets/loader1.png", "/assets/loader2.png"];
const VERIFY_EXCEPTION_ROUTES = ["/home", "/channel"];

// Global flag to track if splash has been shown
let hasShownSplash = false;

// Custom hook for blinking animation
const useBlinkingLoader = () => {
  const [blinkIndex, setBlinkIndex] = useState(0);
  
  useEffect(() => {
    const blinkTimer = setInterval(() => {
      setBlinkIndex(prev => (prev === 0 ? 1 : 0));
    }, BLINK_INTERVAL);
    
    return () => clearInterval(blinkTimer);
  }, []);
  
  return blinkIndex;
};

// Custom hook for splash screen timing - only on first load
const useSplashScreen = () => {
  const [showSplash, setShowSplash] = useState(() => !hasShownSplash);
  const [delay, setDelay] = useState(() => !hasShownSplash);
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    // Only show splash if it hasn't been shown before
    if (!hasShownSplash) {
      hasShownSplash = true; // Mark as shown immediately
      
      timeoutRef.current = setTimeout(() => {
        setShowSplash(false);
        setDelay(false);
      }, SPLASH_DURATION);
    } else {
      // If splash has been shown before, immediately set to false
      setShowSplash(false);
      setDelay(false);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return { showSplash, delay };
};

// Route checking utilities
const routeUtils = {
  isAuthRoute: (path) => AuthRoutes.some(route => path === route.url),
  isProtectedRoute: (path) => ProtectedRoutes.some(route => path.startsWith(route.url)),
  isPublicRoute: (path) => PublicRoutes.some(route => path.startsWith(route.url)),
  isVerifyExceptionRoute: (path) => VERIFY_EXCEPTION_ROUTES.some(route => path.startsWith(route))
};

// Splash Screen Component
const SplashScreen = ({ blinkIndex }) => (
  <Flex
    h="100vh"
    zIndex="9999"
    pos="fixed"
    top={0}
    left={0}
    right={0}
    justifyContent="center"
    alignItems="center"
    bg="#0D1627"
    flexDir="column"
  >
    <Image 
      src={LOADER_IMAGES[blinkIndex]} 
      alt="preloader logo" 
      objectFit="cover" 
      height="250px" 
      width="250px" 
    />
  </Flex>
);

const PrivateRoute = ({ children }) => {
  // State management
  const [authState, setAuthState] = useState({
    userVerified: false,
    userRedirecting: false,
    loading: true,
    initialCheck: false // Track if initial auth check is complete
  });
  
  // Redux and routing
  const stateUser = useSelector(state => state.auth.user?.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const path = usePathname();
  
  // Custom hooks
  const { showSplash, delay } = useSplashScreen();
  const blinkIndex = useBlinkingLoader();
  
  // Navigation handlers
  const navigateToHome = useCallback(() => {
    router.push("/home");
    setAuthState(prev => ({ ...prev, userRedirecting: true }));
  }, [router]);
  
  const navigateToLogin = useCallback(() => {
    router.push("/login");
  }, [router]);
  
  // Authentication logic
  const handleAuthentication = useCallback(async () => {
    try {
      let user = stateUser;
      
      // Handle publish route
      if (path === "/publish") {
        await dispatch(setPostEdit(false, ""));
      }
      
      // Check if this is an auth route (login/register)
      if (routeUtils.isAuthRoute(path)) {
        if (!user) {
          // Try to verify user first for auth routes, but don't wait too long
          try {
            const response = await dispatch(verifyUser());
            user = response?.user;
            
            if (user) {
              // User is actually authenticated, redirect to home
              setAuthState(prev => ({ 
                ...prev, 
                initialCheck: true,
                userRedirecting: true 
              }));
              navigateToHome();
              return;
            }
          } catch (error) {
            // If verification fails, treat as unauthenticated
            console.log('User verification failed, treating as unauthenticated');
          }
          
          // Unauthenticated user accessing auth routes - allow it
          setAuthState(prev => ({ 
            ...prev, 
            loading: false, 
            initialCheck: true 
          }));
          return;
        } else {
          // Already authenticated user trying to access auth routes - redirect to home
          setAuthState(prev => ({ 
            ...prev, 
            initialCheck: true,
            userRedirecting: true 
          }));
          navigateToHome();
          return;
        }
      }
      
      // For protected routes - check token/storage first before API call
      if (routeUtils.isProtectedRoute(path) && !routeUtils.isPublicRoute(path)) {
        // Check if we have any authentication indicators (token, etc.)
        const hasAuthToken = typeof window !== 'undefined' && 
          (localStorage.getItem('token') || sessionStorage.getItem('token') || 
           localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
        
        if (!user && !hasAuthToken) {
          // No user and no token - immediately redirect
          setAuthState(prev => ({ 
            ...prev, 
            loading: false, 
            initialCheck: true,
            userRedirecting: true 
          }));
          navigateToLogin();
          return;
        }
      }
      
      // Verify user if not already authenticated
      if (!user) {
        const response = await dispatch(verifyUser());
        user = response?.user;
        
        // Check again after verification for protected routes
        if (!user && routeUtils.isProtectedRoute(path) && !routeUtils.isPublicRoute(path)) {
          setAuthState(prev => ({ 
            ...prev, 
            loading: false, 
            initialCheck: true,
            userRedirecting: true 
          }));
          navigateToLogin();
          return;
        }
      }
      
      // Set verification state
      if (user) {
        setAuthState(prev => ({ 
          ...prev, 
          userVerified: true, 
          initialCheck: true 
        }));
      } else {
        setAuthState(prev => ({ 
          ...prev, 
          initialCheck: true 
        }));
      }
      
    } catch (error) {
      console.error('Authentication error:', error);
      // On error, redirect to login for protected routes
      if (routeUtils.isProtectedRoute(path) && !routeUtils.isPublicRoute(path)) {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          initialCheck: true,
          userRedirecting: true 
        }));
        navigateToLogin();
      } else {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          initialCheck: true 
        }));
      }
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, [stateUser, path, dispatch, navigateToHome, navigateToLogin]);
  
  // Effect for authentication
  useEffect(() => {
    handleAuthentication();
  }, [handleAuthentication]);
  
  // Render logic
  const shouldShowChildren = () => {
    const { userVerified, loading, userRedirecting, initialCheck } = authState;
    
    // Don't render children until initial check is complete
    if (!initialCheck) {
      return false;
    }
    
    // Don't render if redirecting
    if (userRedirecting) {
      return false;
    }
    
    // Auth routes (login/register) - show when loading is complete
    if (routeUtils.isAuthRoute(path)) {
      return !loading;
    }
    
    // Messages route exception
    if (path === '/messages') {
      return !loading;
    }
    
    // Exception routes with splash screen check
    if (routeUtils.isVerifyExceptionRoute(path) && !showSplash) {
      return true;
    }
    
    // For protected routes, only show if user is verified
    if (routeUtils.isProtectedRoute(path) && !routeUtils.isPublicRoute(path)) {
      return userVerified && !loading;
    }
    
    // For public routes, show after loading is complete
    if (routeUtils.isPublicRoute(path)) {
      return !loading;
    }
    
    // Standard authentication check
    return userVerified && !loading && !delay;
  };
  
  // Render component
  if (shouldShowChildren()) {
    return children;
  }
  
  // Show splash screen or loader
  if (showSplash) {
    return <SplashScreen blinkIndex={blinkIndex} />;
  }
  
  return <Loader messages={null} showtext={false} />;
};

export default PrivateRoute;