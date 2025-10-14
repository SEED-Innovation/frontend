import { 
  UserResponse, 
  CreateUserRequest, 
  UpdateUserRequest, 
  DeleteUserRequest, 
  GetUserByIdentifierRequest 
} from '@/types/user';

export class UserService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  
  private getToken(): string {
    return localStorage.getItem('accessToken') || '';
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json'
    };
  }

  // ================================
  // 🎯 ADMIN USER ENDPOINTS (Match your backend)
  // ================================

  /**
   * GET /admin/users - Get all users
   */
  async getAllUsers(): Promise<UserResponse[]> {
    console.log('👥 UserService.getAllUsers called');
    
    try {
      const response = await fetch(`${this.baseUrl}/admin/users`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Real Users from DB:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to load real users from database:', error);
      throw error; // Don't use mock data - throw the error
    }
  }

  /**
   * POST /admin/users - Create new user
   */
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    console.log('➕ UserService.createUser called:', userData);
    
    try {
      const response = await fetch(`${this.baseUrl}/admin/users`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ User created:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      throw error;
    }
  }

  /**
   * GET /admin/users/{id} - Get detailed user information by ID
   * This is optimized for the detail view and includes all user fields
   */
  async getUserDetails(userId: number): Promise<UserResponse> {
    console.log('🔍 UserService.getUserDetails called for ID:', userId);
    
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/${userId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get user details: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ User details loaded:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to get user details:', error);
      // Fallback to getUserByIdentifier if the specific endpoint doesn't exist yet
      console.log('⚠️ Falling back to getUserByIdentifier...');
      return this.getUserByIdentifier({ id: userId });
    }
  }

  /**
   * POST /admin/users/get - Get user by flexible identifier
   */
  async getUserByIdentifier(request: GetUserByIdentifierRequest): Promise<UserResponse> {
    console.log('🔍 UserService.getUserByIdentifier called:', request);
    
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/get`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Failed to get user: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ User found:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to get user:', error);
      throw error;
    }
  }

  /**
   * PUT /admin/users/update - Update user by flexible identifier
   */
  async updateUser(userData: UpdateUserRequest): Promise<UserResponse> {
    console.log('📝 UserService.updateUser called:', userData);
    
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/update`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ User updated:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to update user:', error);
      throw error;
    }
  }

  /**
   * DELETE /admin/users/delete - Delete user by flexible identifier
   */
  async deleteUser(deleteData: DeleteUserRequest): Promise<void> {
    console.log('🗑️ UserService.deleteUser called:', deleteData);
    
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/delete`, {
        method: 'DELETE',
        headers: this.getHeaders(),
        body: JSON.stringify(deleteData)
      });

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.status} ${response.statusText}`);
      }

      console.log('✅ User deleted successfully');
      
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      throw error;
    }
  }

  // ================================
  // 🎯 PUBLIC USER ENDPOINTS (Based on your server logs)
  // ================================

  /**
   * GET /users/search - Search users by query
   */
  async searchUsers(params: { query: string; limit?: number }): Promise<UserResponse[]> {
    console.log('🔍 UserService.searchUsers called:', params);
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('query', params.query);
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`${this.baseUrl}/users/search?${queryParams}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to search users: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Real search results from DB:', data);
      return data;
      
    } catch (error) {
      console.error('❌ User search failed:', error);
      throw error; // Don't use mock data - throw the error
    }
  }

  /**
   * GET /users/recent - Get recent users
   */
  async getRecentUsers(): Promise<UserResponse[]> {
    console.log('📋 UserService.getRecentUsers called');
    
    try {
      const response = await fetch(`${this.baseUrl}/users/recent`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get recent users: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Real recent users from DB:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Recent users API failed:', error);
      throw error; // Don't use mock data - throw the error
    }
  }

  /**
   * GET /admin/users/admins/list - Get all admin names (SUPER_ADMIN only)
   */
  async getAllAdminNames(): Promise<string[]> {
    console.log('👥 UserService.getAllAdminNames called');
    
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/list-admins`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get admin names: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Admin names from DB:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to get admin names:', error);
      throw error;
    }
  }

  /**
   * GET /admin/users/paged - Get paginated users and admins
   */
  async getUsersPaged(page: number = 1, size: number = 10, type?: 'user' | 'admin'): Promise<any> {
    console.log(`👥 UserService.getUsersPaged called - page: ${page}, size: ${size}, type: ${type}`);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...(type && { type })
      });

      const response = await fetch(`${this.baseUrl}/admin/users/paged?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch paged users: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Paged users from DB:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to load paged users:', error);
      throw error;
    }
  }

  /**
   * GET /admin/users/admins-paged - Get paginated admins
   */
  async getAdminsPaged(page: number = 0, size: number = 10): Promise<any> {
    console.log(`👥 UserService.getAdminsPaged called - page: ${page}, size: ${size}`);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });

      const response = await fetch(`${this.baseUrl}/admin/users/admins-paged?${params}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch paged admins: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Paged admins from DB:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to load paged admins:', error);
      throw error;
    }
  }

  // ================================
  // 🎯 UTILITY METHODS
  // ================================

  /**
   * Check if user service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users`, {
        method: 'GET',
        headers: this.getHeaders()
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export the service instance
export const userService = new UserService();