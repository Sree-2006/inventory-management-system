import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import Input from '../components/Input';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(null);

  const fetchProducts = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;
      const response = await fetch('http://localhost:5000/api/products', {
        headers: { 'x-user-email': user.email }
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load inventory.');
    }
  };

  useEffect(() => {
    fetchProducts();
    window.addEventListener('inventoryUpdated', fetchProducts);
    return () => window.removeEventListener('inventoryUpdated', fetchProducts);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    setIsDeleting(id);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const product = inventory.find(p => p.id === id);
      const response = await fetch(`http://localhost:5000/api/products/${id}?category=${product?.category || 'General'}`, {
        method: 'DELETE',
        headers: { 'x-user-email': user?.email }
      });
      if (!response.ok) throw new Error('Failed to delete product');
      
      setInventory(prev => prev.filter(item => item.id !== id));
      toast.success('Product deleted successfully');
      window.dispatchEvent(new Event('inventoryUpdated'));
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete product. Ensure server is running.');
    } finally {
      setIsDeleting(null);
    }
  };

  const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
          <p className="text-slate-500">Manage your product stock</p>
        </div>
        <div className="relative w-full sm:w-72">
           <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
           <Input 
             className="!pl-10 h-10 w-full rounded-full"
             placeholder="Search products..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <Card className="overflow-x-auto shadow-lg border-none mt-2">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">Quantity</th>
              <th className="px-6 py-4">Price Per Quantity</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center text-slate-400">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-base font-medium">No products found.</p>
                </td>
              </tr>
            ) : (
              filteredInventory.map(item => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${item.quantity < 10 ? 'bg-red-50 text-red-600' : 'bg-blue-100/50 text-blue-700'}`}>
                      {item.quantity < 10 ? <AlertTriangle className="w-5 h-5" /> : <span className="font-bold text-lg">{item.name.charAt(0)}</span>}
                    </div>
                    {item.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold text-base ${item.quantity < 10 ? 'text-red-600' : 'text-slate-800'}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{formatINR(item.price)}</td>
                  <td className="px-6 py-4">
                    {item.quantity < 10 ? (
                      <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(item.id)}
                      disabled={isDeleting === item.id}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      {isDeleting === item.id ? <Loader2 className="w-5 h-5 animate-spin text-red-500" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
