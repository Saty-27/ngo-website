import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

interface NgoUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Ngo {
  id: number;
  name: string;
  logo: string | null;
  status: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

const useNgoAuth = () => {
  // Get current authenticated NGO user
  const { data: ngoData, isLoading, error } = useQuery({
    queryKey: ['/api/ngo/me'],
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const token = localStorage.getItem('ngoToken');
      
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch('/api/ngo/me', {
        credentials: 'include',
        headers
      });
      
      if (res.status === 401) {
        return null;
      }
      if (!res.ok) {
        throw new Error('Failed to fetch NGO profile');
      }
      return res.json();
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch('/api/ngo/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      return response.json();
    },
    onSuccess: async (data) => {
      if (data.token) {
        localStorage.setItem('ngoToken', data.token);
      }
      queryClient.setQueryData(['/api/ngo/me'], data.ngo);
      await queryClient.refetchQueries({ queryKey: ['/api/ngo/me'] });
    }
  });

  // Logout
  const logout = () => {
    localStorage.removeItem('ngoToken');
    queryClient.invalidateQueries({ queryKey: ['/api/ngo/me'] });
    queryClient.clear();
  };

  const isAuthenticated = !!ngoData && !error && !isLoading;
  
  return {
    ngo: ngoData as Ngo | undefined,
    isAuthenticated,
    isLoading,
    login: (credentials: LoginCredentials) => loginMutation.mutateAsync(credentials),
    logout,
    loginError: loginMutation.error,
    isPendingLogin: loginMutation.isPending
  };
};

export default useNgoAuth;
