import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ArrowLeft, Plus, Trash2, Save, Upload, Check, X, Calendar, DollarSign } from 'lucide-react';
import AdminLayout from "@/components/admin/Layout";
import { Campaign, DonationAmountCard, DonationCategory, Donation } from '@shared/schema';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function AdminCampaignManagement() {
  const [, params] = useRoute('/admin/campaigns/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const campaignId = parseInt(params?.id || '0');

  // Form states (Core & Payment)
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [galleryImagesStr, setGalleryImagesStr] = useState(''); // comma separated
  const [videoUrl, setVideoUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'draft' | 'active' | 'completed' | 'paused' | 'archived'>('draft');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [isFeatured, setIsFeatured] = useState(false);
  const [showOnHomepage, setShowOnHomepage] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    
    setIsUploading(true);
    try {
      const res = await fetch('/api/upload/banner', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setCoverImage(data.imageUrl); 
      toast({ title: 'Success', description: 'Cover image uploaded successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload cover image', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const files = Array.from(e.target.files);
    
    setIsUploadingGallery(true);
    try {
      let uploadedUrls: string[] = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/upload/gallery', {
          method: 'POST',
          body: formData
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        uploadedUrls.push(data.imageUrl);
      }
      
      const existingUrls = galleryImagesStr ? galleryImagesStr.split(',').map(s => s.trim()).filter(s => s) : [];
      setGalleryImagesStr([...existingUrls, ...uploadedUrls].join(', '));
      toast({ title: 'Success', description: 'Gallery images uploaded successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload gallery images', variant: 'destructive' });
    } finally {
      setIsUploadingGallery(false);
    }
  };

  
  // Payment states
  const [upiId, setUpiId] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [micrCode, setMicrCode] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [paymentMethodsStr, setPaymentMethodsStr] = useState(''); // comma separated
  
  const [allowCustomAmount, setAllowCustomAmount] = useState(true);
  const [minCustomAmount, setMinCustomAmount] = useState('10');
  const [maxCustomAmount, setMaxCustomAmount] = useState('1000000');
  const [successMessage, setSuccessMessage] = useState('');
  const [customDonationLabel, setCustomDonationLabel] = useState('');

  // Preset card form
  const [newCardAmount, setNewCardAmount] = useState('');
  const [newCardLabel, setNewCardLabel] = useState('');

  // Donation review states
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewingDonationId, setReviewingDonationId] = useState<number | null>(null);

  // Fetch campaign
  const { data: campaign, isLoading } = useQuery<Campaign>({
    queryKey: [`/api/campaigns/${campaignId}`],
    enabled: campaignId > 0,
  });

  useEffect(() => {
    if (campaign) {
      const data: any = campaign;
      setTitle(data.title);
      setSlug(data.slug || '');
      setShortDescription(data.shortDescription || '');
      setDescription(data.description || '');
      setGoalAmount(data.goalAmount ? Number(data.goalAmount).toString() : '');
      setCoverImage(data.coverImage || '');
      setGalleryImagesStr(Array.isArray(data.galleryImages) ? data.galleryImages.join(', ') : '');
      setVideoUrl(data.videoUrl || '');
      setStartDate(data.startDate ? format(new Date(data.startDate), 'yyyy-MM-dd') : '');
      setEndDate(data.endDate ? format(new Date(data.endDate), 'yyyy-MM-dd') : '');
      setStatus(data.status);
      setDisplayOrder(data.displayOrder ? data.displayOrder.toString() : '1');
      setIsFeatured(!!data.isFeatured);
      setShowOnHomepage(data.showOnHomepage ?? true);
      
      setUpiId(data.upiId || '');
      setBankAccountHolder(data.bankAccountHolder || '');
      setBankAccountNumber(data.bankAccountNumber || '');
      setBankIfsc(data.bankIfsc || '');
      setBankName(data.bankName || '');
      setBankBranch(data.bankBranch || '');
      setSwiftCode(data.swiftCode || '');
      setMicrCode(data.micrCode || '');
      setQrCodeImage(data.qrCodeImage || '');
      setPaymentMethodsStr(Array.isArray(data.paymentMethods) ? data.paymentMethods.join(', ') : 'Offline Bank Transfer');
      
      setAllowCustomAmount(!!data.allowCustomAmount);
      setMinCustomAmount(data.minCustomAmount ? data.minCustomAmount.toString() : '10');
      setMaxCustomAmount(data.maxCustomAmount ? data.maxCustomAmount.toString() : '1000000');
      setSuccessMessage(data.successMessage || '');
      setCustomDonationLabel(data.customDonationLabel || 'Other Amount');
    }
  }, [campaign]);

  // Fetch preset cards
  const { data: cards = [] } = useQuery<DonationAmountCard[]>({
    queryKey: [`/api/campaigns/${campaignId}/cards`],
    enabled: campaignId > 0,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<DonationCategory[]>({
    queryKey: ['/api/donation-categories'],
  });

  // Fetch all donations (to filter for this campaign)
  const { data: allDonations = [] } = useQuery<any[]>({
    queryKey: ['/api/donations'],
  });

  const campaignDonations = allDonations.filter(d => d.campaignId === campaignId);

  // Update Campaign Mutation
  const updateCampaignMutation = useMutation({
    mutationFn: async (updatedData: Partial<Campaign>) => {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updatedData),
        credentials: 'include'
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || `Server error ${res.status}`);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns?all=true'] });
      toast({ title: 'Success', description: 'Campaign settings saved successfully' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message || 'Failed to update campaign settings', variant: 'destructive' });
    }
  });

  // Add Preset Card Mutation
  const addCardMutation = useMutation({
    mutationFn: async (newCard: any) => {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard),
      });
      if (!res.ok) throw new Error('Failed to add preset card');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}/cards`] });
      toast({ title: 'Success', description: 'Donation card added successfully' });
      setNewCardAmount('');
      setNewCardLabel('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add preset card', variant: 'destructive' });
    }
  });

  // Delete Preset Card Mutation
  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: number) => {
      const res = await fetch(`/api/admin/campaigns/cards/${cardId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete card');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}/cards`] });
      toast({ title: 'Success', description: 'Donation card deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete donation card', variant: 'destructive' });
    }
  });

  // Review Donation Mutation (Approve / Reject)
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
      queryClient.invalidateQueries({ queryKey: ['/api/donations'] });
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}`] });
      toast({ title: 'Review Saved', description: 'Donation status updated successfully.' });
      setReviewingDonationId(null);
      setRejectionReason('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to review donation', variant: 'destructive' });
    }
  });

  // Handle QR image upload
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'qr');

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        setQrCodeImage(data.url);
        toast({ title: 'Success', description: 'QR Code uploaded successfully' });
      } catch (error) {
        toast({ title: 'Upload Failed', description: 'Could not upload QR code', variant: 'destructive' });
      }
    }
  };

  const handleSaveCore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: 'Validation Error', description: 'Campaign Title is required', variant: 'destructive' });
      return;
    }
    if (!goalAmount || isNaN(Number(goalAmount)) || Number(goalAmount) <= 0) {
      toast({ title: 'Validation Error', description: 'A valid Goal Amount is required', variant: 'destructive' });
      return;
    }

    updateCampaignMutation.mutate({
      title: title.trim(),
      slug: slug.trim() || undefined,
      shortDescription: shortDescription.trim() || null,
      description: description || null,
      goalAmount: parseFloat(goalAmount),
      coverImage: coverImage || '',
      galleryImages: galleryImagesStr ? galleryImagesStr.split(',').map(s => s.trim()).filter(Boolean) : null,
      videoUrl: videoUrl || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status,
      displayOrder: parseInt(displayOrder) || 1,
      isFeatured,
      showOnHomepage,
    });
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    updateCampaignMutation.mutate({
      upiId: upiId || null,
      bankAccountHolder: bankAccountHolder || null,
      bankAccountNumber: bankAccountNumber || null,
      bankIfsc: bankIfsc || null,
      bankName: bankName || null,
      bankBranch: bankBranch || null,
      swiftCode: swiftCode || null,
      micrCode: micrCode || null,
      qrCodeImage: qrCodeImage || null,
      paymentMethods: paymentMethodsStr ? paymentMethodsStr.split(',').map(s => s.trim()).filter(Boolean) : null,
      allowCustomAmount,
      minCustomAmount: parseInt(minCustomAmount) || 10,
      maxCustomAmount: parseInt(maxCustomAmount) || 1000000,
      successMessage: successMessage || null,
    });
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardAmount) return;
    addCardMutation.mutate({
      amount: parseInt(newCardAmount),
      label: newCardLabel || null,
    });
  };

  const handleApprove = (id: number) => {
    if (confirm('Approve this donation payment proof? This will increment campaign raised total.')) {
      reviewDonationMutation.mutate({ donationId: id, status: 'approved' });
    }
  };

  const handleRejectSubmit = (id: number) => {
    if (!rejectionReason) {
      toast({ title: 'Required', description: 'Please enter a rejection reason', variant: 'destructive' });
      return;
    }
    reviewDonationMutation.mutate({ donationId: id, status: 'rejected', reason: rejectionReason });
  };

  if (campaignId > 0 && isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">Loading campaign details...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setLocation('/admin/campaigns')} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign ? (campaign as any).title : 'New Campaign'}</h1>
            <p className="text-sm text-gray-500 font-opensans">Configure core features, payment methods, cards, and review proofs.</p>
          </div>
        </div>

        <Tabs defaultValue="core" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-lg p-1">
            <TabsTrigger value="core">1. Core Settings</TabsTrigger>
            <TabsTrigger value="payment">2. Payment Settings</TabsTrigger>
            <TabsTrigger value="cards">3. Preset Cards</TabsTrigger>
            <TabsTrigger value="donations">4. Donations ({campaignDonations.length})</TabsTrigger>
          </TabsList>

          {/* TAB 1: CORE SETTINGS */}
          <TabsContent value="core" className="pt-4">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="font-poppins text-lg text-primary">Campaign Details</CardTitle>
                <CardDescription>Edit title, goal, dates, and cover image.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveCore} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title" className="text-primary font-semibold">Campaign Title *</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="slug" className="text-primary font-semibold">Campaign Slug</Label>
                    <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Auto-generated if left empty" />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="shortDescription" className="text-primary font-semibold">Short Description</Label>
                    <Textarea id="shortDescription" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2} />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-primary font-semibold">Full Description</Label>
                    <div className="bg-white">
                      <ReactQuill theme="snow" value={description} onChange={setDescription} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="goal" className="text-primary font-semibold">Goal Amount (₹) *</Label>
                      <Input id="goal" type="number" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="displayOrder" className="text-primary font-semibold">Display Order</Label>
                      <Input id="displayOrder" type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cover" className="text-primary font-semibold">Cover Image</Label>
                    <div className="flex flex-col gap-2">
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={handleCoverUpload}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-medium">OR URL:</span>
                        <Input id="cover" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://example.com/image.jpg" />
                      </div>
                      {isUploading && <span className="text-xs text-primary animate-pulse">Uploading image...</span>}
                      {coverImage && (
                        <div className="mt-2 h-32 w-full object-contain rounded-md border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                          <img src={coverImage} alt="Preview" className="max-h-full max-w-full" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="gallery" className="text-primary font-semibold">Gallery Images</Label>
                    <div className="flex flex-col gap-2">
                      <Input 
                        type="file" 
                        accept="image/*"
                        multiple
                        onChange={handleGalleryUpload}
                      />
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-500 font-medium">OR URLs (comma separated):</span>
                        <Textarea id="gallery" value={galleryImagesStr} onChange={(e) => setGalleryImagesStr(e.target.value)} rows={2} />
                      </div>
                      {isUploadingGallery && <span className="text-xs text-primary animate-pulse">Uploading gallery images...</span>}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="video" className="text-primary font-semibold">Campaign Video URL (YouTube/MP4)</Label>
                    <Input id="video" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start" className="text-primary font-semibold">Start Date</Label>
                      <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end" className="text-primary font-semibold">End Date</Label>
                      <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t pt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="status" className="text-primary font-semibold">Status</Label>
                      <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Draft" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border">
                          <SelectItem value="draft">Draft (Hidden)</SelectItem>
                          <SelectItem value="active">Active (Visible)</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-8">
                      <Switch id="isFeatured" checked={isFeatured} onCheckedChange={setIsFeatured} />
                      <Label htmlFor="isFeatured" className="text-primary font-semibold">Featured Campaign</Label>
                    </div>

                    <div className="flex items-center space-x-2 pt-8">
                      <Switch id="showOnHomepage" checked={showOnHomepage} onCheckedChange={setShowOnHomepage} />
                      <Label htmlFor="showOnHomepage" className="text-primary font-semibold">Show on Homepage</Label>
                    </div>
                  </div>

                  <Button type="submit" disabled={updateCampaignMutation.isPending} className="bg-primary hover:bg-opacity-95 text-white flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Core Settings
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: PAYMENT SETTINGS */}
          <TabsContent value="payment" className="pt-4">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="font-poppins text-lg text-primary">Configure Donation Collection Details</CardTitle>
                <CardDescription>Enter UPI address and bank transfer credentials for manual user deposits.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePayment} className="space-y-6">
                  {/* UPI */}
                  <div className="space-y-4 border-b pb-6">
                    <h3 className="font-poppins font-bold text-primary">UPI Configuration</h3>
                    <div className="grid gap-2">
                      <Label htmlFor="upi" className="text-primary font-semibold">UPI ID / VPA</Label>
                      <Input id="upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="e.g. ngo@bank" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-primary font-semibold">Scan QR Code Image</Label>
                      <div className="flex items-center gap-4">
                        <Input type="file" accept="image/*" onChange={handleQrUpload} className="max-w-xs" />
                        {qrCodeImage && (
                          <div className="border p-1 rounded bg-white">
                            <img src={qrCodeImage} alt="QR preview" className="w-16 h-16 object-contain" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BANK */}
                  <div className="space-y-4 border-b pb-6">
                    <h3 className="font-poppins font-bold text-primary">Bank Account Configuration</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="holder" className="text-primary font-semibold">Account Holder Name</Label>
                        <Input id="holder" value={bankAccountHolder} onChange={(e) => setBankAccountHolder(e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bank" className="text-primary font-semibold">Bank Name</Label>
                        <Input id="bank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="branch" className="text-primary font-semibold">Branch Name</Label>
                        <Input id="branch" value={bankBranch} onChange={(e) => setBankBranch(e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="accNo" className="text-primary font-semibold">Account Number</Label>
                        <Input id="accNo" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="ifsc" className="text-primary font-semibold">IFSC Code</Label>
                        <Input id="ifsc" value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="swift" className="text-primary font-semibold">SWIFT Code</Label>
                        <Input id="swift" value={swiftCode} onChange={(e) => setSwiftCode(e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="micr" className="text-primary font-semibold">MICR Code</Label>
                        <Input id="micr" value={micrCode} onChange={(e) => setMicrCode(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* PAYMENT METHODS */}
                  <div className="space-y-4 border-b pb-6">
                    <h3 className="font-poppins font-bold text-primary">Enabled Payment Gateways (Mock)</h3>
                    <div className="grid gap-2">
                      <Label htmlFor="paymentMethods" className="text-primary font-semibold">Enabled Methods (comma separated)</Label>
                      <Input id="paymentMethods" value={paymentMethodsStr} onChange={(e) => setPaymentMethodsStr(e.target.value)} placeholder="Razorpay, Cashfree, PayU, Stripe, Offline Bank Transfer" />
                    </div>
                  </div>

                  {/* CUSTOM AMOUNT */}
                  <div className="space-y-4 border-b pb-6">
                    <h3 className="font-poppins font-bold text-primary">Custom Donation Settings</h3>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <Label htmlFor="custom-toggle" className="text-primary font-bold">Allow Custom Amounts</Label>
                        <p className="text-xs text-gray-500 font-opensans">If enabled, donors can type any donation value.</p>
                      </div>
                      <Switch id="custom-toggle" checked={allowCustomAmount} onCheckedChange={setAllowCustomAmount} />
                    </div>
                    {allowCustomAmount && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="minAmount" className="text-primary font-semibold">Minimum Amount (₹)</Label>
                          <Input id="minAmount" type="number" value={minCustomAmount} onChange={(e) => setMinCustomAmount(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="maxAmount" className="text-primary font-semibold">Maximum Amount (₹)</Label>
                          <Input id="maxAmount" type="number" value={maxCustomAmount} onChange={(e) => setMaxCustomAmount(e.target.value)} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SUCCESS MESSAGE */}
                  <div className="space-y-4 pb-4">
                    <h3 className="font-poppins font-bold text-primary">Donation Success Message</h3>
                    <div className="bg-white">
                      <ReactQuill theme="snow" value={successMessage} onChange={setSuccessMessage} />
                    </div>
                  </div>

                  <Button type="submit" disabled={updateCampaignMutation.isPending} className="bg-primary hover:bg-opacity-95 text-white flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Payment Settings
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: PRESET CARDS */}
          <TabsContent value="cards" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Create Preset Card */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="font-poppins text-lg text-primary">Add Donation Card</CardTitle>
                  <CardDescription>Define a preset suggestion amount.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddCard} className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="card-amount" className="text-primary font-semibold">Card Amount (₹) *</Label>
                      <Input id="card-amount" type="number" value={newCardAmount} onChange={(e) => setNewCardAmount(e.target.value)} placeholder="501" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="card-label" className="text-primary font-semibold">Label (Optional)</Label>
                      <Input id="card-label" value={newCardLabel} onChange={(e) => setNewCardLabel(e.target.value)} placeholder="e.g. Support a child for a week" />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-opacity-95 text-white flex items-center justify-center gap-1.5">
                      <Plus className="w-4 h-4" /> Add Preset Card
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Right Column: Existing Cards List */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-lg font-bold font-poppins text-primary">Predefined Suggestion Cards</h3>
                {cards.length === 0 ? (
                  <Card className="border-gray-200 bg-neutral/30">
                    <CardContent className="py-8 text-center text-gray-500 text-sm">
                      No suggestion cards defined. Donors will have to enter custom amounts.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cards.map((card) => (
                      <Card key={card.id} className="border-gray-200 shadow-sm relative pr-12">
                        <CardHeader className="p-4">
                          <CardTitle className="text-xl font-bold font-poppins text-primary">₹{card.amount}</CardTitle>
                          {card.label && <p className="text-xs text-gray-500 font-opensans">{card.label}</p>}
                        </CardHeader>
                        <Button 
                          onClick={() => deleteCardMutation.mutate(card.id)}
                          variant="ghost" 
                          size="sm" 
                          className="absolute right-2 top-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* TAB 4: CAMPAIGN DONATIONS REVIEW */}
          <TabsContent value="donations" className="pt-4">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="font-poppins text-lg text-primary">Donations List</CardTitle>
                <CardDescription>Review and approve offline payment confirmation screenshots or PDF receipts.</CardDescription>
              </CardHeader>
              <CardContent>
                {campaignDonations.length === 0 ? (
                  <p className="text-center py-8 text-gray-500 font-opensans">No donations submitted for this campaign yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm font-opensans border-collapse">
                      <thead>
                        <tr className="border-b text-gray-400 font-semibold">
                          <th className="py-3 px-2">Donor</th>
                          <th className="py-3 px-2">Amount</th>
                          <th className="py-3 px-2">Submitted</th>
                          <th className="py-3 px-2 text-center">Proof File</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-primary">
                        {campaignDonations.map((d) => (
                          <tr key={d.id} className="hover:bg-neutral/10">
                            <td className="py-4 px-2">
                              <p className="font-semibold">{d.name}</p>
                              <p className="text-xs text-gray-500">{d.email} • {d.phone}</p>
                            </td>
                            <td className="py-4 px-2 font-poppins font-bold">
                              ₹{Number(d.amount).toLocaleString()}
                            </td>
                            <td className="py-4 px-2 text-xs">
                              {format(new Date(d.createdAt), 'dd MMM yyyy, hh:mm a')}
                            </td>
                            <td className="py-4 px-2 text-center">
                              {d.paymentProofFile ? (
                                <a 
                                  href={d.paymentProofFile} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="inline-flex items-center gap-1 text-xs text-secondary hover:underline font-semibold"
                                >
                                  View Proof
                                </a>
                              ) : (
                                <span className="text-xs text-gray-400">None</span>
                              )}
                            </td>
                            <td className="py-4 px-2">
                              <Badge className={`capitalize font-semibold text-xs ${
                                d.status === 'approved' 
                                  ? 'bg-green-100 text-green-800' 
                                  : d.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {d.status === 'approved' ? 'Payment Successful' : d.status}
                              </Badge>
                              {d.status === 'rejected' && d.rejectionReason && (
                                <p className="text-[10px] text-red-500 mt-1 line-clamp-2 max-w-[150px]">{d.rejectionReason}</p>
                              )}
                            </td>
                            <td className="py-4 px-2 text-right">
                              {d.status === 'pending' && (
                                <div className="flex justify-end gap-1.5">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleApprove(d.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white p-2 h-8 w-8 rounded-full"
                                    title="Approve Payment"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    onClick={() => setReviewingDonationId(d.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white p-2 h-8 w-8 rounded-full"
                                    title="Reject Payment"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Reject Dialog */}
        {reviewingDonationId && (
          <Dialog open={!!reviewingDonationId} onOpenChange={(open) => { if(!open) setReviewingDonationId(null); }}>
            <DialogContent className="sm:max-w-md bg-white border border-gray-200 p-6 rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold font-poppins text-primary">Reject Donation Proof</DialogTitle>
                <DialogDescription className="text-sm font-opensans text-gray-500">
                  Please provide a clear reason why this payment proof is rejected (e.g. proof screenshot blur, amount mismatches, etc.).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="reason" className="text-primary font-semibold">Rejection Reason *</Label>
                  <Textarea 
                    id="reason" 
                    value={rejectionReason} 
                    onChange={(e) => setRejectionReason(e.target.value)} 
                    placeholder="Enter reason here..." 
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setReviewingDonationId(null)}>Cancel</Button>
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white" 
                  onClick={() => handleRejectSubmit(reviewingDonationId)}
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
}
