import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Coins } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminSettings = ({ token }) => {
  const [coinPercentage, setCoinPercentage] = useState('10');
  const [loading, setLoading] = useState(true);

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/admin/settings`, axiosConfig);
      setCoinPercentage(response.data.coin_usage_percentage.toString());
    } catch (error) {
      console.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/settings`, {
        coin_usage_percentage: parseFloat(coinPercentage)
      }, axiosConfig);
      
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Platform Settings</h2>
        <p className="text-slate-600 mt-1">Configure platform parameters</p>
      </div>

      <Card className="max-w-2xl border-2 border-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Coins className="w-5 h-5" />
            Coin Usage Settings
          </CardTitle>
          <CardDescription>
            Set the maximum percentage of recharge amount that can be paid using coins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coin-percentage">Maximum Coin Usage Percentage (%)</Label>
              <Input
                id="coin-percentage"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={coinPercentage}
                onChange={(e) => setCoinPercentage(e.target.value)}
                placeholder="10"
                required
                data-testid="coin-percentage-input"
              />
              <p className="text-sm text-slate-500">
                Example: If set to 10%, users can pay up to 10% of recharge amount with coins
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
              <h4 className="font-medium text-purple-900 mb-2">Example Calculation:</h4>
              <p className="text-sm text-slate-700">
                Recharge Amount: ₹100<br />
                Max Coin Usage ({coinPercentage}%): {coinPercentage} coins<br />
                User Pays: ₹{100 - parseFloat(coinPercentage || 0)} + {coinPercentage} coins
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              data-testid="save-settings-button"
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
