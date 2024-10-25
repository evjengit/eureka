import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email || !password) {
      setError('Alle felt må fylles ut');
      return false;
    }
    if (!isLogin && !username) {
      setError('Brukernavn er påkrevd for registrering');
      return false;
    }
    if (password.length < 6) {
      setError('Passordet må være minst 6 tegn');
      return false;
    }
    if (!isLogin && username.length < 3) {
      setError('Brukernavn må være minst 3 tegn');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, username);
      }
      navigate('/');
    } catch (err) {
      console.error('Authentication error:', err);
      setError(isLogin 
        ? 'Feil e-post eller passord' 
        : 'Kunne ikke opprette konto. Prøv igjen senere.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-main py-8 px-4 login-box">
      <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-md">
        <div>
          <h2 className="mt-4 text-center text-3xl font-bold text-gray-900">
            {isLogin ? 'Logg inn på din konto' : 'Opprett ny konto'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? (
              <>
                Eller{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  opprett en ny konto
                </button>
              </>
            ) : (
              <>
                Har du allerede en konto?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Logg inn her
                </button>
              </>
            )}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="sr-only">
                  Brukernavn
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Brukernavn"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">
                E-post
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="E-post"
              />
            </div>
            <div className='my-2'>
              <label htmlFor="password" className="sr-only">
                Passord
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Passord"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-all ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Laster...
                </span>
              ) : isLogin ? (
                'Logg inn'
              ) : (
                'Registrer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
