
interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') {
    this.baseUrl = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        (error as any).code = errorData.error?.code;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Authentication methods
  async signup(name: string, email: string, password: string) {
    const response = await this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
      headers: { 'Content-Type': 'application/json' }, // No auth header for signup
    });
    return response;
  }

  async signin(email: string, password: string) {
    const response = await this.request('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' }, // No auth header for signin
    });
    return response;
  }

  async refreshToken(refreshToken: string) {
    const response = await this.request('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
      headers: { 'Content-Type': 'application/json' }, // No auth header for refresh
    });
    return response;
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Ignore logout errors as token might be expired
      console.log('Logout completed');
    }
  }

  // Task-related methods
  async getTasks(params?: {
    status?: string;
    date_from?: string;
    date_to?: string;
    include_deleted?: boolean;
    category?: string;
    tags?: string;
    priority?: string;
    due_before?: string;
    due_after?: string;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const queryParams = params ? new URLSearchParams(params as any).toString() : '';
    const endpoint = `/api/tasks${queryParams ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  async getTask(id: string): Promise<any> {
    return this.request(`/api/tasks/${id}`);
  }

  async createTask(task: any): Promise<any> {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: string, task: any): Promise<any> {
    return this.request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async patchTask(id: string, updates: any): Promise<any> {
    return this.request(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async toggleTaskComplete(id: string, completed: boolean): Promise<any> {
    return this.request(`/api/tasks/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  }

  async deleteTask(id: string, permanent: boolean = false): Promise<void> {
    const queryParams = permanent ? '?permanent=true' : '';
    await this.request(`/api/tasks/${id}${queryParams}`, {
      method: 'DELETE',
    });
  }

  async restoreTask(id: string): Promise<any> {
    return this.request(`/api/tasks/${id}/restore`, {
      method: 'POST',
    });
  }

  async bulkTaskOperations(operation: string, taskIds: number[], params?: any): Promise<any> {
    const payload = {
      task_ids: taskIds,
      operation,
      ...params
    };
    return this.request('/api/tasks/bulk', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // User-related methods
  async getUserProfile(): Promise<any> {
    return this.request('/api/profile');
  }

  async updateProfile(profileData: any): Promise<any> {
    return this.request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Notification methods
  async getNotifications(params?: {
    limit?: number;
    offset?: number;
    unread_only?: boolean;
  }): Promise<any> {
    const queryParams = params ? new URLSearchParams(params as any).toString() : '';
    const endpoint = `/api/notifications${queryParams ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  async markNotificationAsRead(notificationId: number): Promise<any> {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead(): Promise<any> {
    return this.request('/api/notifications/read-all', {
      method: 'PATCH',
    });
  }

  // File upload methods
  async uploadProfilePhoto(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('access_token');
    const response = await fetch(`${this.baseUrl}/api/profile/upload-photo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Upload failed: ${response.status}`);
    }

    return response.json();
  }

  async deleteProfilePhoto(): Promise<any> {
    return this.request('/api/profile/photo', {
      method: 'DELETE',
    });
  }
}

// Export a simple fetch-based client as fallback
export const simpleApiClient = {
  baseUrl: 'http://localhost:8000',

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const authHeaders = this.getAuthHeaders();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(authHeaders as Record<string, string>),
      ...((options.headers || {}) as Record<string, string>),
    };

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async signin(email: string, password: string) {
    return this.request('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });
  },

  async signup(name: string, email: string, password: string) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
      headers: { 'Content-Type': 'application/json' },
    });
  },

  async getTasks() {
    return this.request('/api/tasks');
  }
};

export const apiClient = new ApiClient();