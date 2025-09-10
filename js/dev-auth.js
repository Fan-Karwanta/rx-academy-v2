// Development Authentication Mock System
// This allows testing the UI without requiring real Supabase connection

const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Mock user data for development
const mockUsers = {
  'admin@rxlifestyle.com': {
    id: 'dev-admin-123',
    email: 'admin@rxlifestyle.com',
    password: 'admin123',
    full_name: 'Admin User',
    subscription_tier: 'enterprise',
    subscription_status: 'active',
    is_admin: true
  },
  'user@example.com': {
    id: 'dev-user-456',
    email: 'user@example.com',
    password: 'user123',
    full_name: 'Test User',
    subscription_tier: 'premium',
    subscription_status: 'active',
    is_admin: false
  },
  'free@example.com': {
    id: 'dev-free-789',
    email: 'free@example.com',
    password: 'free123',
    full_name: 'Free User',
    subscription_tier: 'free',
    subscription_status: 'inactive',
    is_admin: false
  }
};

// Development Auth System
export const devAuth = {
  // Sign up new user (mock)
  async signUp(email, password, fullName) {
    console.log('🔧 DEV: Mock sign up', { email, fullName });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (mockUsers[email]) {
      return { success: false, error: 'User already exists' };
    }
    
    // Create new mock user
    const newUser = {
      id: 'dev-' + Math.random().toString(36).substr(2, 9),
      email,
      password,
      full_name: fullName,
      subscription_tier: 'free',
      subscription_status: 'inactive',
      is_admin: false
    };
    
    mockUsers[email] = newUser;
    
    // Store in localStorage for persistence
    localStorage.setItem('dev_users', JSON.stringify(mockUsers));
    localStorage.setItem('dev_current_user', JSON.stringify(newUser));
    
    return { 
      success: true, 
      data: { 
        user: newUser,
        session: { user: newUser, access_token: 'dev-token-' + newUser.id }
      }
    };
  },

  // Sign in user (mock)
  async signIn(email, password) {
    console.log('🔧 DEV: Mock sign in', { email });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers[email];
    if (!user || user.password !== password) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    // Store current user
    localStorage.setItem('dev_current_user', JSON.stringify(user));
    
    return { 
      success: true, 
      data: { 
        user,
        session: { user, access_token: 'dev-token-' + user.id }
      }
    };
  },

  // Sign out user (mock)
  async signOut() {
    console.log('🔧 DEV: Mock sign out');
    localStorage.removeItem('dev_current_user');
    return { success: true };
  },

  // Get current user (mock)
  async getCurrentUser() {
    const userStr = localStorage.getItem('dev_current_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get user session (mock)
  async getSession() {
    const user = await this.getCurrentUser();
    return user ? { user, access_token: 'dev-token-' + user.id } : null;
  },

  // Listen to auth changes (mock)
  onAuthStateChange(callback) {
    console.log('🔧 DEV: Mock auth state change listener registered');
    
    // Check for changes every second (simple polling for demo)
    const interval = setInterval(() => {
      const currentUser = localStorage.getItem('dev_current_user');
      if (!currentUser) {
        callback('SIGNED_OUT', null);
      }
    }, 1000);
    
    return {
      data: { subscription: { unsubscribe: () => clearInterval(interval) } }
    };
  }
};

// Development Database Mock
export const devDb = {
  // Get user profile (mock)
  async getProfile(userId) {
    console.log('🔧 DEV: Mock get profile', userId);
    const currentUser = await devAuth.getCurrentUser();
    return currentUser && currentUser.id === userId ? currentUser : null;
  },

  // Update user profile (mock)
  async updateProfile(userId, updates) {
    console.log('🔧 DEV: Mock update profile', userId, updates);
    const currentUser = await devAuth.getCurrentUser();
    
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, ...updates };
      localStorage.setItem('dev_current_user', JSON.stringify(updatedUser));
      return { success: true, data: updatedUser };
    }
    
    return { success: false, error: 'User not found' };
  },

  // Get user subscription (mock)
  async getSubscription(userId) {
    console.log('🔧 DEV: Mock get subscription', userId);
    const currentUser = await devAuth.getCurrentUser();
    
    if (currentUser && currentUser.id === userId && currentUser.subscription_status === 'active') {
      return {
        id: 'dev-sub-' + userId,
        user_id: userId,
        plan_id: currentUser.subscription_tier + '_monthly',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
    }
    
    return null;
  },

  // Check if user has content access (mock)
  async hasContentAccess(userId, contentType, contentId) {
    console.log('🔧 DEV: Mock check content access', userId, contentType, contentId);
    const currentUser = await devAuth.getCurrentUser();
    
    if (!currentUser || currentUser.id !== userId) return false;
    
    // Free users have no access, premium and enterprise have full access
    return currentUser.subscription_status === 'active';
  }
};

// Development utilities
export const devUtils = {
  showLoading(message = 'Loading...') {
    console.log('🔧 DEV: Show loading -', message);
    const loader = document.getElementById('auth-loader');
    if (loader) {
      loader.style.display = 'flex';
      const text = loader.querySelector('.loader-text');
      if (text) text.textContent = message;
    }
  },

  hideLoading() {
    console.log('🔧 DEV: Hide loading');
    const loader = document.getElementById('auth-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  },

  showError(message) {
    console.log('🔧 DEV: Show error -', message);
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    } else {
      alert('Error: ' + message);
    }
  },

  showSuccess(message) {
    console.log('🔧 DEV: Show success -', message);
    const successDiv = document.getElementById('auth-success');
    if (successDiv) {
      successDiv.textContent = message;
      successDiv.style.display = 'block';
      setTimeout(() => {
        successDiv.style.display = 'none';
      }, 3000);
    } else {
      alert('Success: ' + message);
    }
  }
};

// Initialize development data
if (isDevelopment) {
  console.log('🚀 Development Auth System Loaded');
  console.log('📝 Test Accounts:');
  console.log('   Admin: admin@rxlifestyle.com / admin123');
  console.log('   Premium User: user@example.com / user123');
  console.log('   Free User: free@example.com / free123');
  
  // Load existing users from localStorage
  const savedUsers = localStorage.getItem('dev_users');
  if (savedUsers) {
    Object.assign(mockUsers, JSON.parse(savedUsers));
  }
}
