/**
 * API Client for Backend Integration
 * Base URL: http://localhost:8000
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth APIs
  async signup(name: string, email: string, password: string) {
    const response = await fetch(`${this.baseURL}/api/auth/signup`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ name, email, password }),
    });
    return this.handleResponse(response);
  }

  async signin(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/api/auth/signin`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse(response);
  }

  async logout() {
    const response = await fetch(`${this.baseURL}/api/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseURL}/api/auth/me`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Task APIs
  async getTasks(params?: {
    status?: 'all' | 'pending' | 'completed' | 'deleted';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    limit?: number;
    offset?: number;
    include_deleted?: boolean;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.include_deleted) queryParams.append('include_deleted', 'true');

    const response = await fetch(
      `${this.baseURL}/api/tasks?${queryParams.toString()}`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse(response);
  }

  async getTask(taskId: number) {
    const response = await fetch(`${this.baseURL}/api/tasks/${taskId}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createTask(title: string, description?: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM', due_date?: string) {
    const response = await fetch(`${this.baseURL}/api/tasks`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ title, description, priority, due_date }),
    });
    return this.handleResponse(response);
  }

  async updateTask(taskId: number, data: { title?: string; description?: string; completed?: boolean; priority?: 'LOW' | 'MEDIUM' | 'HIGH'; due_date?: string }) {
    const response = await fetch(`${this.baseURL}/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async toggleTaskComplete(taskId: number) {
    const response = await fetch(`${this.baseURL}/api/tasks/${taskId}/complete`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async deleteTask(taskId: number) {
    const response = await fetch(`${this.baseURL}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async restoreTask(taskId: number) {
    const response = await fetch(`${this.baseURL}/api/tasks/${taskId}/restore`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Notification APIs
  async getNotifications(params?: {
    limit?: number;
    offset?: number;
    unread_only?: boolean;
    sort?: 'asc' | 'desc';
  }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.unread_only) queryParams.append('unread_only', 'true');
    if (params?.sort) queryParams.append('sort', params.sort);

    const response = await fetch(
      `${this.baseURL}/api/notifications?${queryParams.toString()}`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse(response);
  }

  async markNotificationRead(notificationId: number) {
    const response = await fetch(`${this.baseURL}/api/notifications/${notificationId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ is_read: true }),
    });
    return this.handleResponse(response);
  }

  async markAllNotificationsRead() {
    const response = await fetch(`${this.baseURL}/api/notifications/mark-all-read`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async deleteNotification(notificationId: number) {
    const response = await fetch(`${this.baseURL}/api/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getUnreadCount() {
    const response = await fetch(`${this.baseURL}/api/notifications/unread/count`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Profile APIs
  async getProfile() {
    const response = await fetch(`${this.baseURL}/api/profile`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateProfile(data: {
    name?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;
    city?: string;
    country?: string;
    bio?: string;
  }) {
    // Remove empty strings and convert to null
    const cleanedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === '' ? null : value
      ])
    );

    const response = await fetch(`${this.baseURL}/api/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(cleanedData),
    });
    return this.handleResponse(response);
  }

  async uploadProfilePhoto(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/api/profile/upload-photo`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return this.handleResponse(response);
  }

  async deleteProfilePhoto() {
    const response = await fetch(`${this.baseURL}/api/profile/photo`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Contact API
  async submitContactForm(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    const response = await fetch(`${this.baseURL}/api/contact`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  // Push Notification APIs
  async subscribeToPush(subscription: PushSubscription) {
    const subscriptionJSON = subscription.toJSON();
    const response = await fetch(`${this.baseURL}/api/push/subscribe`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        endpoint: subscriptionJSON.endpoint,
        keys: {
          p256dh: subscriptionJSON.keys?.p256dh || '',
          auth: subscriptionJSON.keys?.auth || '',
        },
      }),
    });
    return this.handleResponse(response);
  }

  async unsubscribeFromPush(endpoint: string) {
    const response = await fetch(`${this.baseURL}/api/push/unsubscribe?endpoint=${encodeURIComponent(endpoint)}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getPushSubscriptions() {
    const response = await fetch(`${this.baseURL}/api/push/subscriptions`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async testPushNotification(title?: string, message?: string) {
    const response = await fetch(`${this.baseURL}/api/push/test`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        title: title || 'Test Notification',
        message: message || 'This is a test notification from Execute',
      }),
    });
    return this.handleResponse(response);
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
