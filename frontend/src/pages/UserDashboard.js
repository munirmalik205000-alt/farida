import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { 
  Wallet, ArrowRightLeft, Smartphone, History, Coins, ShoppingBag,
  TrendingUp, Users, DollarSign, Plus, Package, GitBranch, Banknote, Settings
} from 'lucide-react';
import WalletCards from '../components/WalletCards';
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
      const downlineResponse = await axios.get(`${API}/mlm/downline`, axiosConfig);
      setDashboard(prev => ({ ...prev, total_users: downlineResponse.data.length }));
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardSection dashboard={dashboard} user={user} transactions={transactions} />;
      case 'packages':
        return <PackagesTab token={token} user={user} onPurchaseSuccess={fetchDashboard} />;
      case 'transactions':
        return <TransactionsSection transactions={transactions} />;
      case 'recharge':
        return <RechargeSection rechargeData={rechargeData} setRechargeData={setRechargeData} handleRecharge={handleRecharge} />;
      case 'user-tree':
        return <UserTreeSection downline={downline} commissions={commissions} />;
      case 'ecommerce':
        return <EcommerceSection products={products} orders={orders} handlePurchase={handlePurchase} />;
      case 'withdrawal':
        return <WithdrawalSection token={token} />;
      case 'add-fund':
        return <AddFundSection fundAmount={fundAmount} setFundAmount={setFundAmount} handleFundRequest={handleFundRequest} fundRequests={fundRequests} transferData={transferData} setTransferData={setTransferData} handleTransfer={handleTransfer} />;
      case 'settings':
        return <SettingsSection user={user} />;
      default:
        return <DashboardSection dashboard={dashboard} user={user} transactions={transactions} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} userType="user" />
      
      <div className="flex-1 md:ml-72">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-purple-100 shadow-sm">
          <div className="px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <h1 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Welcome back, {user.full_name}
                </h1>
                <p className="text-sm text-slate-500">Manage your wallet and earnings</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 px-5 py-3 rounded-xl shadow-sm">
                <Coins className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-xs text-purple-700 font-medium">Your Coins</p>
                  <p className="text-2xl font-black text-purple-800" data-testid="user-coins">{user.coins || 0}</p>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{user.full_name}</p>
                  <p className="text-xs text-slate-500">{user.mobile}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="px-8 py-8">
          <WalletCards dashboard={dashboard} />

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-purple-900">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Total Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black text-purple-900" data-testid="total-income">
                  {dashboard?.total_income?.toFixed(2) || '0.00'}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Today's Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black text-blue-900" data-testid="today-income">
                  {dashboard?.today_income?.toFixed(2) || '0.00'}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-emerald-900">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  Repurchase Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black text-emerald-900" data-testid="repurchase-income">
                  {dashboard?.repurchase_income?.toFixed(2) || '0.00'}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                  <Users className="w-5 h-5 text-blue-600" />
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black text-blue-900" data-testid="total-users-count">
                  {dashboard?.total_users || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

/* ========== Dashboard Section ========== */
const DashboardSection = ({ dashboard, user, transactions }) => (
  <div className="grid gap-6" data-testid="dashboard-section">
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
                  document.execCommand('copy');
                  toast.success('Referral code copied!');
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
                <p className="text-lg font-bold text-emerald-600">{txn.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);

/* ========== Transactions Section ========== */
const TransactionsSection = ({ transactions }) => (
  <div className="grid gap-6" data-testid="transactions-section">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-purple-600" />
          All Transactions
        </CardTitle>
        <CardDescription>Complete history of all your transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No transactions yet</p>
        ) : (
          <div className="space-y-3" data-testid="all-transactions-list">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between p-4 border border-purple-100 rounded-xl hover:shadow-md transition-all">
                <div>
                  <p className="font-semibold text-slate-900">{txn.description}</p>
                  <p className="text-sm text-slate-500">{new Date(txn.created_at).toLocaleDateString()}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full font-medium ${
                    txn.type === 'credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>{txn.type || 'transaction'}</span>
                </div>
                <p className={`text-xl font-black ${txn.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {txn.type === 'credit' ? '+' : '-'}{txn.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);

/* ========== Recharge Section ========== */
const RechargeSection = ({ rechargeData, setRechargeData, handleRecharge }) => (
  <div data-testid="recharge-section">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-purple-600" />
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
            <Label>Amount</Label>
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
  </div>
);

/* ========== User Tree (MLM Downline) Section ========== */
const UserTreeSection = ({ downline, commissions }) => (
  <div className="grid gap-6" data-testid="user-tree-section">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-purple-600" />
          My Downline ({downline.length})
        </CardTitle>
        <CardDescription>Users registered under your referral</CardDescription>
      </CardHeader>
      <CardContent>
        {downline.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No downline users yet</p>
        ) : (
          <div className="space-y-3" data-testid="downline-list">
            {downline.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4 border border-purple-100 rounded-xl hover:shadow-md transition-all">
                <div>
                  <p className="font-semibold text-slate-900">{u.full_name}</p>
                  <p className="text-sm text-slate-500">{u.mobile}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-purple-600">Level {u.level}</p>
                  <p className="text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Commission History
        </CardTitle>
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
                    Level {commission.level} - {commission.type} - {new Date(commission.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-lg font-bold text-emerald-600">{commission.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);

/* ========== E-commerce Section ========== */
const EcommerceSection = ({ products, orders, handlePurchase }) => (
  <div className="grid gap-6" data-testid="ecommerce-section">
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
              <p className="text-2xl font-bold text-emerald-600">{product.price.toFixed(2)}</p>
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
                    {new Date(order.created_at).toLocaleDateString()} - Qty: {order.quantity}
                  </p>
                </div>
                <p className="text-lg font-bold text-emerald-600">{order.amount.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);

/* ========== Withdrawal Section ========== */
const WithdrawalSection = ({ token }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bank');

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/wallet/withdrawal`, { amount: parseFloat(amount), method }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Withdrawal request submitted!');
      setAmount('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Withdrawal request failed');
    }
  };

  return (
    <div data-testid="withdrawal-section">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-purple-600" />
            Withdrawal Money
          </CardTitle>
          <CardDescription>Request withdrawal from your Main Wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="space-y-2">
              <Label>Withdrawal Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger data-testid="withdrawal-method-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="paytm">Paytm Wallet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                data-testid="withdrawal-amount-input"
              />
            </div>
            <Button type="submit" className="w-full" data-testid="withdrawal-submit">
              Submit Withdrawal Request
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

/* ========== Add Fund Section ========== */
const AddFundSection = ({ fundAmount, setFundAmount, handleFundRequest, fundRequests, transferData, setTransferData, handleTransfer }) => (
  <div className="grid gap-6" data-testid="add-fund-section">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-purple-600" />
          Add Fund Request
        </CardTitle>
        <CardDescription>Submit a request to add funds to your Main Wallet</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleFundRequest} className="space-y-4">
          <div className="space-y-2">
            <Label>Amount</Label>
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
          <div className="space-y-3" data-testid="fund-requests-list">
            {fundRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 border rounded-md">
                <div>
                  <p className="font-medium">{req.amount.toFixed(2)}</p>
                  <p className="text-sm text-slate-500">{new Date(req.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-purple-100 text-purple-700'
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
          <ArrowRightLeft className="w-5 h-5 text-purple-600" />
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
            <Label>Amount</Label>
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
);

/* ========== Settings Section ========== */
const SettingsSection = ({ user }) => (
  <div data-testid="settings-section">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-600" />
          Account Settings
        </CardTitle>
        <CardDescription>Your profile information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-purple-100 rounded-xl">
              <p className="text-sm text-slate-500">Full Name</p>
              <p className="text-lg font-semibold text-slate-900">{user.full_name}</p>
            </div>
            <div className="p-4 border border-purple-100 rounded-xl">
              <p className="text-sm text-slate-500">Mobile</p>
              <p className="text-lg font-semibold text-slate-900">{user.mobile}</p>
            </div>
            <div className="p-4 border border-purple-100 rounded-xl">
              <p className="text-sm text-slate-500">Email</p>
              <p className="text-lg font-semibold text-slate-900">{user.email || 'Not set'}</p>
            </div>
            <div className="p-4 border border-purple-100 rounded-xl">
              <p className="text-sm text-slate-500">Referral Code</p>
              <p className="text-lg font-semibold text-purple-700">{user.referral_code}</p>
            </div>
            <div className="p-4 border border-purple-100 rounded-xl">
              <p className="text-sm text-slate-500">Account Status</p>
              <p className={`text-lg font-semibold ${user.is_activated ? 'text-emerald-600' : 'text-red-600'}`}>
                {user.is_activated ? 'Activated' : 'Not Activated'}
              </p>
            </div>
            <div className="p-4 border border-purple-100 rounded-xl">
              <p className="text-sm text-slate-500">Coins</p>
              <p className="text-lg font-semibold text-purple-700">{user.coins || 0}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default UserDashboard;
