import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { UserPlus, Store, Package, TrendingUp } from 'lucide-react';

export default function SignUpPage({ onLogin }) {
  const [name, setName] = useState('');
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
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }
      
      localStorage.setItem('user', JSON.stringify(data.user));
      setName('');
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
      <Card className="w-full max-w-4xl flex flex-col-reverse md:flex-row shadow-2xl border-none">
        <div className="hidden md:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-purple-100 via-purple-50 to-white items-center justify-center p-12">
          {/* Abstract background blur elements */}
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-purple-200/50 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-300/40 rounded-full blur-3xl"></div>
          
          <div className="relative w-full max-w-sm z-10 transition-transform duration-700 hover:scale-105">
            {/* Main window illustration */}
            <div className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-[0_20px_50px_-12px_rgba(147,51,234,0.15)] border border-white flex flex-col items-center justify-center text-center relative z-10">
                <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-purple-100">
                   <Store className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Smart Retail</h3>
                <p className="text-slate-500 text-sm">Managing your inventory effortlessly and scaling your small business.</p>
            </div>
            
            {/* Floating Top Right Card */}
            <div className="absolute -right-8 -top-8 bg-white p-4 rounded-2xl shadow-xl border border-purple-50 flex items-center gap-3 z-0 animate-[bounce_3s_infinite_ease-in-out]">
                <div className="w-12 h-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
                   <TrendingUp className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1.5 p-1 w-16">
                  <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                  <div className="h-2 w-2/3 bg-slate-100 rounded-full"></div>
                </div>
            </div>
            
            {/* Floating Bottom Left Card */}
            <div className="absolute -left-10 -bottom-6 bg-white p-4 rounded-2xl shadow-xl border border-purple-50 flex items-center gap-3 z-20 animate-[bounce_4s_infinite_ease-in-out_0.5s]">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                   <Package className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1.5 p-1 w-20">
                  <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                  <div className="h-2 w-1/2 bg-slate-100 rounded-full"></div>
                </div>
            </div>
          </div>
        </div>
        <div className="md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white">
          <Link to="/" title="Back to Home" className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-8 hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1">
            <UserPlus className="w-6 h-6" />
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Create Account</h2>
          <p className="text-slate-500 mb-8 text-lg">Start managing your inventory smartly.</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" autoComplete="off">
            {error && <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm font-medium">{error}</div>}
            <Input 
              label="Full Name" 
              type="text" 
              placeholder="John Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="off"
            />
            <Input 
              label="Email" 
              type="email" 
              placeholder="john@example.com" 
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
              minLength={6}
              autoComplete="new-password"
            />
            <Button type="submit" disabled={isSubmitting} className={`mt-4 w-full py-2.5 text-base shadow-lg shadow-purple-500/30 bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}>{isSubmitting ? 'Signing Up...' : 'Sign Up'}</Button>
          </form>
          
          <p className="mt-8 text-center text-slate-600">
            Already have an account? <Link to="/signin" className="text-purple-600 font-semibold hover:text-purple-700 hover:underline">Sign in</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
