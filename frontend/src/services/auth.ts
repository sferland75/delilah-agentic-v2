import { LoginResponse } from '../types/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const refreshToken = async (token: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: token }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  return response.json();
};