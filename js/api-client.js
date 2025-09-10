// API Client for RX Magazine PWA
// Handles communication with the MERN backend

class APIClient {
    constructor() {
        this.baseURL = 'https://rx-academy-backend-101.onrender.com/api';
        this.token = this.getStoredToken();
        this.refreshToken = this.getStoredRefreshToken();
    }

    getStoredToken() {
        try {
            const tokenData = localStorage.getItem('rx_auth_token');
            if (!tokenData) return null;
            
            const parsed = JSON.parse(tokenData);
            // Check if token is expired
            if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
                this.clearTokens();
                return null;
            }
            return parsed.token;
        } catch (error) {
            console.error('Error parsing stored token:', error);
            this.clearTokens();
            return null;
        }
    }

    getStoredRefreshToken() {
        return localStorage.getItem('rx_refresh_token');
    }

    setTokens(accessToken, refreshToken = null, expiresIn = 3600) {
        this.token = accessToken;
        this.refreshToken = refreshToken;
        
        if (accessToken) {
            const tokenData = {
                token: accessToken,
                expiresAt: Date.now() + (expiresIn * 1000) // Convert to milliseconds
            };
            localStorage.setItem('rx_auth_token', JSON.stringify(tokenData));
            
            if (refreshToken) {
                localStorage.setItem('rx_refresh_token', refreshToken);
            }
        } else {
            this.clearTokens();
        }
    }

    clearTokens() {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem('rx_auth_token');
        localStorage.removeItem('rx_refresh_token');
        localStorage.removeItem('rx_user_data');
    }

    setToken(token) {
        // Backward compatibility - use setTokens instead
        this.setTokens(token);
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Make API request
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            // Handle 401 Unauthorized
            if (response.status === 401) {
                this.clearTokens();
                // Redirect to auth page if not already there
                if (!window.location.pathname.includes('auth.html')) {
                    window.location.href = 'auth.html';
                }
                throw new Error('Unauthorized');
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            
            if (error.message === 'Unauthorized') {
                throw error;
            }
            
            return {
                success: false,
                error: 'Network error occurred'
            };
        }
    }

    // Handle magazine access check
    async handleMagazineClick(magazineElement, magazineType) {
        try {
            this.showLoading();
            
            const accessInfo = await this.checkMagazineAccess();
            
            if (accessInfo.hasAccess) {
                // User has access, proceed to magazine
                window.location.href = `${magazineType}/index.html`;
            } else {
                // Show magazine access denied with upgrade option
                this.showMagazineAccessDenied(accessInfo);
            }
        } catch (error) {
            console.error('Magazine access error:', error);
            this.showError('Failed to check magazine access');
        } finally {
            this.hideLoading();
        }
    }

    // Authentication methods
    async signIn(email, password) {
        const result = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (result.success && result.data.token) {
            // Store tokens with proper expiration
            this.setTokens(
                result.data.token, 
                result.data.refreshToken,
                result.data.expiresIn || 3600
            );
            
            // Store user data for quick access
            if (result.data.user) {
                localStorage.setItem('rx_user_data', JSON.stringify(result.data.user));
            }
        }

        return result;
    }

    async signOut() {
        try {
            await this.request('/auth/logout', {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            // Always clear tokens locally
            this.clearTokens();
        }
        return { success: true };
    }

    async getCurrentUser() {
        return await this.request('/auth/me');
    }

    // Check if user is authenticated
    async getSession() {
        if (!this.token) {
            // Try to get cached user data
            const cachedUser = localStorage.getItem('rx_user_data');
            if (cachedUser) {
                try {
                    return { user: JSON.parse(cachedUser) };
                } catch (error) {
                    localStorage.removeItem('rx_user_data');
                }
            }
            return null;
        }
        
        try {
            const result = await this.getCurrentUser();
            if (result.success && result.data) {
                // Update cached user data
                if (result.data.user) {
                    localStorage.setItem('rx_user_data', JSON.stringify(result.data.user));
                }
                return result.data;
            }
            return null;
        } catch (error) {
            console.error('Session check failed:', error);
            // If 401, clear tokens
            if (error.status === 401) {
                this.clearTokens();
            }
            return null;
        }
    }

    // User profile methods
    async getProfile(userId) {
        return await this.request(`/users/${userId}`);
    }

    async updateProfile(userId, profileData) {
        return await this.request(`/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // Subscription methods
    async getSubscription(userId) {
        const result = await this.request('/subscriptions/my-subscriptions');
        return result.success && result.data.length > 0 ? result.data[0] : null;
    }

    async createSubscription(subscriptionData) {
        return await this.request('/subscriptions', {
            method: 'POST',
            body: JSON.stringify(subscriptionData)
        });
    }

    // Content access methods
    async hasContentAccess(userId, contentType, contentId) {
        const result = await this.request(`/content/access/${contentType}/${contentId}`);
        return result.success ? result.data.hasAccess : false;
    }

    async getMyContentAccess() {
        return await this.request('/content/my-access');
    }

    // Check user access to content
    async checkContentAccess(contentType, contentId) {
        try {
            const response = await this.request(`/content/access/${contentType}/${contentId}`);
            return response.data;
        } catch (error) {
            console.error('Check content access error:', error);
            return { hasAccess: false, reason: 'Error checking access' };
        }
    }

    // Check if user has paid membership for magazine access
    async checkMagazineAccess() {
        try {
            const user = await this.getCurrentUser();
            if (!user || !user.subscriptionStatus) {
                return { hasAccess: false, reason: 'No active subscription' };
            }
            
            const hasPaidAccess = user.subscriptionStatus === 'active' && 
                                 (user.subscriptionTier === 'premium' || user.subscriptionTier === 'enterprise');
            
            return {
                hasAccess: hasPaidAccess,
                reason: hasPaidAccess ? 'Active subscription' : 'Subscription required for magazine access',
                subscriptionStatus: user.subscriptionStatus,
                subscriptionTier: user.subscriptionTier
            };
        } catch (error) {
            console.error('Check magazine access error:', error);
            return { hasAccess: false, reason: 'Error checking magazine access' };
        }
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token && !!this.getStoredToken();
    }

    getCachedUser() {
        try {
            const userData = localStorage.getItem('rx_user_data');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing cached user data:', error);
            localStorage.removeItem('rx_user_data');
            return null;
        }
    }

    getUserData() {
        const userData = localStorage.getItem('rx_user_data');
        return userData ? JSON.parse(userData) : null;
    }
}

// Utility functions for UI
const utils = {
    showLoading(message = 'Loading...') {
        const loader = document.getElementById('auth-loader');
        const loaderText = document.querySelector('.loader-text');
        if (loader) {
            if (loaderText) loaderText.textContent = message;
            loader.style.display = 'flex';
        }
    },

    hideLoading() {
        const loader = document.getElementById('auth-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    },

    showError(message) {
        const errorDiv = document.getElementById('auth-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    },

    showSuccess(message) {
        const successDiv = document.getElementById('auth-success');
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.style.display = 'block';
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 5000);
        } else {
            alert(message);
        }
    },

    // Show access denied modal
    showAccessDenied(reason = 'Access denied') {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-lg p-6 max-w-md mx-4 text-center">
                <div class="text-red-500 text-6xl mb-4">🔒</div>
                <h2 class="text-xl font-bold text-white mb-2">Access Denied</h2>
                <p class="text-gray-400 mb-4">${reason}</p>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200">
                    Close
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 5000);
    },

    // Show magazine access denied modal with upgrade option
    showMagazineAccessDenied(accessInfo) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-lg p-6 max-w-md mx-4 text-center">
                <div class="text-yellow-500 text-6xl mb-4">📖</div>
                <h2 class="text-xl font-bold text-white mb-2">Premium Content</h2>
                <p class="text-gray-400 mb-4">${accessInfo.reason}</p>
                <p class="text-sm text-gray-500 mb-6">Current Status: ${accessInfo.subscriptionStatus || 'No subscription'}</p>
                <div class="flex space-x-3">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                        Close
                    </button>
                    <button onclick="window.requestAccess(); this.parentElement.parentElement.parentElement.remove();" 
                            class="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200">
                        Request Access
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (modal.parentElement) {
                modal.remove();
            }
        }, 10000);
    }
};

// Create global instance
const apiClient = new APIClient();

// Add magazine access method to utils
utils.showMagazineAccessDenied = (accessInfo) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gray-900 rounded-lg p-6 max-w-md mx-4 text-center">
            <div class="text-yellow-500 text-6xl mb-4">📖</div>
            <h2 class="text-xl font-bold text-white mb-2">Premium Content</h2>
            <p class="text-gray-400 mb-4">${accessInfo.reason}</p>
            <p class="text-sm text-gray-500 mb-6">Current Status: ${accessInfo.subscriptionStatus || 'No subscription'}</p>
            <div class="flex space-x-3">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        class="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                    Close
                </button>
                <button onclick="window.requestAccess(); this.parentElement.parentElement.parentElement.remove();" 
                        class="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200">
                    Request Access
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (modal.parentElement) {
            modal.remove();
        }
    }, 10000);
};

// Export for use in other modules
export { apiClient as default, utils };
