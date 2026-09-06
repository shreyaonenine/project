import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';


export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.access_token, res.data.role);

      if (res.data.role === 'admin') navigate('/admin');
      else if (res.data.role === 'gov_employee') navigate('/gov');
      else navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 border border-zinc-200 rounded">
      <h1 className="text-xl font-bold text-black mb-1">Sign In</h1>
      <p className="text-xs text-zinc-500 mb-6">Enter your credentials to access your portal</p>

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
          Sign In
        </button>
      </form>

      <div className="text-center mt-6 text-xs text-zinc-500">
        Don't have an account? <Link to="/register" className="text-black font-semibold underline">Register here</Link>
      </div>
    </div>
  );
};