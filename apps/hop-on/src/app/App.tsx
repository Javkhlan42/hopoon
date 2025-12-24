"use client";

import React, { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { RideFeedScreen } from './components/RideFeedScreen';
import { RideSearchScreen } from './components/RideSearchScreen';
import { CreateRideScreen } from './components/CreateRideScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { BookingScreen } from './components/BookingScreen';
import { LiveTrackingScreen } from './components/LiveTrackingScreen';
import ChatScreen from '@/components/ChatScreen';
import { SocketProvider } from '@/context/SocketContext';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

type Screen = 
  | 'home'
  | 'auth' 
  | 'onboarding' 
  | 'feed' 
  | 'search' 
  | 'create' 
  | 'profile' 
  | 'chat' 
  | 'booking'
  | 'tracking';
 
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [userRole, setUserRole] = useState<'driver' | 'passenger'>('passenger');
  const [selectedRideId, setSelectedRideId] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('');

  const handleAuth = () => {
    // Get user info from localStorage (set during login)
    const token = localStorage.getItem('accessToken');
    if (token) {
      // TODO: Decode JWT to get user ID and name
      // For now, use mock data
      setCurrentUserId('user-1');
      setCurrentUserName('Батаа');
    }
    setCurrentScreen('onboarding');
    toast.success('OTP verified successfully!');
  };

  const handleOnboardingComplete = (role: 'driver' | 'passenger') => {
    setUserRole(role);
    setCurrentScreen('feed');
    toast.success(`Welcome to HopOn! You're registered as a ${role}.`);
  };

  const handleJoinRide = (rideId: string) => {
    setSelectedRideId(rideId);
    setCurrentScreen('booking');
  };

  const handleBookingConfirm = () => {
    toast.success('Booking request sent! Waiting for driver approval.');
    setCurrentScreen('feed');
  };

  const handleCreateRide = () => {
    toast.success('Ride created successfully! Your ride is now live.');
    setCurrentScreen('feed');
  };

  const handleChat = (rideId: string) => {
    setSelectedRideId(rideId);
    setCurrentScreen('chat');
  };

  const handleChatBack = () => {
    setCurrentScreen('feed');
  };

  const handleStartTracking = () => {
    setCurrentScreen('tracking');
    toast.success('Trip started! Tracking is now active.');
  };

  const handleSOS = () => {
    toast.error('SOS Alert Sent! Emergency services have been notified.', {
      duration: 5000,
    });
  };

  return (
    <>
      <SocketProvider userId={currentUserId}>
        {currentScreen === 'home' && (
          <HomeScreen 
            onSignIn={() => setCurrentScreen('auth')}
            onSignUp={() => setCurrentScreen('onboarding')}
            onSearch={() => setCurrentScreen('search')}
          />
        )}

        {currentScreen === 'auth' && (
          <AuthScreen onAuth={handleAuth} />
        )}

        {currentScreen === 'onboarding' && (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        )}

        {currentScreen === 'feed' && (
          <RideFeedScreen
            userRole={userRole}
            onCreateRide={() => setCurrentScreen('create')}
            onSearchRide={() => setCurrentScreen('search')}
            onJoinRide={handleJoinRide}
            onChat={handleChat}
            onProfile={() => setCurrentScreen('profile')}
            onStartTracking={handleStartTracking}
          />
        )}

        {currentScreen === 'search' && (
          <RideSearchScreen
            onBack={() => setCurrentScreen('feed')}
            onJoinRide={handleJoinRide}
            onChat={handleChat}
          />
        )}

        {currentScreen === 'create' && (
          <CreateRideScreen
            onBack={() => setCurrentScreen('feed')}
            onCreateRide={handleCreateRide}
          />
        )}

        {currentScreen === 'profile' && (
          <ProfileScreen onBack={() => setCurrentScreen('feed')} />
        )}

        {currentScreen === 'chat' && (
          <ChatScreen
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            onBack={handleChatBack}
          />
        )}

        {currentScreen === 'booking' && (
          <BookingScreen
            onBack={() => setCurrentScreen('feed')}
            onConfirm={handleBookingConfirm}
            rideId={selectedRideId}
          />
        )}

        {currentScreen === 'tracking' && (
          <LiveTrackingScreen
            onBack={() => setCurrentScreen('feed')}
            onSOS={handleSOS}
          />
        )}

        <Toaster position="top-center" richColors />
      </SocketProvider>
    </>
  );
}