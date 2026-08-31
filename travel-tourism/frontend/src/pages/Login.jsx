import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('tourist@test.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 border rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" required className="w-full p-2 border rounded" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" required className="w-full p-2 border rounded" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
      </form>
      <div className="mt-4 text-sm text-gray-500 text-center">
        Demo credentials: <br/> tourist@test.com / password123 <br/> photo@test.com / password123
      </div>
    </div>
  );
};

export default Login;
