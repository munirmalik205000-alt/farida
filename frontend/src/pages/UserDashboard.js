import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Wallet, ArrowRightLeft, Smartphone, History, Coins, ShoppingBag,
  TrendingUp, Users, LogOut, DollarSign, Plus
} from 'lucide-react';
import WalletCards from '../components/WalletCards';
import IncomeStats from '../components/IncomeStats';
import Sidebar from '../components/Sidebar';
import PackagesTab from '../components/PackagesTab';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const UserDashboard = ({ user, token, onLogout }) => {
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [downline, setDownline] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [fundRequests, setFundRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [fundAmount, setFundAmount] = useState('');
  const [transferData, setTransferData] = useState({ mobile: '', amount: '' });
  const [rechargeData, setRechargeData] = useState({
    service_type: 'mobile',
    number: '',
    amount: '',
    operator: '',
    use_coins: false
  });

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/user/dashboard`, axiosConfig);
      setDashboard(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/transactions`, axiosConfig);
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to load transactions');
    }
  }, [token]);

  const fetchCommissions = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/mlm/commissions`, axiosConfig);
      setCommissions(response.data);
    } catch (error) {
      console.error('Failed to load commissions');
    }
  }, [token]);

  const fetchDownline = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/mlm/downline`, axiosConfig);
      setDownline(response.data);
    } catch (error) {
      console.error('Failed to load downline');
    }
  }, [token]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products');
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/orders`, axiosConfig);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders');
    }
  }, [token]);

  const fetchFundRequests = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/wallet/fund-requests`, axiosConfig);
      setFundRequests(response.data);
    } catch (error) {
      console.error('Failed to load fund requests');
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard();
    fetchTransactions();
    fetchCommissions();
    fetchDownline();
    fetchProducts();
    fetchOrders();
    fetchFundRequests();
  }, [fetchDashboard, fetchTransactions, fetchCommissions, fetchDownline, fetchProducts, fetchOrders, fetchFundRequests]);

  const handleFundRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/wallet/fund-request`, { amount: parseFloat(fundAmount) }, axiosConfig);
      toast.success('Fund request submitted successfully');
      setFundAmount('');
      fetchFundRequests();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Fund request failed');
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/wallet/transfer`, {
        to_user_mobile: transferData.mobile,
        amount: parseFloat(transferData.amount)
      }, axiosConfig);
      toast.success('Transfer successful');
      setTransferData({ mobile: '', amount: '' });
      fetchDashboard();
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Transfer failed');
    }
  };

  const handleRecharge = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/recharge`, {
        ...rechargeData,
        amount: parseFloat(rechargeData.amount)
      }, axiosConfig);
      toast.success('Recharge successful');
      setRechargeData({ service_type: 'mobile', number: '', amount: '', operator: '', use_coins: false });
      fetchDashboard();
      fetchTransactions();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Recharge failed');
    }
  };

  const handlePurchase = async (productId) => {
    try {
      await axios.post(`${API}/orders`, { product_id: productId, quantity: 1 }, axiosConfig);
      toast.success('Purchase successful');
      fetchDashboard();
      fetchOrders();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Purchase failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} userType="user" />
      
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-slate-200/40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Smartpay360
                </h1>
                <p className="text-xs text-slate-500">{user.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-md">
                <Coins className="w-5 h-5 text-yellow-600" />
                <span className="font-bold text-yellow-700" data-testid="user-coins">{user.coins || 0}</span>
              </div>
            </div>
          </div>
        </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Wallet Cards */}
        <WalletCards dashboard={dashboard} />

        {/* Income Stats */}
        <IncomeStats dashboard={dashboard} />

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto bg-white border-2 border-blue-200">
            <TabsTrigger value="dashboard" data-testid="tab-dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Dashboard</TabsTrigger>
            <TabsTrigger value="wallet" data-testid="tab-wallet" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Wallet</TabsTrigger>
            <TabsTrigger value="recharge" data-testid="tab-recharge" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Recharge</TabsTrigger>
            <TabsTrigger value="ecommerce" data-testid="tab-ecommerce" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">E-commerce</TabsTrigger>
            <TabsTrigger value="mlm" data-testid="tab-mlm" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">MLM</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Referral Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 p-4 bg-blue-50 rounded-md border-2 border-blue-300">
                      <p className="text-3xl font-bold text-blue-900 tracking-wider" data-testid="referral-code">
                        {user.referral_code}
                      </p>
                    </div>
                    <Button 
                      onClick={async () => {
                        try {
                          if (navigator.clipboard && window.isSecureContext) {
                            await navigator.clipboard.writeText(user.referral_code);
                            toast.success('Referral code copied!');
                          } else {
                            const textArea = document.createElement('textarea');
                            textArea.value = user.referral_code;
                            textArea.style.position = 'fixed';
                            textArea.style.left = '-999999px';
                            document.body.appendChild(textArea);
                            textArea.focus();
                            textArea.select();
                            try {
                              document.execCommand('copy');
                              toast.success('Referral code copied!');
                            } catch (err) {
                              toast.info(`Code: ${user.referral_code}`);
                            }
                            document.body.removeChild(textArea);
                          }
                        } catch (err) {
                          toast.info(`Your referral code: ${user.referral_code}`);
                        }
                      }}
                      data-testid="copy-referral-button"
                    >
                      Copy Code
                    </Button>
                  </div>
                  <p className="text-sm text-slate-600 mt-3">Share this code with friends to earn commissions</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No transactions yet</p>
                  ) : (
                    <div className="space-y-3" data-testid="transactions-list">
                      {transactions.slice(0, 5).map((txn) => (
                        <div key={txn.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <p className="font-medium text-slate-900">{txn.description}</p>
                            <p className="text-sm text-slate-500">{new Date(txn.created_at).toLocaleDateString()}</p>
                          </div>
                          <p className="text-lg font-bold text-emerald-600">₹{txn.amount.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="wallet">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Fund Request
                  </CardTitle>
                  <CardDescription>Submit a request to add funds to your Main Wallet</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFundRequest} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Amount (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter amount"
                        value={fundAmount}
                        onChange={(e) => setFundAmount(e.target.value)}
                        required
                        data-testid="fund-amount-input"
                      />
                    </div>
                    <Button type="submit" data-testid="fund-request-submit">Submit Request</Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fund Request History</CardTitle>
                </CardHeader>
                <CardContent>
                  {fundRequests.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No fund requests yet</p>
                  ) : (
                    <div className="space-y-3">
                      {fundRequests.map((req) => (
                        <div key={req.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <p className="font-medium">₹{req.amount.toFixed(2)}</p>
                            <p className="text-sm text-slate-500">{new Date(req.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            req.status === 'approved' ? 'bg-green-100 text-green-700' :
                            req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5" />
                    Transfer E-Wallet
                  </CardTitle>
                  <CardDescription>Transfer funds to another user's E-Wallet</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTransfer} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Recipient Mobile Number</Label>
                      <Input
                        type="tel"
                        placeholder="Enter mobile number"
                        value={transferData.mobile}
                        onChange={(e) => setTransferData({ ...transferData, mobile: e.target.value })}
                        required
                        data-testid="transfer-mobile-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter amount"
                        value={transferData.amount}
                        onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                        required
                        data-testid="transfer-amount-input"
                      />
                    </div>
                    <Button type="submit" data-testid="transfer-submit">Transfer</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recharge">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Recharge Services
                </CardTitle>
                <CardDescription>Recharge mobile, DTH, or pay utility bills</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRecharge} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Service Type</Label>
                    <Select 
                      value={rechargeData.service_type}
                      onValueChange={(value) => setRechargeData({ ...rechargeData, service_type: value })}
                    >
                      <SelectTrigger data-testid="recharge-service-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile">Mobile Recharge</SelectItem>
                        <SelectItem value="dth">DTH Recharge</SelectItem>
                        <SelectItem value="electricity">Electricity Bill</SelectItem>
                        <SelectItem value="gas">Gas Bill</SelectItem>
                        <SelectItem value="water">Water Bill</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Number / Account ID</Label>
                    <Input
                      type="text"
                      placeholder="Enter number or account ID"
                      value={rechargeData.number}
                      onChange={(e) => setRechargeData({ ...rechargeData, number: e.target.value })}
                      required
                      data-testid="recharge-number-input"
                    />
                  </div>
                  {rechargeData.service_type === 'mobile' && (
                    <div className="space-y-2">
                      <Label>Operator (Optional)</Label>
                      <Input
                        type="text"
                        placeholder="e.g., Airtel, Jio, Vi"
                        value={rechargeData.operator}
                        onChange={(e) => setRechargeData({ ...rechargeData, operator: e.target.value })}
                        data-testid="recharge-operator-input"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter amount"
                      value={rechargeData.amount}
                      onChange={(e) => setRechargeData({ ...rechargeData, amount: e.target.value })}
                      required
                      data-testid="recharge-amount-input"
                    />
                  </div>
                  <Button type="submit" className="w-full" data-testid="recharge-submit">
                    Proceed to Recharge
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ecommerce">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <CardHeader>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-emerald-600">₹{product.price.toFixed(2)}</p>
                        <Button 
                          onClick={() => handlePurchase(product.id)}
                          disabled={product.stock === 0}
                          data-testid={`buy-product-${product.id}`}
                        >
                          {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
                        </Button>
                      </div>
                      <p className="text-sm text-slate-500 mt-2">Stock: {product.stock}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>My Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No orders yet</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <p className="font-medium">{order.product_name}</p>
                            <p className="text-sm text-slate-500">
                              {new Date(order.created_at).toLocaleDateString()} • Qty: {order.quantity}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-emerald-600">₹{order.amount.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="mlm">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    My Downline ({downline.length})
                  </CardTitle>
                  <CardDescription>Users registered under your referral</CardDescription>
                </CardHeader>
                <CardContent>
                  {downline.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No downline users yet</p>
                  ) : (
                    <div className="space-y-3" data-testid="downline-list">
                      {downline.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-md">
                          <div>
                            <p className="font-medium text-slate-900">{user.full_name}</p>
                            <p className="text-sm text-slate-500">{user.mobile}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-emerald-600">Level {user.level}</p>
                            <p className="text-xs text-slate-500">{new Date(user.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Commission History</CardTitle>
                  <CardDescription>Your earnings from downline activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {commissions.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No commissions yet</p>
                  ) : (
                    <div className="space-y-3" data-testid="commissions-list">
                      {commissions.map((commission) => (
                        <div key={commission.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div>
                            <p className="font-medium text-slate-900">From: {commission.from_user_name}</p>
                            <p className="text-sm text-slate-500">
                              Level {commission.level} • {commission.type} • {new Date(commission.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-emerald-600">₹{commission.amount.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserDashboard;
