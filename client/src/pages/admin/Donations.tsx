import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/Layout";
import { 
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  Eye, 
  Trash2,
  CheckCircle,
  Clock,
  TrendingUp,
  IndianRupee,
  Calendar,
  Download,
  Loader2,
  FileText
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

interface Donation {
  id: number;
  name: string;
  email: string;
  phone: string;
  amount: number;
  status: string;
  createdAt: Date;
  paymentId?: string;
  categoryId?: number;
  eventId?: number;
  campaignId?: number;
  categoryName?: string;
  eventTitle?: string;
  campaignTitle?: string;
  paymentProofFile?: string;
  rejectionReason?: string;
}

const DonationsPage = () => {
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Receipt Settings Dialog State
  const [isReceiptSettingsOpen, setIsReceiptSettingsOpen] = useState(false);
  const [receiptOrgName, setReceiptOrgName] = useState("");
  const [receiptOrgAddress, setReceiptOrgAddress] = useState("");
  const [receiptOrgEmail, setReceiptOrgEmail] = useState("");

  const { data: receiptSettings } = useQuery<any>({
    queryKey: ['/api/admin/receipt-settings'],
    enabled: isReceiptSettingsOpen,
  });

  // Populate form fields when settings load
  React.useEffect(() => {
    if (receiptSettings) {
      setReceiptOrgName(receiptSettings.orgName || "");
      setReceiptOrgAddress(receiptSettings.orgAddress || "");
      setReceiptOrgEmail(receiptSettings.orgEmail || "");
    }
  }, [receiptSettings]);

  const updateReceiptSettingsMutation = useMutation({
    mutationFn: async ({ orgName, orgAddress, orgEmail }: { orgName: string; orgAddress: string; orgEmail: string }) => {
      const res = await apiRequest("/api/admin/receipt-settings", "PUT", { orgName, orgAddress, orgEmail });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/receipt-settings'] });
      toast({ title: "Success", description: "Receipt settings updated successfully" });
      setIsReceiptSettingsOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update receipt settings", variant: "destructive" });
    }
  });

  const { data: donations = [], isLoading, refetch } = useQuery<Donation[]>({
    queryKey: ['/api/admin/donations'],
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache the data (gcTime is the new name for cacheTime)
  });



  // Force refresh on page load
  React.useEffect(() => {
    const forceRefresh = () => {
      queryClient.removeQueries({ queryKey: ['/api/admin/donations'] });
      refetch();
    };
    forceRefresh();
  }, [queryClient, refetch]);

  const deleteDonationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/donations/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/donations'] });
      toast({ title: "Success", description: "Donation deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete donation", variant: "destructive" });
    },
  });

  const reviewDonationMutation = useMutation({
    mutationFn: async ({ donationId, status, reason }: { donationId: number; status: 'approved' | 'rejected'; reason?: string }) => {
      const res = await fetch(`/api/admin/donations/${donationId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason: reason }),
      });
      if (!res.ok) throw new Error('Failed to submit review');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/donations'] });
      toast({ title: 'Review Saved', description: 'Donation status updated successfully.' });
      setRejectingId(null);
      setRejectReason('');
      setIsViewDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to review donation', variant: 'destructive' });
    }
  });

  const handleApprove = (id: number) => {
    if (confirm('Approve this donation payment proof? This will increment campaign raised total.')) {
      reviewDonationMutation.mutate({ donationId: id, status: 'approved' });
    }
  };

  const handleRejectInit = (id: number) => {
    setRejectingId(id);
  };

  const handleRejectSubmit = () => {
    if (!rejectingId) return;
    if (!rejectReason) {
      toast({ title: 'Required', description: 'Please enter a rejection reason', variant: 'destructive' });
      return;
    }
    reviewDonationMutation.mutate({ donationId: rejectingId, status: 'rejected', reason: rejectReason });
  };

  // Calculate real donation statistics
  const completedDonations = donations.filter(d => d.status === 'completed' || d.status === 'approved');
  const pendingDonations = donations.filter(d => d.status === 'pending');
  const failedDonations = donations.filter(d => d.status === 'failed' || d.status === 'rejected');
  const totalAmount = completedDonations.reduce((sum, d) => sum + d.amount, 0);

  // Filter donations based on search and filters
  const filteredDonations = donations.filter(donation => {
    const matchesSearch = searchQuery === "" || 
      donation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donation.phone.includes(searchQuery) ||
      (donation.paymentId && donation.paymentId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || donation.status === statusFilter;
    
    const matchesType = typeFilter === "all" || 
      (typeFilter === "category" && donation.categoryName) ||
      (typeFilter === "event" && donation.eventTitle);
    
    // Date range filter
    let matchesDateRange = true;
    if (fromDate || toDate) {
      const donationDate = new Date(donation.createdAt).setHours(0, 0, 0, 0);
      
      if (fromDate) {
        const fromDateTime = new Date(fromDate).setHours(0, 0, 0, 0);
        if (donationDate < fromDateTime) matchesDateRange = false;
      }
      
      if (toDate) {
        const toDateTime = new Date(toDate).setHours(23, 59, 59, 999);
        if (donationDate > toDateTime) matchesDateRange = false;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDateRange;
  });

  const handleViewDonation = (donation: Donation) => {
    setSelectedDonation(donation);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this donation?")) {
      deleteDonationMutation.mutate(id);
    }
  };

  const handleExportExcel = async () => {
    if (!fromDate || !toDate) {
      toast({ title: "Error", description: "Please select both from and to dates", variant: "destructive" });
      return;
    }

    if (filteredDonations.length === 0) {
      toast({ title: "Error", description: "No donations found for the selected date range", variant: "destructive" });
      return;
    }

    try {
      setIsExporting(true);
      
      // Prepare data for Excel
      const excelData = filteredDonations.map((donation: any) => ({
        "Donor Name": donation.name || "-",
        "Email": donation.email || "-",
        "Phone": donation.phone || "-",
        "Amount": donation.amount || 0,
        "Category": donation.categoryName || "N/A",
        "Event": donation.eventTitle || "N/A",
        "Status": donation.status || "-",
        "Date": donation.createdAt
          ? new Date(donation.createdAt).toLocaleDateString()
          : "-",
        "Payment ID": donation.paymentId || "-",
      }));

      // Create Excel workbook
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Donations");

      // Set column widths
      worksheet["!cols"] = [
        { wch: 20 },
        { wch: 25 },
        { wch: 15 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
      ];

      // Download file
      const fileName = `donations-${fromDate}-to-${toDate}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "Success",
        description: `Exported ${filteredDonations.length} donation(s) successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export donations",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="bg-gray-50 p-2.5">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-gray-50">
        <div className="p-2.5">
          {/* Header section with Receipt Settings Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Donations Management</h1>
              <p className="text-gray-500 text-sm mt-1">Review donation logs, manage categories, and customize transaction receipts.</p>
            </div>
            
            <Dialog open={isReceiptSettingsOpen} onOpenChange={setIsReceiptSettingsOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 border-0">
                  <FileText className="w-5 h-5" />
                  Receipt Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white rounded-2xl shadow-2xl border-0 p-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="h-6 w-6 text-purple-600" />
                    Receipt Settings
                  </DialogTitle>
                  <DialogDescription className="text-gray-500 text-sm">
                    Customize the static organization name and address printed at the header of all download PDF receipts.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-5 my-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName" className="text-sm font-semibold text-gray-700">Organization Name</Label>
                    <Input
                      id="orgName"
                      value={receiptOrgName}
                      onChange={(e) => setReceiptOrgName(e.target.value)}
                      placeholder="e.g. ISKCON JUHU"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-purple-500 text-gray-800"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="orgAddress" className="text-sm font-semibold text-gray-700">Organization Address</Label>
                    <Textarea
                      id="orgAddress"
                      value={receiptOrgAddress}
                      onChange={(e) => setReceiptOrgAddress(e.target.value)}
                      placeholder="e.g. Hare Krishna Land, Juhu, Mumbai - 400049"
                      rows={3}
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-purple-500 text-gray-800 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orgEmail" className="text-sm font-semibold text-gray-700">Organization Contact Email</Label>
                    <Input
                      id="orgEmail"
                      value={receiptOrgEmail}
                      onChange={(e) => setReceiptOrgEmail(e.target.value)}
                      placeholder="e.g. donations@iskconjuhu.in"
                      type="email"
                      className="rounded-xl border-gray-200 focus:ring-2 focus:ring-purple-500 text-gray-800"
                    />
                  </div>
                </div>
                
                <DialogFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsReceiptSettingsOpen(false)}
                    className="rounded-xl border-gray-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => updateReceiptSettingsMutation.mutate({ orgName: receiptOrgName, orgAddress: receiptOrgAddress, orgEmail: receiptOrgEmail })}
                    disabled={updateReceiptSettingsMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md px-6 flex items-center gap-2"
                  >
                    {updateReceiptSettingsMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary Cards Grid - Modern Gradient Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Donations Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Total</span>
                </div>
                <div className="text-4xl font-bold mb-2">{donations.length}</div>
                <p className="text-purple-100 text-sm">Total Donations</p>
              </div>
            </div>

            {/* Completed Donations Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Success</span>
                </div>
                <div className="text-4xl font-bold mb-2">{completedDonations.length}</div>
                <p className="text-emerald-100 text-sm">Completed</p>
              </div>
            </div>

            {/* Pending Donations Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Waiting</span>
                </div>
                <div className="text-4xl font-bold mb-2">{pendingDonations.length}</div>
                <p className="text-orange-100 text-sm">Pending</p>
              </div>
            </div>

            {/* Revenue Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-12 w-12 rounded-full bg-white/5"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <IndianRupee className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Revenue</span>
                </div>
                <div className="text-4xl font-bold mb-2">₹{totalAmount.toLocaleString()}</div>
                <p className="text-blue-100 text-sm">Total Amount</p>
              </div>
            </div>
          </div>

          {/* Search + Filters Bar - Modern Design */}
          <div className="bg-white rounded-2xl shadow-lg border-0 mb-8 p-6 backdrop-blur-sm">
            <div className="flex flex-col gap-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by donor name, email, phone, or payment ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200 text-gray-700 placeholder-gray-400 shadow-inner"
                />
              </div>
              
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Status Filter */}
                <div className="relative">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-40 h-12 border-0 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-purple-500 shadow-inner">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent className="border-0 shadow-xl rounded-xl">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Type Filter */}
                <div className="relative">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full lg:w-40 h-12 border-0 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-purple-500 shadow-inner">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="border-0 shadow-xl rounded-xl">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* From Date Filter */}
                <div className="relative">
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-0 rounded-2xl focus-within:ring-2 focus-within:ring-purple-500 shadow-inner">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                      title="From Date"
                    />
                  </div>
                </div>

                {/* To Date Filter */}
                <div className="relative">
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-0 rounded-2xl focus-within:ring-2 focus-within:ring-purple-500 shadow-inner">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                      title="To Date"
                    />
                  </div>
                </div>

                {/* Clear Filters Button & Export Button */}
                {(fromDate || toDate) && (
                  <div className="flex gap-3 flex-wrap lg:flex-nowrap">
                    <button
                      onClick={() => {
                        setFromDate("");
                        setToDate("");
                      }}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-2xl transition-colors duration-200"
                    >
                      Clear Dates
                    </button>
                    <Button
                      onClick={handleExportExcel}
                      disabled={isExporting || filteredDonations.length === 0}
                      className="bg-green-600 hover:bg-green-700 gap-2"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5" />
                          Export to Excel ({filteredDonations.length})
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Donations Table - Modern Design */}
          <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">ID</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Donor</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Category</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Amount</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Date</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Status</th>
                    <th className="text-left py-5 px-6 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDonations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 px-6 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium">No donations found</p>
                          <p className="text-sm">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDonations.map((donation) => (
                      <tr key={donation.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                        <td className="py-5 px-6">
                          <span className="text-sm font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                            #{donation.id}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {donation.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{donation.name}</div>
                              <div className="text-xs text-gray-500">{donation.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                              {donation.categoryName ? 'Category' : donation.eventTitle ? 'Event' : 'General'}
                            </span>
                            {donation.categoryName && (
                              <span className="text-xs text-gray-500 truncate max-w-32">
                                {donation.categoryName}
                              </span>
                            )}
                            {donation.eventTitle && (
                              <span className="text-xs text-gray-500 truncate max-w-32">
                                {donation.eventTitle}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className="font-bold text-gray-900 text-lg">₹{donation.amount.toLocaleString()}</span>
                        </td>
                        <td className="py-5 px-6 text-sm text-gray-600">
                          {formatDate(donation.createdAt)}
                        </td>
                        <td className="py-5 px-6">
                          <span className={`inline-flex px-4 py-2 text-xs font-bold rounded-full shadow-sm ${
                            donation.status === 'completed' || donation.status === 'approved'
                              ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white'
                              : donation.status === 'pending'
                              ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                              : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                          }`}>
                            {donation.status === 'completed' || donation.status === 'approved' ? 'Success' : 
                             donation.status === 'pending' ? 'Pending' : 'Failed'}
                          </span>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleViewDonation(donation)}
                              className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-full transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                            >
                              <Eye className="h-3 w-3 mr-2" />
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(donation.id)}
                              className="inline-flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-full transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* View Donation Dialog - Modern Design */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl border-0 rounded-3xl shadow-2xl bg-white backdrop-blur-sm flex flex-col max-h-[90vh]">
            <DialogHeader className="pb-6 border-b border-gray-100 flex-shrink-0">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                Donation Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedDonation && (
              <div className="space-y-6 py-6 overflow-y-auto flex-1">
                {/* Donor Info Section */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {selectedDonation.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedDonation.name}</h3>
                      <p className="text-purple-600 font-medium">{selectedDonation.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{selectedDonation.phone}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Donation Amount</label>
                      <p className="text-2xl font-bold text-emerald-600 mt-1">₹{selectedDonation.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                {/* Category/Event/Campaign Details */}
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                  <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Donation Target</h4>
                  <div className="space-y-3">
                    {selectedDonation.campaignTitle && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5"></div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Campaign</p>
                          <p className="text-lg font-bold text-gray-900 mt-1">{selectedDonation.campaignTitle}</p>
                        </div>
                      </div>
                    )}
                    {selectedDonation.categoryName && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5"></div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Donation Category</p>
                          <p className="text-lg font-bold text-gray-900 mt-1">{selectedDonation.categoryName}</p>
                        </div>
                      </div>
                    )}
                    {selectedDonation.eventTitle && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5"></div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Donation Event</p>
                          <p className="text-lg font-bold text-gray-900 mt-1">{selectedDonation.eventTitle}</p>
                        </div>
                      </div>
                    )}
                    {!selectedDonation.campaignTitle && !selectedDonation.categoryName && !selectedDonation.eventTitle && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5"></div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Donation Type</p>
                          <p className="text-lg font-bold text-gray-900 mt-1">General Donation</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Transaction Details */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date & Time</label>
                    <p className="text-lg font-semibold text-gray-900 mt-2">{formatDate(selectedDonation.createdAt)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">Status</label>
                    <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full shadow-sm ${
                      selectedDonation.status === 'completed' || selectedDonation.status === 'approved'
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 text-white'
                        : selectedDonation.status === 'pending'
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                        : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                    }`}>
                      {selectedDonation.status === 'completed' || selectedDonation.status === 'approved' 
                        ? 'Payment Successful' 
                        : selectedDonation.status === 'pending' 
                        ? 'Verification Pending' 
                        : 'Rejected/Failed'}
                    </span>
                  </div>
                </div>

                {/* Proof & Rejection Details */}
                {selectedDonation.paymentProofFile && (
                  <div className="bg-orange-50 rounded-2xl p-5 border border-orange-200">
                    <label className="text-xs font-semibold text-orange-600 uppercase tracking-wide block mb-2">Payment Confirmation Proof</label>
                    <a 
                      href={selectedDonation.paymentProofFile} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-secondary hover:underline font-semibold"
                    >
                      View Uploaded Document (Image/PDF)
                    </a>
                  </div>
                )}

                {selectedDonation.status === 'rejected' && selectedDonation.rejectionReason && (
                  <div className="bg-red-50 rounded-2xl p-5 border border-red-200">
                    <label className="text-xs font-semibold text-red-600 uppercase tracking-wide block mb-1">Rejection Reason</label>
                    <p className="text-sm text-red-800">{selectedDonation.rejectionReason}</p>
                  </div>
                )}
                
                {selectedDonation.paymentId && (
                  <div className="bg-blue-50 rounded-2xl p-5">
                    <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Payment ID</label>
                    <p className="text-sm mt-2 font-mono bg-white px-4 py-3 rounded-xl border border-blue-200 text-gray-800 break-all">
                      {selectedDonation.paymentId}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter className="pt-6 border-t border-gray-100 flex-shrink-0 flex justify-between gap-3">
              {selectedDonation && selectedDonation.status === 'pending' && selectedDonation.paymentProofFile && (
                <div className="flex w-full gap-2">
                  <Button 
                    onClick={() => handleApprove(selectedDonation.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all"
                  >
                    Approve Payment
                  </Button>
                  <Button 
                    onClick={() => handleRejectInit(selectedDonation.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all"
                  >
                    Reject Payment
                  </Button>
                </div>
              )}
              <button
                onClick={() => setIsViewDialogOpen(false)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200"
              >
                Close Details
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        {rejectingId && (
          <Dialog open={!!rejectingId} onOpenChange={(open) => { if(!open) setRejectingId(null); }}>
            <DialogContent className="sm:max-w-md bg-white border border-gray-200 p-6 rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold font-poppins text-primary">Reject Donation Proof</DialogTitle>
                <DialogDescription className="text-sm font-opensans text-gray-500">
                  Please provide a clear reason why this payment proof is rejected.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="reject-reason" className="text-primary font-semibold">Rejection Reason *</Label>
                  <Textarea 
                    id="reject-reason" 
                    value={rejectReason} 
                    onChange={(e) => setRejectReason(e.target.value)} 
                    placeholder="Enter reason here..." 
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRejectingId(null)}>Cancel</Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white" 
                  onClick={handleRejectSubmit}
                  disabled={reviewDonationMutation.isPending}
                >
                  {reviewDonationMutation.isPending ? "Submitting..." : "Reject Proof"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

export default DonationsPage;