import { Voicemail, VoicemailGreeting, UserProfile } from '../types';

// Default to Android Emulator loopback 10.0.2.2 or physical device IP
const BASE_URL = 'http://10.0.2.2:5000/api';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Network request failed');
  }
  return data;
};

export const ApiService = {
  // Auth
  register: (payload: any) => request<{ token: string; user: UserProfile }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  login: (payload: any) => request<{ token: string; user: UserProfile }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getProfile: () => request<UserProfile>('/auth/profile'),

  // Voicemails
  getVoicemails: (params?: { unreadOnly?: boolean; search?: string; sort?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<{ voicemails: Voicemail[]; total: number }>(`/voicemails?${query}`);
  },
  getVoicemailById: (id: string) => request<Voicemail>(`/voicemails/${id}`),
  markAsRead: (id: string, isRead = true) => request<{ success: boolean }>(`/voicemails/${id}/read`, {
    method: 'PATCH',
    body: JSON.stringify({ isRead }),
  }),
  deleteVoicemail: (id: string) => request<{ success: boolean }>(`/voicemails/${id}`, {
    method: 'DELETE',
  }),
  createTestVoicemail: (payload: any) => request<Voicemail>('/voicemails', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // AI
  summarizeVoicemail: (voicemailId: string) => request<any>('/ai/summarize', {
    method: 'POST',
    body: JSON.stringify({ voicemailId }),
  }),
  suggestReplies: (transcript: string, callerName?: string) => request<any>('/ai/suggest-reply', {
    method: 'POST',
    body: JSON.stringify({ transcript, callerName }),
  }),
  aiSearch: (query: string) => request<{ results: Voicemail[] }>('/ai/search', {
    method: 'POST',
    body: JSON.stringify({ query }),
  }),

  // Greetings
  getGreetings: () => request<VoicemailGreeting[]>('/greetings'),
  createGreeting: (payload: any) => request<VoicemailGreeting>('/greetings', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateGreeting: (id: string, payload: any) => request<VoicemailGreeting>(`/greetings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  deleteGreeting: (id: string) => request<{ success: boolean }>(`/greetings/${id}`, {
    method: 'DELETE',
  }),

  // Forwarding Instructions
  getForwardingInstructions: (dest?: string, seconds?: number) => {
    return request<any>(`/webhooks/telephony/forwarding-instructions?destination=${dest || ''}&seconds=${seconds || 20}`);
  }
};
