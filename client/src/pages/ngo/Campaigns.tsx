import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import NgoLayout from '@/components/ngo/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, Edit, Target, Calendar, IndianRupee, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const NgoCampaigns = () => {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['/api/ngo/campaigns'],
    queryFn: async () => {
      const token = localStorage.getItem('ngoToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/ngo/campaigns', { headers });
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      return res.json();
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-700 border border-amber-200 font-medium flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-rose-100 text-rose-700 border border-rose-200 font-medium flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-600 border border-gray-200 font-medium">{status}</Badge>
        );
    }
  };

  const getActivityBadge = (status: string) => {
    if (status === 'active') {
      return (
        <Badge className="bg-emerald-500 text-white text-[10px] font-semibold px-1.5 py-0">LIVE</Badge>
      );
    }
    if (status === 'draft') {
      return (
        <Badge className="bg-gray-400 text-white text-[10px] font-semibold px-1.5 py-0">DRAFT</Badge>
      );
    }
    if (status === 'paused') {
      return (
        <Badge className="bg-amber-500 text-white text-[10px] font-semibold px-1.5 py-0">PAUSED</Badge>
      );
    }
    return null;
  };

  return (
    <NgoLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Campaigns</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage and track all your fundraising campaigns.</p>
          </div>
          <Link href="/ngo/campaigns/create">
            <a className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all hover:from-purple-700 hover:to-purple-600">
              <Plus className="h-4 w-4" />
              Create Campaign
            </a>
          </Link>
        </div>

        {/* Campaign List */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !Array.isArray(campaigns) || campaigns.length === 0 ? (
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="py-16 text-center">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">No campaigns yet</h3>
              <p className="text-sm text-gray-400 max-w-sm mx-auto">
                Create your first campaign to start receiving donations and making an impact.
              </p>
              <Link href="/ngo/campaigns/create">
                <a className="inline-flex items-center gap-2 mt-5 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                  <Plus className="h-4 w-4" />
                  Create First Campaign
                </a>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {campaigns.map((campaign: any) => (
              <Card
                key={campaign.id}
                className="border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Cover Image */}
                  {campaign.coverImage && (
                    <div className="md:w-48 h-32 md:h-auto shrink-0 overflow-hidden bg-gray-100 relative">
                      <img
                        src={campaign.coverImage}
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute top-2 left-2">
                        {getActivityBadge(campaign.status)}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <CardContent className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-base truncate">{campaign.title}</h3>
                          {getStatusBadge(campaign.approvalStatus)}
                          {!campaign.coverImage && getActivityBadge(campaign.status)}
                        </div>

                        {campaign.shortDescription && (
                          <p className="text-sm text-gray-500 line-clamp-2">{campaign.shortDescription}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 pt-1">
                          <span className="flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />
                            Goal: ₹{Number(campaign.goalAmount).toLocaleString()}
                          </span>
                          {campaign.startDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(campaign.startDate), 'dd MMM yyyy')}
                              {campaign.endDate && ` – ${format(new Date(campaign.endDate), 'dd MMM yyyy')}`}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link href={`/ngo/campaigns/${campaign.id}/edit`}>
                        <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </Link>
                    </div>

                    {campaign.adminRemarks && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm text-amber-800 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                        <div>
                          <span className="font-medium">Admin Remarks:</span> {campaign.adminRemarks}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </NgoLayout>
  );
};

export default NgoCampaigns;
