import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import { Plus, Coins, Package } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminPackages = ({ token }) => {
  const [packages, setPackages] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    coins: '',
    image: '',
    description: ''
  });

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API}/packages`);
      setPackages(response.data);
    } catch (error) {
      console.error('Failed to load packages');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/packages`, {
        ...formData,
        price: parseFloat(formData.price),
        coins: parseInt(formData.coins)
      }, axiosConfig);
      
      toast.success('Package created successfully');
      setIsDialogOpen(false);
      setFormData({ name: '', price: '', coins: '', image: '', description: '' });
      fetchPackages();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create package');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Package Management</h2>
          <p className="text-slate-600 mt-1">Create and manage activation packages</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700" data-testid="create-package-button">
              <Plus className="w-4 h-4 mr-2" />
              Create Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Package</DialogTitle>
              <DialogDescription>Add a new activation package for users</DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Package Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Starter Package"
                  required
                  data-testid="package-name-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="999"
                  required
                  data-testid="package-price-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Coins Reward</Label>
                <Input
                  type="number"
                  value={formData.coins}
                  onChange={(e) => setFormData({ ...formData, coins: e.target.value })}
                  placeholder="100"
                  required
                  data-testid="package-coins-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  required
                  data-testid="package-image-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Package details"
                  data-testid="package-description-input"
                />
              </div>
              
              <Button type="submit" className="w-full" data-testid="submit-package-button">
                Create Package
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="border-2 border-purple-100">
            <div className="h-40 overflow-hidden rounded-t-lg">
              <img 
                src={pkg.image} 
                alt={pkg.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{pkg.name}</CardTitle>
              <CardDescription className="text-sm">{pkg.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-slate-600">Price</p>
                  <p className="text-lg font-bold text-purple-700">₹{pkg.price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-600">Coins</p>
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <p className="text-lg font-bold text-yellow-600">{pkg.coins}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No packages created yet</p>
        </div>
      )}
    </div>
  );
};

export default AdminPackages;
