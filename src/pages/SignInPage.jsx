import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { LogIn } from 'lucide-react';

export default function SignInPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }
      
      localStorage.setItem('user', JSON.stringify(data.user));
      setEmail('');
      setPassword('');
      onLogin(data.user);
      navigate('/dashboard');
    } catch (err) {
       setError(err.message);
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl flex flex-col md:flex-row shadow-2xl border-none">
        <div className="md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white">
          <Link to="/" title="Back to Home" className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-8 hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1">
            <LogIn className="w-6 h-6" />
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Welcome Back</h2>
          <p className="text-slate-500 mb-8 text-lg">Please enter your details to sign in.</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" autoComplete="off">
            {error && <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium">{error}</div>}
            <Input 
              label="Email" 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <Button type="submit" disabled={isSubmitting} className={`mt-4 w-full py-2.5 text-base shadow-lg shadow-blue-500/30 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}>{isSubmitting ? 'Signing In...' : 'Sign In'}</Button>
          </form>
          
          <p className="mt-8 text-center text-slate-600">
            Don't have an account? <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">Sign up</Link>
          </p>
        </div>
        <div className="hidden md:block w-1/2 bg-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-700/80 to-blue-500/20 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1553413077-190dd305871c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Corporate Office Workspace" 
            className="w-full h-full object-cover"
          />
        </div>
      </Card>
    </div>
  );
}
