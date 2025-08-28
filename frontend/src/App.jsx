import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom';
import Login from './Login';
import QRCamera from './QRCamera';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginWrapper />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

function LoginWrapper() {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate('/dashboard');
  };
  return (
  <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-8 px-2">
      <Login onLogin={handleLogin} />
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const handleLogout = () => {
    navigate('/');
  };
  return (
    <div className="w-full min-h-0 flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <header className="fixed top-0 left-0 w-full z-20 py-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 shadow flex justify-between items-center px-8">
        <h1 className="text-3xl font-bold text-white tracking-wide text-center drop-shadow-xl">techIEEEks'</h1>
        <button onClick={handleLogout} className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-400">Logout</button>
      </header>
      <main className="w-full flex flex-col items-center justify-center pt-32 pb-8">
        <QRCamera />
      </main>
    </div>
  );
}

export default App;
