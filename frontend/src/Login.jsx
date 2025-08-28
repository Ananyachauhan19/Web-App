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
  const res = await fetch('http://localhost:5000/api/login', {
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
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-8 px-2 overflow-auto">
      <div className="w-full max-w-sm sm:max-w-md mx-auto p-6 sm:p-8 lg:p-10 bg-slate-800/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col items-center mb-8 transition-all duration-300">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center mb-2 shadow-lg">
            <span className="text-white text-3xl font-extrabold tracking-wider">T</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1 drop-shadow-xl">techIEEEks'</h2>
          <p className="text-blue-200 text-sm font-medium">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-5">
            <label className="block mb-1 font-semibold text-blue-100">Username</label>
            <input
              type="text"
              className="w-full border border-blue-700/30 bg-slate-900/60 text-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder:text-blue-300/60"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              required
              placeholder="Enter your username"
            />
          </div>
          <div className="mb-5">
            <label className="block mb-1 font-semibold text-blue-100">Password</label>
            <input
              type="password"
              className="w-full border border-blue-700/30 bg-slate-900/60 text-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder:text-blue-300/60"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          {error && <div className="text-red-400 mb-4 text-center font-semibold animate-pulse">{error}</div>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
