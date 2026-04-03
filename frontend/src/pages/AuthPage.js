import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Wallet, Zap, Eye, EyeOff } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthPage = ({ onLogin }) => {
  const [loginData, setLoginData] = useState({ mobile: '', password: '' });
  const [signupData, setSignupData] = useState({
    referral_code: '',
    full_name: '',
    mobile: '',
    password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      toast.success('Login successful!');
      onLogin(response.data.token, response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      const { confirm_password, ...payload } = signupData;
      const response = await axios.post(`${API}/auth/signup`, payload);
      toast.success('Signup successful!');
      onLogin(response.data.token, response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2">
      {/* Left Side - Branding */}
      <div 
        className="hidden lg:flex flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1774289123157-7c108ff96819?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG1lc2glMjBncmFkaWVudCUyMGJhY2tncm91bmQlMjBibHVlJTIwZ3JlZW58ZW58MHx8fHwxNzc1MjQ1MDkyfDA&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/80 via-blue-900/70 to-slate-900/90"></div>
        <div className="relative z-10 text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="relative">
              <Wallet className="w-16 h-16 text-emerald-400" strokeWidth={1.5} />
              <Zap className="w-8 h-8 text-white absolute -bottom-1 -right-1" />
            </div>
          </div>
          <h1 className="text-6xl font-black tracking-tight text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Smartpay360
          </h1>
          <p className="text-xl text-emerald-100 max-w-md" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Your Complete Recharge & MLM Platform
          </p>
          <div className="pt-8 space-y-4 text-white/90">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-left">Dual Wallet System</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <p className="text-left">Mobile & DTH Recharge</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <p className="text-left">20 Level MLM System</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Wallet className="w-10 h-10 text-emerald-600" />
              <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Smartpay360</h1>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white border-2 border-blue-200">
              <TabsTrigger value="login" data-testid="login-tab" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Login</TabsTrigger>
              <TabsTrigger value="signup" data-testid="signup-tab" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Login to your Smartpay360 account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-mobile">Mobile Number</Label>
                      <Input
                        id="login-mobile"
                        data-testid="login-mobile-input"
                        type="tel"
                        placeholder="Enter your mobile number"
                        value={loginData.mobile}
                        onChange={(e) => setLoginData({ ...loginData, mobile: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          data-testid="login-password-input"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                      data-testid="login-submit-button"
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create Account</CardTitle>
                  <CardDescription>Join Smartpay360 and start earning</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="referral-code">Referral Code *</Label>
                      <Input
                        id="referral-code"
                        data-testid="signup-referral-input"
                        type="text"
                        placeholder="Enter referral code"
                        value={signupData.referral_code}
                        onChange={(e) => setSignupData({ ...signupData, referral_code: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="full-name">Full Name</Label>
                      <Input
                        id="full-name"
                        data-testid="signup-name-input"
                        type="text"
                        placeholder="Enter your full name"
                        value={signupData.full_name}
                        onChange={(e) => setSignupData({ ...signupData, full_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-mobile">Mobile Number</Label>
                      <Input
                        id="signup-mobile"
                        data-testid="signup-mobile-input"
                        type="tel"
                        placeholder="Enter your mobile number"
                        value={signupData.mobile}
                        onChange={(e) => setSignupData({ ...signupData, mobile: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        data-testid="signup-password-input"
                        type="password"
                        placeholder="Create a password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        data-testid="signup-confirm-password-input"
                        type="password"
                        placeholder="Confirm your password"
                        value={signupData.confirm_password}
                        onChange={(e) => setSignupData({ ...signupData, confirm_password: e.target.value })}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                      data-testid="signup-submit-button"
                    >
                      {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-slate-600">
            <p>Demo Admin Login:</p>
            <p className="font-mono">Mobile: 9999999999 | Password: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
