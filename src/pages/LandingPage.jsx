import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Bell, TrendingUp, Cloud } from 'lucide-react';
import Button from '../components/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="px-6 py-4 flex items-center justify-between bg-white border-b border-slate-100 sticky top-0 z-10 w-full shadow-sm">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
             <Activity className="w-5 h-5 text-white" />
           </div>
           <span className="font-bold text-xl text-slate-800">SmartInv</span>
        </div>
        <div className="flex gap-4">
          <Link to="/signin"><Button variant="outline">Sign In</Button></Link>
          <Link to="/signup"><Button variant="primary">Sign Up</Button></Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mb-6">
          Manage Your Shop's Inventory <span className="text-blue-600">Smartly</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-12">
          Real-time stock tracking, low stock alerts, and seamless sales management tailored for small and medium businesses.
        </p>

        <img 
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
          alt="Professional Inventory Warehouse" 
          className="rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full object-cover h-[300px] md:h-[500px] mb-24 object-center"
        />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full pb-12">
          {[
            { icon: Activity, title: 'Real-time Tracking', desc: 'Know exactly what you have in stock at any given moment.' },
            { icon: Bell, title: 'Low Stock Alerts', desc: 'Get automatically notified when items are running low.' },
            { icon: TrendingUp, title: 'Sales Management', desc: 'Record sales and update your inventory seamlessly.' },
            { icon: Cloud, title: 'Cloud Access', desc: 'Access your inventory from anywhere, on any device.' },
          ].map((feature, idx) => (
             <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-left hover:-translate-y-1 transition-all duration-300 hover:shadow-md">
               <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                 <feature.icon className="w-7 h-7" />
               </div>
               <h3 className="font-bold text-xl text-slate-800 mb-3">{feature.title}</h3>
               <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
             </div>
          ))}
        </div>
      </main>
    </div>
  );
}
