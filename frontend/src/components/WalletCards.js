import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Wallet, DollarSign } from 'lucide-react';

const WalletCards = ({ dashboard }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Card 
        className="relative overflow-hidden border-0 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1774289123157-7c108ff96819?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG1lc2glMjBncmFkaWVudCUyMGJhY2tncm91bmQlMjBibHVlJTIwZ3JlZW58ZW58MHx8fHwxNzc1MjQ1MDkyfDA&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-slate-900/80 backdrop-blur-xl"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Main Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-5xl font-black text-white tracking-tighter" style={{ fontFamily: 'Outfit, sans-serif' }} data-testid="main-wallet-balance">
            ₹{dashboard?.main_wallet?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-emerald-300 mt-2">Used for recharges & bills</p>
        </CardContent>
      </Card>

      <Card 
        className="relative overflow-hidden border-0 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1774289123157-7c108ff96819?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG1lc2glMjBncmFkaWVudCUyMGJhY2tncm91bmQlMjBibHVlJTIwZ3JlZW58ZW58MHx8fHwxNzc1MjQ1MDkyfDA&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 to-green-700/80 backdrop-blur-xl"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            E-Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-5xl font-black text-white tracking-tighter" style={{ fontFamily: 'Outfit, sans-serif' }} data-testid="e-wallet-balance">
            ₹{dashboard?.e_wallet?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-white/90 mt-2">Commissions & transfers</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletCards;
