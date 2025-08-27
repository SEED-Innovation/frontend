import { 
  UserResponse, 
  CreateUserRequest, 
  UpdateUserRequest, 
  DeleteUserRequest, 
  GetUserByIdentifierRequest 
} from '@/types/user';

export class UserService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  
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