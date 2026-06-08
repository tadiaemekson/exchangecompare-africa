import React from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardScreen from './dashboard';
import AuthScreen from './auth';

export default function ProfileScreen() {
  const { token } = useAuth();

  if (token) {
    return <DashboardScreen />;
  }

  return <AuthScreen />;
}
