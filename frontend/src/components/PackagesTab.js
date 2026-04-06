import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { ShoppingBag, Coins, CheckCircle } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PackagesTab = ({ token, user, onPurchaseSuccess }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API}/packages`);
      setPackages(response.data);
    } catch (error) {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId) => {
    try {
      await axios.post(`${API}/packages/${packageId}/purchase`, {}, axiosConfig);
      toast.success('Package purchased successfully! Coins added to your account');
      if (onPurchaseSuccess) onPurchaseSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Purchase failed');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading packages...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Activation Packages</h2>
          <p className="text-slate-600 mt-1">Purchase a package to activate your ID and earn coins</p>
        </div>
        {user?.is_activated && (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="w-4 h-4 mr-1" />
            ID Activated
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-lg">
            <div className="h-48 overflow-hidden rounded-t-lg">
              <img 
                src={pkg.image} 
                alt={pkg.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-xl text-purple-700">{pkg.name}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Price</p>
                  <p className="text-2xl font-bold text-purple-700">₹{pkg.price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Coins Reward</p>
                  <div className="flex items-center gap-1">
                    <Coins className="w-5 h-5 text-purple-500" />
                    <p className="text-2xl font-bold text-purple-600">{pkg.coins}</p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={() => handlePurchase(pkg.id)}
                className="w-full bg-purple-600 hover:bg-purple-700"
                data-testid={`purchase-package-${pkg.id}`}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Purchase Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No packages available at the moment</p>
        </div>
      )}
    </div>
  );
};

export default PackagesTab;
