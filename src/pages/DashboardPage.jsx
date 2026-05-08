import React, { useEffect, useState } from 'react';
import { Package, AlertTriangle, Activity, DollarSign } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';
import Card from '../components/Card';

export default function DashboardPage() {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]); // ✅ ADDED
  const [chartMode, setChartMode] = useState('stock');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchProducts = async () => {
    try {
      if (!user?.email) return;

      const response = await fetch('http://localhost:5000/api/products', {
        headers: { 'x-user-email': user.email }
      });

      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load products from server.');
    }
  };

  // ✅ ADDED: fetch sales
  const fetchSales = async () => {
    try {
      if (!user?.email) return;

      const response = await fetch('http://localhost:5000/api/sales/today', {
        headers: { 'x-user-email': user.email }
      });

      if (!response.ok) throw new Error('Failed to fetch sales');

      const data = await response.json();
      setSales(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSales(); // ✅ ADDED

    window.addEventListener('inventoryUpdated', fetchProducts);

    return () =>
      window.removeEventListener('inventoryUpdated', fetchProducts);
  }, []);

  const formatINR = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);

  const totalProducts = inventory.length;

  const lowStockItems = inventory.filter(
    (item) => (item.quantity || item.stock) < 10
  );

  // ✅ FIXED: use SALES not inventory
  const todaySales = sales.reduce(
    (total, sale) => total + (sale.totalAmount || 0),
    0
  );

  const chartData = inventory.slice(0, 10).map((item) => ({
    name:
      item.name.length > 12
        ? item.name.substring(0, 12) + '...'
        : item.name,
    value:
      chartMode === 'stock'
        ? item.quantity || item.stock || 0
        : (item.price || 0) *
          (item.quantity || item.stock || 0)
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl font-medium">
          <p className="text-slate-300 text-xs mb-1">{data.name}</p>

          {chartMode === 'stock' ? (
            <p className="font-bold">{data.value} items in stock</p>
          ) : (
            <p className="font-bold">{formatINR(data.value)}</p>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 fade-in pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Dashboard
        </h1>
        <p className="text-slate-500">
          Welcome back, {user.name || 'Admin'}!
        </p>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-bold">
            Attention! You have {lowStockItems.length} low stock item(s).
          </span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Package className="w-7 h-7" />
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1">
              Total Products
            </p>
            <p className="text-3xl font-bold text-slate-800">
              {totalProducts}
            </p>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-5">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1">
              Low Stock Items
            </p>
            <p className="text-3xl font-bold text-slate-800">
              {lowStockItems.length}
            </p>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-5">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-7 h-7" />
          </div>

          <div>
            <p className="text-sm text-slate-500 mb-1">
              Today's Sales
            </p>
            <p className="text-3xl font-bold text-slate-800">
              {formatINR(todaySales)}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 p-6 min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Dynamic Overview
            </h3>

            <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
              <button
                onClick={() => setChartMode('stock')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold ${
                  chartMode === 'stock'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Stock Quantity
              </button>

              <button
                onClick={() => setChartMode('sales')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold ${
                  chartMode === 'sales'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Revenue Info
              </button>
            </div>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis dataKey="name" axisLine={false} tickLine={false} />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={
                    chartMode === 'sales'
                      ? (val) => `₹${val / 1000}k`
                      : undefined
                  }
                />

                <Tooltip content={<CustomTooltip />} />

                <Bar
                  dataKey="value"
                  fill={
                    chartMode === 'stock'
                      ? '#3b82f6'
                      : '#10b981'
                  }
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center justify-between">
            Low Stock Alerts

            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold">
              {lowStockItems.length} Warnings
            </span>
          </h3>

          <div className="flex flex-col gap-3 overflow-y-auto">
            {lowStockItems.length === 0 ? (
              <p className="text-slate-400 font-medium">
                All stock levels look healthy!
              </p>
            ) : (
              lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-xl"
                >
                  <span className="font-semibold text-slate-800 truncate">
                    {item.name}
                  </span>

                  <span className="bg-red-50 text-red-600 px-2 py-1 rounded-md text-sm font-bold">
                    {item.quantity || item.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}