import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { 
  Users, DollarSign, LogOut, CheckCircle, XCircle, 
  TrendingUp, Wallet, History, Shield
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = ({ user, token, onLogout }) => {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [fundRequests, setFundRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchDashboard();
    fetchUsers();
    fetchFundRequests();
    fetchTransactions();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API}/admin/dashboard`, axiosConfig);
      setDashboard(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`, axiosConfig);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const fetchFundRequests = async () => {
    try {
      const response = await axios.get(`${API}/admin/fund-requests`, axiosConfig);
      setFundRequests(response.data);
    } catch (error) {
      console.error('Failed to load fund requests');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API}/admin/transactions`, axiosConfig);
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to load transactions');
    }
  };

  const handleApproveFundRequest = async (requestId) => {
    try {
      await axios.post(`${API}/admin/fund-requests/${requestId}/approve`, {}, axiosConfig);
      toast.success('Fund request approved');
      fetchFundRequests();
      fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Approval failed');
    }
  };

  const handleRejectFundRequest = async (requestId) => {
    try {
      await axios.post(`${API}/admin/fund-requests/${requestId}/reject`, {}, axiosConfig);
      toast.success('Fund request rejected');
      fetchFundRequests();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Rejection failed');
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

  const pendingRequests = fundRequests.filter(req => req.status === 'pending');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Admin Panel
              </h1>
              <p className="text-xs text-slate-600">Smartpay360 Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm text-slate-600">{user.full_name}</p>
              <p className="text-xs text-emerald-600 font-medium">Administrator</p>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout} data-testid="admin-logout-button">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                <Users className="w-5 h-5 text-blue-600" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-slate-900" data-testid="admin-total-users">
                {dashboard?.total_users || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                <Wallet className="w-5 h-5 text-emerald-600" />
                Total Main Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-slate-900" data-testid="admin-total-main-wallet">
                ₹{dashboard?.main_wallet?.toFixed(2) || '0.00'}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                <DollarSign className="w-5 h-5 text-green-600" />
                Total E-Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-slate-900" data-testid="admin-total-e-wallet">
                ₹{dashboard?.e_wallet?.toFixed(2) || '0.00'}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-slate-700">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-slate-900" data-testid="admin-pending-requests">
                {dashboard?.pending_fund_requests || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="dashboard" data-testid="admin-tab-dashboard">Overview</TabsTrigger>
            <TabsTrigger value="requests" data-testid="admin-tab-requests">
              Fund Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="admin-tab-users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>Latest platform transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No transactions yet</p>
                ) : (
                  <div className="space-y-3" data-testid="admin-transactions-list">
                    {transactions.slice(0, 10).map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-slate-50">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{txn.user_name}</p>
                          <p className="text-sm text-slate-600">{txn.description}</p>
                          <p className="text-xs text-slate-500">{new Date(txn.created_at).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-600">₹{txn.amount.toFixed(2)}</p>
                          <p className="text-xs text-slate-500">{txn.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Fund Requests Management</CardTitle>
                <CardDescription>Approve or reject user fund requests</CardDescription>
              </CardHeader>
              <CardContent>
                {fundRequests.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No fund requests</p>
                ) : (
                  <div className="space-y-4" data-testid="admin-fund-requests-list">
                    {fundRequests.map((request) => (
                      <div key={request.id} className="p-4 border rounded-md hover:bg-slate-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{request.user_name}</p>
                            <p className="text-sm text-slate-600">{request.user_mobile}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(request.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-600">₹{request.amount.toFixed(2)}</p>
                            <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                              request.status === 'approved' ? 'bg-green-100 text-green-700' :
                              request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {request.status}
                            </span>
                          </div>
                        </div>
                        
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleApproveFundRequest(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                              data-testid={`approve-request-${request.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleRejectFundRequest(request.id)}
                              data-testid={`reject-request-${request.id}`}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>All registered users on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No users found</p>
                ) : (
                  <div className="space-y-3" data-testid="admin-users-list">
                    {users.map((userItem) => (
                      <div key={userItem.id} className="p-4 border rounded-md hover:bg-slate-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900">{userItem.full_name}</p>
                              {userItem.is_admin && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">{userItem.mobile}</p>
                            <p className="text-xs text-slate-500">
                              Referral Code: <span className="font-mono font-medium">{userItem.referral_code}</span> • Level {userItem.level}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              Joined: {new Date(userItem.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-700">
                              Main: <span className="text-emerald-600">₹{userItem.main_wallet.toFixed(2)}</span>
                            </p>
                            <p className="text-sm font-medium text-slate-700">
                              E-Wallet: <span className="text-green-600">₹{userItem.e_wallet.toFixed(2)}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
