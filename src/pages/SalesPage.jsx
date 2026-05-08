import React, { useState, useEffect } from 'react';
import { TrendingUp, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

export default function SalesPage() {
  const [inventory, setInventory] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantitySold, setQuantitySold] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (!user?.email) return;

      const response = await fetch('http://localhost:5000/api/products', {
        headers: { 'x-user-email': user.email }
      });

      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load products for sale.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatINR = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProductId) {
      toast.error('Please select a product.');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user?.email) {
      toast.error('User not logged in.');
      return;
    }

    const qty = Number(quantitySold);
    const productIdNumber = Number(selectedProductId);

    const productIndex = inventory.findIndex(
      (p) => Number(p.id) === productIdNumber
    );

    if (productIndex === -1) {
      toast.error('Product not found.');
      return;
    }

    const product = inventory[productIndex];

    if (qty <= 0) {
      toast.error('Enter valid quantity.');
      return;
    }

    if (product.quantity < qty) {
      toast.error(`Not enough stock. Only ${product.quantity} left.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify({
          productId: String(selectedProductId),   // ✅ FIXED
          quantitySold: qty                      // ✅ FIXED
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record sale');
      }

      setQuantitySold('');
      setSelectedProductId('');

      toast.success('Sale recorded successfully!');

      const updatedInventory = [...inventory];
      updatedInventory[productIndex].quantity -= qty;
      setInventory(updatedInventory);

      if (updatedInventory[productIndex].quantity < 10) {
        toast('Low stock warning for ' + product.name, {
          icon: '⚠️',
          position: 'top-left'
        });
      }

      window.dispatchEvent(new Event('inventoryUpdated'));

    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to record sale. Check server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Record Sale</h1>
        <p className="text-slate-500">Log a new sale and update inventory</p>
      </div>

      <Card className="max-w-2xl mx-auto w-full p-8 md:p-10 relative overflow-hidden shadow-xl border-none">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <TrendingUp className="w-64 h-64 text-green-600" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Sale Details</h2>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Select Product</label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all appearance-none font-medium"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
              >
                <option value="" disabled>-- Choose a product --</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id} disabled={item.quantity === 0}>
                    {item.name} ({formatINR(item.price)}) - {item.quantity} in stock
                  </option>
                ))}
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          <Input
            label="Quantity Sold"
            type="number"
            min="1"
            placeholder="e.g. 2"
            value={quantitySold}
            onChange={(e) => setQuantitySold(e.target.value)}
            required
            className="font-medium"
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className={`mt-6 py-3 bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-lg shadow-green-500/30 text-base font-bold ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Processing...' : 'Record Sale'}
          </Button>
        </form>
      </Card>
    </div>
  );
}