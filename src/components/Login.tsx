import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Music2 } from 'lucide-react';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 flex items-end justify-around px-4 pb-2 opacity-30 gap-1">
        {[40, 70, 50, 80, 45, 75, 60, 85, 55, 70, 60, 75, 50, 80, 65, 75, 55, 70, 80, 60, 75, 50, 85, 70, 60, 55, 80, 65, 75, 50].map((height, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end h-full gap-0.5">
            {height > 66 && <div className="w-full bg-red-500 rounded-t" style={{ height: `${(height - 66) / 34 * 100}%` }}></div>}
            {height > 33 && <div className="w-full bg-yellow-400" style={{ height: `${Math.min((height - 33) / 33 * 100, 100)}%` }}></div>}
            <div className="w-full bg-green-500 rounded-b" style={{ height: `${Math.min(height / 33 * 100, 100)}%` }}></div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative z-10">
        <div className="flex flex-col items-center justify-center mb-8">
          <Music2 className="w-12 h-12 text-gray-900 mb-3" />
          <h1 className="text-3xl font-bold text-gray-900 text-center">Agentic Stems Remix</h1>
          <p className="text-sm text-gray-600 mt-1">By Dropness, LLC</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tsachson_artist"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="abcd1234"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 mb-2">Demo Accounts:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Artist: tsachson_artist / abcd1234</li>
            <li>• Sponsor: tsachson_sponsor / abcd1234</li>
            <li>• Creator: tsachson_creator1 / abcd1234</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
