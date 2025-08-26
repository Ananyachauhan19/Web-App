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
  useEffect(() => {
    if (localStorage.getItem('loggedIn') === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);
  const handleLogin = () => {
    localStorage.setItem('loggedIn', 'true');
    navigate('/dashboard');
  };
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Login onLogin={handleLogin} />
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem('loggedIn') !== 'true') {
      navigate('/');
    }
  }, [navigate]);
  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    navigate('/');
  };
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center min-h-screen min-w-full bg-gray-50">
      <header className="w-full py-6 bg-blue-700 shadow flex justify-between items-center px-8">
        <h1 className="text-3xl font-bold text-white tracking-wide text-center">techEEks</h1>
        <button onClick={handleLogout} className="ml-4 px-3 py-1 bg-red-500 text-white rounded">Logout</button>
      </header>
      <main className="flex-1 w-full flex flex-col items-center justify-center">
        <QRCamera />
      </main>
    </div>
  );
}

export default App;
