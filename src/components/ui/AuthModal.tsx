import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  mode: initialMode,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  // ✅ FIX: sync mode when modal is reopened
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
        setEmail('');
        setPassword('');
      } else {
        await register(username, email, password);
        onClose();
        setUsername('');
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Something went wrong. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0e0e0e] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-8">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/40 hover:text-white transition"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-red-600">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-1 text-sm text-white/50">
            {mode === 'login'
              ? 'Sign in to continue'
              : 'Join and start exploring'}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-md bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block mb-1 text-xs text-white/60">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Your name"
                className="w-full rounded-lg bg-[#161616] px-4 py-2.5 text-white border border-white/10 placeholder:text-white/30 focus:border-red-500 focus:outline-none transition"
              />
            </div>
          )}

          <div>
            <label className="block mb-1 text-xs text-white/60">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg bg-[#161616] px-4 py-2.5 text-white border border-white/10 placeholder:text-white/30 focus:border-red-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs text-white/60">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full rounded-lg bg-[#161616] px-4 py-2.5 text-white border border-white/10 placeholder:text-white/30 focus:border-red-500 focus:outline-none transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-lg bg-red-600 py-2.5 font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Processing…' : mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Switch */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            className="text-sm text-white/50 hover:text-red-500 transition"
          >
            {mode === 'login'
              ? 'New to MOVENTO? Sign up now'
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
