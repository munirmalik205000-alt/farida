import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { 
  Users, DollarSign, LogOut, CheckCircle, XCircle, 
  TrendingUp, Wallet, History, Shield
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AdminPackages from '../components/AdminPackages';
import AdminSettings from '../components/AdminSettings';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = ({ user, token, onLogout }) => {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [fundRequests, setFundRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/dashboard`, axiosConfig);
      setDashboard(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/users`, axiosConfig);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to load users');
    }
  }, [token]);

  const fetchFundRequests = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/fund-requests`, axiosConfig);
      setFundRequests(response.data);
    } catch (error) {
      console.error('Failed to load fund requests');
    }
  }, [token]);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/admin/transactions`, axiosConfig);
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to load transactions');
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard();
    fetchUsers();
    fetchFundRequests();
    fetchTransactions();
  }, [fetchDashboard, fetchUsers, fetchFundRequests, fetchTransactions]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} userType="admin" />
      
      <div className="flex-1 md:ml-72">
        {/* Header - Desktop Optimized */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-purple-100 shadow-sm">
          <div className="px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-10 h-10 text-purple-600" />
              <div>
                <h1 className="text-xl font-bold text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Admin Control Panel
                </h1>
                <p className="text-sm text-slate-500">Manage platform and users</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{user.full_name}</p>
                  <p className="text-xs text-purple-600 font-medium">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="px-8 py-8">
          {/* Stats Grid - Only show on dashboard */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <Card className="border border-blue-200 bg-blue-50 hover:shadow-lg hover:-translate-y-1 transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                    <Users className="w-5 h-5 text-blue-600" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-black text-blue-900" data-testid="admin-total-users">
                    {dashboard?.total_users || 0}
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-emerald-200 bg-emerald-50 hover:shadow-lg hover:-translate-y-1 transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-emerald-900">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                    Total Main Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-black text-emerald-900" data-testid="admin-total-main-wallet">
                    ₹{dashboard?.main_wallet?.toFixed(2) || '0.00'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-green-200 bg-green-50 hover:shadow-lg hover:-translate-y-1 transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-green-900">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Total E-Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-black text-green-900" data-testid="admin-total-e-wallet">
                    ₹{dashboard?.e_wallet?.toFixed(2) || '0.00'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-orange-200 bg-orange-50 hover:shadow-lg hover:-translate-y-1 transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-orange-900">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    Pending Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-black text-orange-900" data-testid="admin-pending-requests">
                    {dashboard?.pending_fund_requests || 0}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Dashboard Content */}
          {activeTab === 'dashboard' && (
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
          )}

          {/* Fund Requests Tab */}
          {activeTab === 'requests' && (
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
          )}

          {/* Packages Tab */}
          {activeTab === 'packages' && (
            <AdminPackages token={token} />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <AdminSettings token={token} />
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
