'use client';

import { useWealthData } from '@/hooks/useWealthData';
import Header from '@/components/Header';
import StatusRow from '@/components/StatusRow';
import RevenueChart from '@/components/RevenueChart';
import NetWorthChart from '@/components/NetWorthChart';
import LifestyleChart from '@/components/LifestyleChart';
import IncomeStatement from '@/components/IncomeStatement';
import ProsperityPanel from '@/components/ProsperityPanel';
import WealthCoach from '@/components/WealthCoach';
import AssetLibrary from '@/components/AssetLibrary';
import SellingPriority from '@/components/SellingPriority';

export default function WealthDashboard() {
  const data = useWealthData();

  return (
    <>
      <div className="grain" />
      <div className="app">
        <Header name={data.config.fullName} />
        <StatusRow kpis={data.kpis} />

        {/* Row 1: Revenue + Income Statement */}
        <div className="grid-wide">
          <RevenueChart data={data.revenueChartData} />
          <IncomeStatement data={data.incomeStatements} />
        </div>

        {/* Row 2: Net Worth + Prosperity */}
        <div className="grid-wide">
          <NetWorthChart data={data.netWorthChartData} />
          <ProsperityPanel data={data.prosperityData} kpis={data.kpis} />
        </div>

        {/* Row 3: Lifestyle + Wealth Coach */}
        <div className="grid-wide">
          <LifestyleChart data={data.lifestyleChartData} />
          <WealthCoach messages={data.wealthCoach} />
        </div>

        {/* Row 4: Asset Library + Selling Priority */}
        <div className="grid-wide">
          <AssetLibrary
            categories={data.assetCategories}
            lowRatedAssets={data.lowRatedAssets}
            debtTip={data.debtTip}
          />
          <SellingPriority data={data.sellingPriority} />
        </div>
      </div>
    </>
  );
}
