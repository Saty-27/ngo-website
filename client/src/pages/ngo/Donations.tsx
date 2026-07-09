import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import NgoLayout from '@/components/ngo/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Eye, Download, Loader2, Heart, CheckCircle2, Clock, XCircle, Phone, Mail, User } from 'lucide-react';
import { format } from 'date-fns';

interface DonationItem {
  donation: {
    id: number;
    amount: number;
    name: string;
    email: string;
    phone: string;
    address?: string;
    message?: string;
    paymentId?: string;
    status: string;
    paymentProofFile?: string;
    rejectionReason?: string;
    createdAt: string;
  };
  campaign: {
    id: number;
    title: string;
    goalAmount: number;
  } | null;
}

const NgoDonations = () => {
  const [selectedDonation, setSelectedDonation] = useState<DonationItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');

  const { data: donations = [], isLoading } = useQuery<DonationItem[]>({
    queryKey: ['/api/ngo/donations'],
    queryFn: async () => {
      const token = localStorage.getItem('ngoToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/ngo/donations', { headers });
      if (!res.ok) throw new Error('Failed to fetch donations');
      return res.json();
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 font-medium border border-emerald-200 flex items-center gap-1 w-fit">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-rose-100 text-rose-700 font-medium border border-rose-200 flex items-center gap-1 w-fit">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 text-amber-700 font-medium border border-amber-200 flex items-center gap-1 w-fit">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  const uniqueCampaigns = Array.from(
    new Map(
      donations
        .filter((d) => d.campaign)
        .map((d) => [d.campaign!.id, d.campaign!])
    ).values()
  );

  const filteredDonations = donations.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.donation.name.toLowerCase().includes(q) ||
      item.donation.email.toLowerCase().includes(q) ||
      (item.campaign?.title || '').toLowerCase().includes(q) ||
      (item.donation.paymentId && item.donation.paymentId.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'all' || item.donation.status === statusFilter;
    const matchesCampaign =
      campaignFilter === 'all' || (item.campaign && item.campaign.id === parseInt(campaignFilter));

    return matchesSearch && matchesStatus && matchesCampaign;
  });

  const totalAmount = filteredDonations.reduce((sum, d) => sum + d.donation.amount, 0);
  const approvedCount = filteredDonations.filter((d) => d.donation.status === 'approved').length;
  const pendingCount = filteredDonations.filter((d) => d.donation.status === 'pending').length;

  const handleExport = async () => {
    const XLSX = await import('xlsx');
    const dataToExport = filteredDonations.map((item) => ({
      'Donation ID': item.donation.id,
      'Donor Name': item.donation.name,
      Email: item.donation.email,
      Phone: item.donation.phone,
      'Amount (₹)': item.donation.amount,
      Campaign: item.campaign?.title || 'N/A',
      'Payment ID': item.donation.paymentId || 'N/A',
      Status: item.donation.status,
      Date: format(new Date(item.donation.createdAt), 'dd MMM yyyy, hh:mm a'),
      Message: item.donation.message || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Donations');
    XLSX.writeFile(workbook, `NGO_Donations_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`);
  };

  return (
    <NgoLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Donations</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Track all donations received across your campaigns.
            </p>
          </div>
          <Button
            onClick={handleExport}
            disabled={filteredDonations.length === 0}
            variant="outline"
            className="w-full md:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="pt-5 pb-4 px-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{filteredDonations.length}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="pt-5 pb-4 px-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalAmount.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="pt-5 pb-4 px-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Approved</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount}</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="pt-5 pb-4 px-5">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Pending</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="relative col-span-2">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search donor, campaign, payment ID..."
                  className="pl-9 bg-gray-50 border-gray-200 focus:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary focus:bg-white h-[38px]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-primary focus:bg-white h-[38px]"
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
              >
                <option value="all">All Campaigns</option>
                {uniqueCampaigns.map((c) => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Donations Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredDonations.length === 0 ? (
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="py-16 text-center">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No donations found.</p>
              <p className="text-sm text-gray-400 mt-1">Donations for your campaigns will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                    <th className="px-5 py-3">Donor</th>
                    <th className="px-5 py-3">Campaign</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredDonations.map((item) => (
                    <tr key={item.donation.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-gray-900">{item.donation.name}</div>
                        <div className="text-xs text-gray-400">{item.donation.email}</div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700 max-w-[180px] truncate">
                        {item.campaign?.title || 'N/A'}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900">
                        ₹{item.donation.amount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {format(new Date(item.donation.createdAt), 'dd MMM yyyy')}
                      </td>
                      <td className="px-5 py-3.5">{getStatusBadge(item.donation.status)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDonation(item);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Donation Details
            </DialogTitle>
            <DialogDescription>Full details of this contribution.</DialogDescription>
          </DialogHeader>

          {selectedDonation && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <span className="text-xs text-gray-400 block mb-0.5">Amount</span>
                  <span className="text-xl font-bold text-gray-900">
                    ₹{selectedDonation.donation.amount.toLocaleString()}
                  </span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col justify-center">
                  <span className="text-xs text-gray-400 block mb-1">Status</span>
                  {getStatusBadge(selectedDonation.donation.status)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <Label className="text-xs text-gray-400">Donor</Label>
                    <p className="text-sm font-medium text-gray-900">{selectedDonation.donation.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <Label className="text-xs text-gray-400">Email</Label>
                      <p className="text-sm text-gray-900 break-all">{selectedDonation.donation.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <Label className="text-xs text-gray-400">Phone</Label>
                      <p className="text-sm text-gray-900">{selectedDonation.donation.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <Label className="text-xs text-gray-400">Campaign</Label>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {selectedDonation.campaign?.title || 'N/A'}
                  </p>
                </div>

                {selectedDonation.donation.paymentId && (
                  <div>
                    <Label className="text-xs text-gray-400">Payment ID</Label>
                    <p className="text-sm text-gray-900 font-mono mt-0.5">
                      {selectedDonation.donation.paymentId}
                    </p>
                  </div>
                )}

                {selectedDonation.donation.message && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <Label className="text-xs text-gray-400">Donor Message</Label>
                    <p className="text-sm text-gray-700 italic mt-1">
                      "{selectedDonation.donation.message}"
                    </p>
                  </div>
                )}

                {selectedDonation.donation.paymentProofFile && (
                  <div>
                    <Label className="text-xs text-gray-400">Payment Proof</Label>
                    <div className="mt-2 border rounded-md overflow-hidden bg-gray-50 max-h-48 flex items-center justify-center">
                      <img
                        src={selectedDonation.donation.paymentProofFile}
                        alt="Payment Proof"
                        className="max-h-48 object-contain"
                      />
                    </div>
                  </div>
                )}

                {selectedDonation.donation.status === 'rejected' && selectedDonation.donation.rejectionReason && (
                  <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 text-rose-800">
                    <Label className="text-xs text-rose-500 font-medium">Rejection Reason</Label>
                    <p className="text-sm mt-1">{selectedDonation.donation.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </NgoLayout>
  );
};

export default NgoDonations;
