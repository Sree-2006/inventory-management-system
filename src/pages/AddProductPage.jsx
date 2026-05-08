import React, { useState } from 'react';
import { PackagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

export default function AddProductPage() {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': user?.email
        },
        body: JSON.stringify({
          name,
          category: 'General',
          stock: Number(quantity),
          price: Number(price)
        }),
      });

      if (!response.ok) throw new Error('Failed to add product');
      
      setName('');
      setQuantity('');
      setPrice('');
      
      toast.success('Product added successfully!');
      window.dispatchEvent(new Event('inventoryUpdated'));

    } catch (error) {
      console.error(error);
      toast.error('Could not add product. Ensure server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Add Product</h1>
        <p className="text-slate-500">Add a new item to your stock</p>
      </div>

      <Card className="max-w-2xl mx-auto w-full p-8 md:p-10 relative overflow-hidden shadow-xl border-none">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <PackagePlus className="w-64 h-64 text-blue-600" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <PackagePlus className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Product Details</h2>
          </div>

          <Input 
            label="Product Name" 
            type="text" 
            placeholder="e.g. Wireless Mouse" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="text-base"
          />
          <div className="grid md:grid-cols-2 gap-5">
            <Input 
              label="Quantity" 
              type="number" 
              min="0"
              placeholder="e.g. 50" 
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <Input 
              label="Price Per Quantity(₹)" 
              type="number" 
              min="0"
              step="0.01"
              placeholder="e.g. 1999" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className={`mt-6 py-3 shadow-lg shadow-blue-500/30 text-base font-bold bg-blue-600 hover:bg-blue-700 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Adding...' : 'Add Product'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
