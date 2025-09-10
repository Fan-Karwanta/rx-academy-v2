// Supabase Client Configuration
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';
import { devAuth, devDb, devUtils } from './dev-auth.js';

// Development mode flag
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Supabase configuration (for production)
const SUPABASE_URL = 'https://ziidqqsxgdfuhgcwnnzi.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_EnrmiFaZqiK7cyWht3PAWw_B8weynMZ';

// Initialize Supabase client (only in production)
export const supabase = isDevelopment ? null : createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Development logging
if (isDevelopment) {
  console.log('🚀 Development mode enabled - using mock auth system');
  console.log('🔧 Supabase client disabled for development');
} else {
  console.log('📡 Production mode - using Supabase');
  console.log('🔑 Supabase URL:', SUPABASE_URL);
}

// Auth helper functions - switches between dev and production
export const auth = isDevelopment ? devAuth : {
  // Sign up new user
  async signUp(email, password, fullName) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  },

  // Sign in user
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  },

  // Sign out user
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  // Get user session
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helper functions - switches between dev and production
export const db = isDevelopment ? devDb : {
  // Get user profile
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  },

  // Update user profile
  async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user subscription
  async getSubscription(userId) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Get subscription error:', error);
      return null;
    }
  },

  // Check if user has access to content
  async hasContentAccess(userId, contentType, contentId) {
    try {
      // First check if user has active subscription
      const subscription = await this.getSubscription(userId);
      if (subscription) return true;

      // Check specific content access
      const { data, error } = await supabase
        .from('content_access')
        .select('*')
        .eq('user_id', userId)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .eq('access_granted', true)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Check if access hasn't expired
      if (data && data.expires_at) {
        const expiryDate = new Date(data.expires_at);
        const now = new Date();
        return expiryDate > now;
      }
      
      return !!data;
    } catch (error) {
      console.error('Check content access error:', error);
      return false;
    }
  }
};

// Utility functions - switches between dev and production
export const utils = isDevelopment ? devUtils : {
  // Show loading spinner
  showLoading(message = 'Loading...') {
    const loader = document.getElementById('auth-loader');
    if (loader) {
      loader.style.display = 'flex';
      const text = loader.querySelector('.loader-text');
      if (text) text.textContent = message;
    }
  },

  // Hide loading spinner
  hideLoading() {
    const loader = document.getElementById('auth-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  },

  // Show error message
  showError(message) {
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    }
  },

  // Show success message
  showSuccess(message) {
    const successDiv = document.getElementById('auth-success');
    if (successDiv) {
      successDiv.textContent = message;
      successDiv.style.display = 'block';
      setTimeout(() => {
        successDiv.style.display = 'none';
      }, 3000);
    }
  }
};
