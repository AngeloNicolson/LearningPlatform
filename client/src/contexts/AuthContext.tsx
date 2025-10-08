import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigation } from './NavigationContext';
import { setGlobalLogoutCallback } from '../utils/authFetch';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  accountStatus: string;
  parentId?: number | null;
  needsOnboarding?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userRole: string;
  accountStatus: string;
  parentId: number | null;
  userId: number | null;
  userName: string;
  needsOnboarding: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigation = useNavigation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('personal');
  const [accountStatus, setAccountStatus] = useState<string>('active');
  const [parentId, setParentId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:3777/api'}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear all state
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setUserRole('personal');
    setAccountStatus('active');
    setParentId(null);
    setUserId(null);
    setUserName('');
    setNeedsOnboarding(false);
    navigation.navigate({ view: 'home' });
  };

  // Check for existing session on mount
  useEffect(() => {
    // Register global logout callback for authFetch
    setGlobalLogoutCallback(logout);

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAuthenticated(true);
        setUserRole(userData.role || 'personal');
        setAccountStatus(userData.accountStatus || 'active');
        setParentId(userData.parentId || null);
        setUserId(userData.id || null);
        setUserName(`${userData.firstName || ''} ${userData.lastName || ''}`);
        setNeedsOnboarding(userData.needsOnboarding || false);
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setUserRole(userData.role || 'personal');
    setAccountStatus(userData.accountStatus || 'active');
    setParentId(userData.parentId || null);
    setUserId(userData.id || null);
    setUserName(`${userData.firstName || ''} ${userData.lastName || ''}`);
    setNeedsOnboarding(userData.needsOnboarding || false);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));

    // Check if tutor needs onboarding
    if (userData.role === 'tutor' && userData.needsOnboarding) {
      navigation.navigate({ view: 'onboarding' });
    } else {
      navigation.navigate({ view: 'dashboard' });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        userRole,
        accountStatus,
        parentId,
        userId,
        userName,
        needsOnboarding,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
