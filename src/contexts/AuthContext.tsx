import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [inactivityTimeout, setInactivityTimeout] = useState<NodeJS.Timeout | null>(null);

  // Session timeout settings (in milliseconds)
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  const INACTIVITY_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours

  const clearTimeouts = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
    if (inactivityTimeout) {
      clearTimeout(inactivityTimeout);
      setInactivityTimeout(null);
    }
  };

  const setupTimeouts = () => {
    clearTimeouts();

    // Set session timeout (absolute timeout)
    const sessionTimer = setTimeout(() => {
      logout();
      alert('Your session has expired. Please log in again.');
    }, SESSION_TIMEOUT);
    setSessionTimeout(sessionTimer);

    // Set inactivity timeout
    const inactivityTimer = setTimeout(() => {
      logout();
      alert('You have been logged out due to inactivity.');
    }, INACTIVITY_TIMEOUT);
    setInactivityTimeout(inactivityTimer);
  };

  const resetInactivityTimeout = () => {
    if (user && inactivityTimeout) {
      clearTimeout(inactivityTimeout);
      const inactivityTimer = setTimeout(() => {
        logout();
        alert('You have been logged out due to inactivity.');
      }, INACTIVITY_TIMEOUT);
      setInactivityTimeout(inactivityTimer);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);

      // Use the verify_admin_login function
      const { data, error } = await supabase
        .rpc('verify_admin_login', {
          p_email: email,
          p_password: password
        });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Login failed. Please try again.' };
      }

      if (data.success) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role
        };

        setUser(userData);
        setupTimeouts();

        // Store user data in localStorage for persistence
        localStorage.setItem('admin_user', JSON.stringify(userData));
        localStorage.setItem('login_time', Date.now().toString());

        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.message || 'Invalid credentials' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    clearTimeouts();
    localStorage.removeItem('admin_user');
    localStorage.removeItem('login_time');
    window.location.href = '/secure-mgmt-portal-x7f9q2/login';
  };

  const checkSession = () => {
    const storedUser = localStorage.getItem('admin_user');
    const loginTime = localStorage.getItem('login_time');

    if (storedUser && loginTime) {
      const loginTimestamp = parseInt(loginTime);
      const currentTime = Date.now();
      const sessionAge = currentTime - loginTimestamp;

      // Check if session has expired
      if (sessionAge > SESSION_TIMEOUT) {
        logout();
        alert('Your session has expired. Please log in again.');
        return;
      }

      // Restore user session
      const userData = JSON.parse(storedUser);
      setUser(userData);

      // Setup timeouts for remaining session time
      const remainingSessionTime = SESSION_TIMEOUT - sessionAge;
      const sessionTimer = setTimeout(() => {
        logout();
        alert('Your session has expired. Please log in again.');
      }, remainingSessionTime);
      setSessionTimeout(sessionTimer);

      // Setup inactivity timeout
      const inactivityTimer = setTimeout(() => {
        logout();
        alert('You have been logged out due to inactivity.');
      }, INACTIVITY_TIMEOUT);
      setInactivityTimeout(inactivityTimer);
    }
  };

  useEffect(() => {
    checkSession();
    setLoading(false);

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const resetTimer = () => {
      resetInactivityTimeout();
    };

    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    return () => {
      clearTimeouts();
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};