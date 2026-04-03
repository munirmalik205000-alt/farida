import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';

const IncomeStats = ({ dashboard }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="border border-blue-200 bg-blue-50 hover:shadow-lg hover:-translate-y-1 transition-all">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Total Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-900" data-testid="total-income">
            ₹{dashboard?.total_income?.toFixed(2) || '0.00'}
          </p>
        </CardContent>
      </Card>

      <Card className="border border-blue-200 bg-blue-50 hover:shadow-lg hover:-translate-y-1 transition-all">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Today's Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-900" data-testid="today-income">
            ₹{dashboard?.today_income?.toFixed(2) || '0.00'}
          </p>
        </CardContent>
      </Card>

      <Card className="border border-emerald-200 bg-emerald-50 hover:shadow-lg hover:-translate-y-1 transition-all">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-emerald-900">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            Repurchase Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-emerald-900" data-testid="repurchase-income">
            ₹{dashboard?.repurchase_income?.toFixed(2) || '0.00'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeStats;
