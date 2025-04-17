import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    window.frameworkReady?.();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Stack>
        <Stack.Screen 
          name="(auth)" 
          options={{ headerShown: false }} 
          redirect={isAuthenticated}
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
          redirect={!isAuthenticated}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}