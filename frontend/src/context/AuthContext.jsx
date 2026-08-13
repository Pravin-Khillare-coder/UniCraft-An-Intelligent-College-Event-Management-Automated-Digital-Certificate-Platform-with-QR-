import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const getApiUrl = () => {
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://${hostname}:5000/api`;
  }
  return '/api';
};

export const API_URL = getApiUrl();

// Set up default axios base URL
axios.defaults.baseURL = API_URL;

// Initial mock user accounts for static deployments (GitHub Pages)
const MOCK_USERS = [
  {
    _id: 'jpb2pb0lm',
    name: 'Admin User',
    email: 'admin@gmail.com',
    password: 'admin123',
    role: 'admin',
    profile: {
      department: 'Administration',
      rollNumber: 'ADM-001',
      phone: '+15550100',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  },
  {
    _id: 'jpb2pb0lm2',
    name: 'Admin User',
    email: 'admin@college.edu',
    password: 'admin123',
    role: 'admin',
    profile: {
      department: 'Administration',
      rollNumber: 'ADM-001',
      phone: '+15550100',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  },
  {
    _id: '9500su4st',
    name: 'Rachana Jambhulkar',
    email: 'rachana@gmail.com',
    password: 'student123',
    role: 'student',
    profile: {
      department: 'Computer Science',
      rollNumber: 'CS-2023-042',
      phone: '+15550199',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    badges: ['First Code', 'Event Explorer']
  },
  {
    _id: '9500su4st2',
    name: 'Rachana Jambhulkar',
    email: 'rachana.j@example.com',
    password: 'student123',
    role: 'student',
    profile: {
      department: 'Computer Science',
      rollNumber: 'CS-2023-042',
      phone: '+15550199',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    badges: ['First Code', 'Event Explorer']
  },
  {
    _id: 'bl61pkcf8',
    name: 'Aman Verma',
    email: 'aman.v@example.com',
    password: 'student123',
    role: 'student',
    profile: {
      department: 'Information Technology',
      rollNumber: 'IT-2023-110',
      phone: '+15550188',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    badges: ['Code Warrior']
  }
];

// Global Shared Cloud Database for cross-device synchronization (GitHub Pages live demo)
const GLOBAL_CLOUD_DB_URL = 'https://jsonblob.com/api/jsonBlob/019ff0ea-d1f0-725e-8e79-77293504a5dd';

const fetchCloudProfiles = async () => {
  try {
    const res = await fetch(GLOBAL_CLOUD_DB_URL);
    if (!res.ok) return {};
    const data = await res.json();
    return data.users || {};
  } catch (e) {
    console.error('Cloud DB fetch error:', e);
    return {};
  }
};

const saveCloudProfile = async (userObj) => {
  if (!userObj || !userObj.email) return;
  try {
    const emailKey = userObj.email.toLowerCase();
    const currentUsers = await fetchCloudProfiles();
    const existing = currentUsers[emailKey] || {};

    const merged = {
      ...existing,
      ...userObj,
      profile: {
        ...(existing.profile || {}),
        ...(userObj.profile || {})
      }
    };

    currentUsers[emailKey] = merged;
    await fetch(GLOBAL_CLOUD_DB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: currentUsers })
    });
    localStorage.setItem('app_user_profiles', JSON.stringify(currentUsers));
  } catch (e) {
    console.error('Cloud DB update error:', e);
  }
};

// Persistent storage helpers for offline/static deployment mode
const getPersistentProfiles = () => {
  try {
    const data = localStorage.getItem('app_user_profiles');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

const savePersistentProfile = (userObj) => {
  if (!userObj || !userObj.email) return;
  try {
    const emailKey = userObj.email.toLowerCase();
    const profiles = getPersistentProfiles();
    const existing = profiles[emailKey] || {};

    const merged = {
      ...existing,
      ...userObj,
      profile: {
        ...(existing.profile || {}),
        ...(userObj.profile || {})
      }
    };

    profiles[emailKey] = merged;
    localStorage.setItem('app_user_profiles', JSON.stringify(profiles));
    // Asynchronously sync to global cloud database for cross-device visibility!
    saveCloudProfile(merged);
  } catch (e) {
    console.error('Error saving persistent profile:', e);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Welcome to EventHub! Explore upcoming seminars and hackathons.', read: false, time: 'Just now' },
    { id: 2, message: 'Your attendance for AI/ML Workshop has been verified as Present!', read: false, time: '2 hours ago' }
  ]);

  // Interceptor to attach JWT token to all requests
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [token]);

  // Load user data on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        // Fast path for mock static tokens
        const cachedMock = localStorage.getItem('mockUser');
        if (token.startsWith('mock_jwt_token_') && cachedMock) {
          try {
            const parsed = JSON.parse(cachedMock);
            const cloudProfiles = await fetchCloudProfiles();
            const persistentProfiles = getPersistentProfiles();
            const savedProfile = cloudProfiles[parsed.email?.toLowerCase()] || persistentProfiles[parsed.email?.toLowerCase()];
            const merged = savedProfile ? {
              ...parsed,
              ...savedProfile,
              profile: {
                ...(parsed.profile || {}),
                ...(savedProfile.profile || {})
              }
            } : parsed;

            setUser(merged);
            setLoading(false);
            return;
          } catch (e) {
            console.error('Error parsing mockUser:', e);
          }
        }

        try {
          const res = await axios.get('/auth/me');
          if (res.data) {
            const cleanEmail = res.data.email?.toLowerCase();
            const persistentProfiles = getPersistentProfiles();
            const savedProfile = persistentProfiles[cleanEmail];
            const merged = savedProfile ? {
              ...res.data,
              ...savedProfile,
              profile: {
                ...(res.data.profile || {}),
                ...(savedProfile.profile || {})
              }
            } : res.data;

            setUser(merged);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          if (cachedMock) {
            try {
              const parsed = JSON.parse(cachedMock);
              const cloudProfiles = await fetchCloudProfiles();
              const persistentProfiles = getPersistentProfiles();
              const savedProfile = cloudProfiles[parsed.email?.toLowerCase()] || persistentProfiles[parsed.email?.toLowerCase()];
              const merged = savedProfile ? {
                ...parsed,
                ...savedProfile,
                profile: {
                  ...(parsed.profile || {}),
                  ...(savedProfile.profile || {})
                }
              } : parsed;

              setUser(merged);
            } catch (e) {
              logout();
            }
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      
      const cleanEmail = (email || '').trim().toLowerCase();
      const persistentProfiles = getPersistentProfiles();
      const savedProfileUser = persistentProfiles[cleanEmail];
      const mergedUser = savedProfileUser ? {
        ...res.data.user,
        ...savedProfileUser,
        profile: {
          ...(res.data.user?.profile || {}),
          ...(savedProfileUser.profile || {})
        }
      } : res.data.user;

      setUser(mergedUser);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      // If backend responded with 400/401 status, return error response message
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        return {
          success: false,
          message: error.response?.data?.message || 'Invalid email or password'
        };
      }

      // Offline/network fallback for GitHub Pages live demo
      const cleanEmail = (email || '').trim().toLowerCase();
      const storedUsersJSON = localStorage.getItem('app_users');
      const customUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
      const allUsers = [...MOCK_USERS, ...customUsers];

      const foundUser = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
      if (foundUser && foundUser.password === password) {
        const mockToken = 'mock_jwt_token_' + foundUser._id;
        
        // Merge persistent saved profile changes across all devices & logouts
        const cloudProfiles = await fetchCloudProfiles();
        const persistentProfiles = getPersistentProfiles();
        const savedProfileUser = cloudProfiles[cleanEmail] || persistentProfiles[cleanEmail];
        
        const userObj = {
          ...foundUser,
          ...(savedProfileUser || {}),
          profile: {
            ...(foundUser.profile || {}),
            ...((savedProfileUser && savedProfileUser.profile) || {})
          }
        };
        delete userObj.password;

        localStorage.setItem('token', mockToken);
        localStorage.setItem('mockUser', JSON.stringify(userObj));
        setToken(mockToken);
        setUser(userObj);
        return { success: true };
      }

      return {
        success: false,
        message: 'Invalid email or password'
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/signup', userData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.user) {
        savePersistentProfile(res.data.user);
      }
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error creating account. Try again.'
        };
      }

      // Offline fallback signup for static hosting
      const newUser = {
        _id: 'user_' + Date.now(),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'student',
        profile: {
          department: userData.department || '',
          rollNumber: userData.rollNumber || '',
          phone: userData.phone || ''
        }
      };

      const storedUsersJSON = localStorage.getItem('app_users');
      const customUsers = storedUsersJSON ? JSON.parse(storedUsersJSON) : [];
      customUsers.push(newUser);
      localStorage.setItem('app_users', JSON.stringify(customUsers));

      const mockToken = 'mock_jwt_token_' + newUser._id;
      const userObj = { ...newUser };
      delete userObj.password;

      localStorage.setItem('token', mockToken);
      localStorage.setItem('mockUser', JSON.stringify(userObj));
      savePersistentProfile(userObj);
      setToken(mockToken);
      setUser(userObj);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (googleData) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/google-login', googleData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      if (res.data.user) {
        savePersistentProfile(res.data.user);
      }
      return { success: true };
    } catch (error) {
      console.error('Google login error:', error);
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        return {
          success: false,
          message: error.response?.data?.message || 'Google Auth failed'
        };
      }

      // Offline fallback Google Login for static hosting
      const cleanEmail = (googleData.email || 'student.google@gmail.com').trim().toLowerCase();
      const persistentProfiles = getPersistentProfiles();
      const savedProfileUser = persistentProfiles[cleanEmail];

      const googleUser = savedProfileUser || {
        _id: 'g_' + Date.now(),
        name: googleData.name || 'Google Student',
        email: cleanEmail,
        role: 'student',
        profile: {
          department: 'Computer Science',
          avatar: googleData.avatar
        }
      };

      const mockToken = 'mock_jwt_token_' + googleUser._id;
      localStorage.setItem('token', mockToken);
      localStorage.setItem('mockUser', JSON.stringify(googleUser));
      savePersistentProfile(googleUser);
      setToken(mockToken);
      setUser(googleUser);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    // 1. Build updated profile object immediately from current user & new profile data
    const updated = {
      ...user,
      name: profileData.name !== undefined && profileData.name !== '' ? profileData.name : user?.name,
      profile: {
        ...(user?.profile || {}),
        department: profileData.department !== undefined ? profileData.department : user?.profile?.department,
        rollNumber: profileData.rollNumber !== undefined ? profileData.rollNumber : user?.profile?.rollNumber,
        phone: profileData.phone !== undefined ? profileData.phone : user?.profile?.phone,
        avatar: profileData.avatar !== undefined && profileData.avatar !== '' ? profileData.avatar : user?.profile?.avatar
      }
    };

    // 2. Unconditionally update active state, local storage & cloud persistence
    setUser(updated);
    localStorage.setItem('mockUser', JSON.stringify(updated));
    savePersistentProfile(updated);

    // 3. Send update to API endpoint if server is live
    try {
      const res = await axios.put('/auth/profile', profileData);
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('mockUser', JSON.stringify(res.data));
        savePersistentProfile(res.data);
      }
    } catch (error) {
      console.log('API profile update note:', error.message);
    }

    return { success: true };
  };

  const addNotification = (message) => {
    setNotifications(prev => [
      { id: Date.now(), message, read: false, time: 'Just now' },
      ...prev
    ]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('mockUser');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        notifications,
        login,
        signup,
        googleLogin,
        logout,
        updateProfile,
        addNotification,
        clearNotifications,
        markNotificationsAsRead
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
