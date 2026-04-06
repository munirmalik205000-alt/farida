import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Coins } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CoinHistory = ({ token }) => {
  const [recharges, setRecharges] = useState([]);
  const [loading, setLoading] = useState(true);

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchRechargeHistory();
  }, []);

  const fetchRechargeHistory = async () => {
    try {
      const response = await axios.get(`${API}/recharge/history`, axiosConfig);
      setRecharges(response.data);
    } catch (error) {
      console.error('Failed to load recharge history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading coin history...</div>;
  }

  const rechargesWithCoins = recharges.filter(r => r.coins_used && r.coins_used > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Coin Usage History</h2>
        <p className="text-slate-600 mt-1">Track where you've used your coins</p>
      </div>

      <Card className="border-2 border-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Coins className="w-5 h-5" />
            Coin Usage Report
          </CardTitle>
          <CardDescription>Your coin redemption history for recharges</CardDescription>
        </CardHeader>
        <CardContent>
          {rechargesWithCoins.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No coins used yet</p>
              <p className="text-sm text-slate-400 mt-2">Use coins during recharge to save money!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rechargesWithCoins.map((recharge) => (
                <div key={recharge.id} className="p-4 border-2 border-purple-100 rounded-lg hover:bg-purple-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900 capitalize">{recharge.service_type} Recharge</p>
                      <p className="text-sm text-slate-600">{recharge.number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">
                        {new Date(recharge.created_at).toLocaleDateString()}
                      </p>
                      <p className={`text-xs font-medium ${
                        recharge.status === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {recharge.status}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-purple-100">
                    <div>
                      <p className="text-xs text-slate-500">Total Amount</p>
                      <p className="text-lg font-bold text-slate-900">₹{recharge.amount?.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Coins Used</p>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-purple-500" />
                        <p className="text-lg font-bold text-purple-600">{recharge.coins_used}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Paid</p>
                      <p className="text-lg font-bold text-emerald-600">₹{recharge.final_amount?.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-700">
                    ✓ Saved ₹{(recharge.amount - recharge.final_amount)?.toFixed(2)} using coins
                  </div>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Total Savings</h4>
                <p className="text-3xl font-black text-purple-700">
                  ₹{rechargesWithCoins.reduce((sum, r) => sum + (r.amount - r.final_amount), 0).toFixed(2)}
                </p>
                <p className="text-sm text-purple-600 mt-1">
                  You've saved money by using {rechargesWithCoins.reduce((sum, r) => sum + r.coins_used, 0)} coins
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoinHistory;
