import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/register', { email, password });
      login(res.data.access_token, res.data.role, String(res.data.user_id));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 border border-zinc-200 rounded">
      <h1 className="text-xl font-bold text-black mb-1">Create Account</h1>
      <p className="text-xs text-zinc-500 mb-6">Register to apply for industrial approvals & government support</p>

      {error && <div className="text-xs text-red-600 mb-4 p-2 bg-red-50 rounded border border-red-200">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-black">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-zinc-300 rounded px-3 py-2 text-sm mt-1 focus:outline-none focus:border-black"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-black">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-zinc-300 rounded px-3 py-2 text-sm mt-1 focus:outline-none focus:border-black"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-2.5 rounded text-sm font-medium hover:bg-zinc-800 transition-colors"
        >
          Create Account
        </button>
      </form>

      <div className="text-center mt-6 text-xs text-zinc-500">
        Already have an account? <Link to="/login" className="text-black font-semibold underline">Sign In</Link>
      </div>
    </div>
  );
};