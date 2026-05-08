import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  ShoppingCart,
  TrendingUp,
  Search,
  Calendar,
  FileText,
  Loader2,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/Card';
import Input from '../components/Input';

export default function SalesTodayPage() {
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportUrl, setReportUrl] = useState('');
  const [mode, setMode] = useState('today'); // today / total

  // ==========================
  // FETCH SALES
  // ==========================
  const fetchSales = async () => {
    try {
      setIsLoading(true);

      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;

      const endpoint =
        mode === 'today'
          ? 'http://localhost:5000/api/sales/today'
          : 'http://localhost:5000/api/sales/all'; // total

      const response = await fetch(endpoint, {
        headers: { 'x-user-email': user.email }
      });

      if (!response.ok) throw new Error('Failed to fetch sales');

      const data = await response.json();
      setSales(data);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load sales.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [mode]);

  // ==========================
  // GENERATE REPORT (FIXED)
  // ==========================
  const generateReport = async () => {
    try {
      setIsGenerating(true);

      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;

      const response = await fetch(
        'http://localhost:5000/api/reports/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': user.email
          },
          body: JSON.stringify({
            type: mode   // ✅ IMPORTANT FIX
          })
        }
      );

      if (!response.ok) throw new Error('Failed to generate report');

      const data = await response.json();
      setReportUrl(data.reportUrl);

      toast.success("Report generated successfully!");

    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ==========================
  // FORMAT INR
  // ==========================
  const formatINR = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);

  // ==========================
  // TOTAL CALCULATIONS
  // ==========================
  const totalSalesAmount = sales.reduce(
    (sum, sale) => sum + (sale.totalAmount || 0),
    0
  );

  const totalQuantitySold = sales.reduce(
    (sum, sale) => sum + (sale.quantitySold || 0),
    0
  );

  // ==========================
  // SEARCH FILTER
  // ==========================
  const filteredSales = sales.filter(sale =>
    sale.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {mode === 'today' ? 'Sales Today' : 'Total Sales'}
          </h1>
          <p className="text-slate-500">
            {mode === 'today'
              ? "Live tracker for today's transactions (IST)"
              : "All sales till now (Overall report)"}
          </p>
        </div>

        {/* TOGGLE */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode('today');
              setReportUrl('');
            }}
            className={`px-4 py-1 rounded-full text-sm font-bold ${
              mode === 'today'
                ? 'bg-green-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            Today
          </button>

          <button
            onClick={() => {
              setMode('total');
              setReportUrl('');
            }}
            className={`px-4 py-1 rounded-full text-sm font-bold ${
              mode === 'total'
                ? 'bg-green-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            Total
          </button>
        </div>
      </div>

      {/* SEARCH + REPORT */}
      <div className="flex items-center gap-3 w-full">
        <div className="relative flex-1 sm:w-72">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <Input
            className="!pl-10 h-10 w-full rounded-full"
            placeholder="Search sales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {!reportUrl ? (
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className={`flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm font-medium ${
              isGenerating ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>
        ) : (
          <a
            href={reportUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        )}
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center gap-5">
          <IndianRupee className="w-7 h-7 text-green-600" />
          <div>
            <p className="text-sm text-slate-500">Total Revenue</p>
            <p className="text-2xl font-bold">
              {formatINR(totalSalesAmount)}
            </p>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-5">
          <ShoppingCart className="w-7 h-7 text-blue-600" />
          <div>
            <p className="text-sm text-slate-500">Total Orders</p>
            <p className="text-2xl font-bold">
              {sales.length}
            </p>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-5">
          <TrendingUp className="w-7 h-7 text-purple-600" />
          <div>
            <p className="text-sm text-slate-500">Total Items</p>
            <p className="text-2xl font-bold">
              {totalQuantitySold}
            </p>
          </div>
        </Card>
      </div>

      {/* TABLE */}
      <Card className="overflow-x-auto shadow-lg border-none">
        <table className="w-full table-fixed text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 w-1/5">Product</th>
              <th className="px-6 py-4 w-1/5">Qty</th>
              <th className="px-6 py-4 w-1/5">Amount</th>
              <th className="px-6 py-4 w-1/5">Date</th>
              <th className="px-6 py-4 w-1/5">Time</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : filteredSales.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  No sales
                </td>
              </tr>
            ) : (
              filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-green-50">
                  <td className="px-6 py-4 truncate font-semibold text-slate-800">
                    {sale.productName}
                  </td>

                  <td className="px-6 py-4 font-bold">
                    {sale.quantitySold}
                  </td>

                  <td className="px-6 py-4 font-bold text-green-700">
                    {formatINR(sale.totalAmount)}
                  </td>

                  <td className="px-6 py-4">
                    {new Date(sale.date).toLocaleDateString('en-IN', {
                      timeZone: 'Asia/Kolkata'
                    })}
                  </td>

                  <td className="px-6 py-4">
                    {new Date(sale.date).toLocaleTimeString('en-IN', {
                      timeZone: 'Asia/Kolkata'
                    })}
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