import { User, Field, MatchSlot } from '../types';

const BASE = '/api';

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    let errorMessage = 'Ocorreu um erro desconhecido.';
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      // If parsing JSON fails, try to get text, or fallback to status
      const text = await res.text();
      errorMessage = `Erro no servidor (${res.status}): ${text.substring(0, 100)}`;
      console.error("API Error (Non-JSON):", text);
    }
    throw new Error(errorMessage);
  }
  return res.json();
};

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<User> => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  register: async (userData: any): Promise<User> => {
    console.log("Sending register request:", userData);
    const res = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  updateUser: async (user: User): Promise<User> => {
    const res = await fetch(`${BASE}/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    return handleResponse(res);
  },

  // Data
  getFields: async (): Promise<Field[]> => {
    const res = await fetch(`${BASE}/fields`);
    return handleResponse(res);
  },

  getSlots: async (): Promise<MatchSlot[]> => {
    const res = await fetch(`${BASE}/slots`);
    return handleResponse(res);
  },

  createSlots: async (slots: Partial<MatchSlot>[]): Promise<MatchSlot[]> => {
    const res = await fetch(`${BASE}/slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slots)
    });
    return handleResponse(res);
  },

  updateSlot: async (slotId: string, data: Partial<MatchSlot>): Promise<MatchSlot> => {
    const res = await fetch(`${BASE}/slots/${slotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  }
};