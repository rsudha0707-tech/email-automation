import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');

      if (isSignUp) {
        const exists = users.find(u => u.email === email);
        if (exists) {
          setError('User already exists!');
          setLoading(false);
          return;
        }
        const newUser = { email, password, name };
        users.push(newUser);
        localStorage.setItem('mock_users', JSON.stringify(users));
        alert('Account created successfully! You can now log in.');
        setIsSignUp(false);
      } else {
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
          onLogin(user);
        } else {
          setError('Invalid email or password');
        }
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon">
            <Mail size={32} />
          </div>
          <h1>{isSignUp ? 'Join Portal' : 'Welcome Back'}</h1>
          <p>{isSignUp ? 'Create your local account' : 'Sign in to your portal'}</p>
        </div>

        <form onSubmit={handleAuth} className="auth-form">
          {isSignUp && (
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <User size={18} />
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn" type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-toggle">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Log In' : 'Register Now'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
