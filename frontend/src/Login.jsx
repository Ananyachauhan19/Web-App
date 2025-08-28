import { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
  const res = await fetch('https://web-app-p658.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        onLogin();
      } else {
        const data = await res.json();
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 min-h-screen min-w-full">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-blue-100">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mb-2 shadow-lg">
            <span className="text-white text-3xl font-bold tracking-wider">T</span>
          </div>
          <h2 className="text-3xl font-extrabold text-blue-700 tracking-tight mb-1">techEEks</h2>
          <p className="text-gray-400 text-sm">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block mb-1 font-semibold text-gray-700">Username</label>
            <input
              type="text"
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              required
              placeholder="Enter your username"
            />
          </div>
          <div className="mb-5">
            <label className="block mb-1 font-semibold text-gray-700">Password</label>
            <input
              type="password"
              className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          {error && <div className="text-red-500 mb-4 text-center font-medium animate-pulse">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
