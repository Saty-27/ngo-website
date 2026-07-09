import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import NgoLayout from '@/components/ngo/Layout';
import { Card, CardContent } from '@/components/ui/card';
import useNgoAuth from '@/hooks/useNgoAuth';
import { Loader2, FileText, Target, Clock, Heart, IndianRupee, TrendingUp, ArrowRight } from 'lucide-react';

const NgoDashboard = () => {
  const { ngo } = useNgoAuth();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/ngo/dashboard'],
    queryFn: async () => {
      const token = localStorage.getItem('ngoToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/ngo/dashboard', { headers });
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <NgoLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </NgoLayout>
    );
  }

  const statCards = [
    {
      label: 'Total Campaigns',
      value: dashboardData?.totalCampaigns || 0,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-600',
      link: '/ngo/campaigns',
    },
    {
      label: 'Active Campaigns',
      value: dashboardData?.activeCampaigns || 0,
      icon: Target,
      color: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      link: '/ngo/campaigns',
    },
    {
      label: 'Pending Approval',
      value: dashboardData?.pendingCampaigns || 0,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      bgLight: 'bg-amber-50',
      textColor: 'text-amber-600',
      link: '/ngo/campaigns',
    },
    {
      label: 'Total Donations',
      value: dashboardData?.totalDonations || 0,
      icon: Heart,
      color: 'from-rose-500 to-rose-600',
      bgLight: 'bg-rose-50',
      textColor: 'text-rose-600',
      link: '/ngo/donations',
    },
    {
      label: 'Amount Raised',
      value: `₹${(dashboardData?.totalAmountRaised || 0).toLocaleString()}`,
      icon: IndianRupee,
      color: 'from-purple-500 to-purple-600',
      bgLight: 'bg-purple-50',
      textColor: 'text-purple-600',
      link: '/ngo/donations',
    },
  ];

  return (
    <NgoLayout>
      <div className="space-y-6">
        {/* Welcome header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Welcome back, <span className="font-medium text-gray-700">{ngo?.name || 'NGO'}</span>. Here's your overview.
            </p>
          </div>
          <Link href="/ngo/campaigns/create">
            <a className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all hover:from-purple-700 hover:to-purple-600">
              <TrendingUp className="h-4 w-4" />
              Create Campaign
            </a>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link key={index} href={stat.link}>
                <a className="block group">
                  <Card className="border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group-hover:border-gray-300 overflow-hidden relative">
                    <CardContent className="pt-5 pb-5 px-5">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{stat.label}</p>
                          <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                        </div>
                        <div className={`${stat.bgLight} w-10 h-10 rounded-lg flex items-center justify-center shrink-0`}>
                          <Icon className={`h-5 w-5 ${stat.textColor}`} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-3 text-xs text-gray-400 group-hover:text-primary transition-colors">
                        <span>View details</span>
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </NgoLayout>
  );
};

export default NgoDashboard;
