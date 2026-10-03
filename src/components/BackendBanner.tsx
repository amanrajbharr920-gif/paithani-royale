import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';

export default function BackendBanner() {
  const { backendOnline, user, isLoggedIn, isAdmin, logout, recheckHealth } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const baseUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

  return null;
}