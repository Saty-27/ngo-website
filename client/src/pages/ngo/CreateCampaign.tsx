import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import NgoLayout from '@/components/ngo/Layout';
import { ArrowLeft, Save, Upload, Loader2, Plus, X, IndianRupee } from 'lucide-react';

interface PresetAmount {
  amount: string;
  label: string;
}

export default function NgoCreateCampaign() {
  const [match, params] = useRoute('/ngo/campaigns/:id/edit');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const campaignId = match ? parseInt(params?.id || '0') : 0;
  const isEdit = campaignId > 0;

  // Form states
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allowCustomAmount, setAllowCustomAmount] = useState(true);
  const [presetAmounts, setPresetAmounts] = useState<PresetAmount[]>([
    { amount: '101', label: '₹101' },
    { amount: '505', label: '₹505' },
    { amount: '1001', label: '₹1,001' },
    { amount: '5001', label: '₹5,001' },
  ]);

  // Bank/Payout details states
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [upiId, setUpiId] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [isQrUploading, setIsQrUploading] = useState(false);

  // Fetch campaign if editing
  const { data: campaign, isLoading: isLoadingCampaign } = useQuery({
    queryKey: [`/api/ngo/campaigns`, campaignId],
    enabled: isEdit,
    queryFn: async () => {
      const token = localStorage.getItem('ngoToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch('/api/ngo/campaigns', { headers });
      if (!res.ok) throw new Error('Failed to fetch campaigns');
      const campaigns = await res.json();
      return campaigns.find((c: any) => c.id === campaignId);
    }
  });

  // Fetch preset amounts if editing
  const { data: campaignAmounts } = useQuery({
    queryKey: ['/api/ngo/campaigns', campaignId, 'amounts'],
    enabled: isEdit,
    queryFn: async () => {
      const token = localStorage.getItem('ngoToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch(`/api/ngo/campaigns/${campaignId}/amounts`, { headers });
      if (!res.ok) throw new Error('Failed to fetch amount cards');
      return res.json();
    }
  });

  // Fetch NGO Profile for defaulting bank details
  const { data: ngoProfile } = useQuery({
    queryKey: ['/api/ngo/me'],
    enabled: !isEdit,
    queryFn: async () => {
      const token = localStorage.getItem('ngoToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/ngo/me', { headers });
      if (!res.ok) throw new Error('Failed to fetch NGO profile');
      return res.json();
    }
  });

  useEffect(() => {
    if (campaign) {
      setTitle(campaign.title);
      setShortDescription(campaign.shortDescription || '');
      setDescription(campaign.description || '');
      setGoalAmount(campaign.goalAmount ? Number(campaign.goalAmount).toString() : '');
      setCoverImage(campaign.coverImage || '');
      setStartDate(campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : '');
      setEndDate(campaign.endDate ? new Date(campaign.endDate).toISOString().split('T')[0] : '');
      setAllowCustomAmount(campaign.allowCustomAmount !== false);

      setBankAccountHolder(campaign.bankAccountHolder || '');
      setBankAccountNumber(campaign.bankAccountNumber || '');
      setBankIfsc(campaign.bankIfsc || '');
      setBankName(campaign.bankName || '');
      setBankBranch(campaign.bankBranch || '');
      setUpiId(campaign.upiId || '');
      setQrCodeImage(campaign.qrCodeImage || '');
    }
  }, [campaign]);

  useEffect(() => {
    if (campaignAmounts && Array.isArray(campaignAmounts)) {
      setPresetAmounts(
        campaignAmounts.map((card: any) => ({
          amount: card.amount.toString(),
          label: card.label || `₹${card.amount}`
        }))
      );
    }
  }, [campaignAmounts]);

  useEffect(() => {
    if (!isEdit && ngoProfile) {
      setBankAccountHolder(ngoProfile.accountHolderName || '');
      setBankAccountNumber(ngoProfile.accountNumber || '');
      setBankIfsc(ngoProfile.ifscCode || '');
      setBankName(ngoProfile.bankName || '');
      setBankBranch(ngoProfile.branchName || '');
      setUpiId(ngoProfile.upiId || '');
      setQrCodeImage(ngoProfile.qrCode || '');
    }
  }, [ngoProfile, isEdit]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    
    setIsUploading(true);
    try {
      const res = await fetch('/api/upload/gallery', {
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
  
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    
    setIsQrUploading(true);
    try {
      const res = await fetch('/api/upload/gallery', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setQrCodeImage(data.imageUrl); 
      toast({ title: 'Success', description: 'QR Code uploaded successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload QR code', variant: 'destructive' });
    } finally {
      setIsQrUploading(false);
    }
  };

  const addPresetAmount = () => {
    setPresetAmounts([...presetAmounts, { amount: '', label: '' }]);
  };

  const removePresetAmount = (index: number) => {
    setPresetAmounts(presetAmounts.filter((_, i) => i !== index));
  };

  const updatePresetAmount = (index: number, field: 'amount' | 'label', value: string) => {
    const updated = [...presetAmounts];
    updated[index][field] = value;
    if (field === 'amount' && !updated[index].label) {
      updated[index].label = `₹${value}`;
    }
    setPresetAmounts(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('shortDescription', shortDescription);
      formData.append('description', description);
      formData.append('goalAmount', goalAmount);
      if (startDate) formData.append('startDate', startDate);
      if (endDate) formData.append('endDate', endDate);
      formData.append('allowCustomAmount', String(allowCustomAmount));
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }
      
      // Append bank/payout details
      formData.append('bankAccountHolder', bankAccountHolder);
      formData.append('bankAccountNumber', bankAccountNumber);
      formData.append('bankIfsc', bankIfsc);
      formData.append('bankName', bankName);
      formData.append('bankBranch', bankBranch);
      formData.append('upiId', upiId);
      formData.append('qrCodeImage', qrCodeImage);
      
      // Add preset amounts as JSON
      const validAmounts = presetAmounts.filter(p => p.amount && parseInt(p.amount) > 0);
      if (validAmounts.length > 0) {
        formData.append('presetAmounts', JSON.stringify(validAmounts));
      }
      
      const token = localStorage.getItem('ngoToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      let res;
      if (isEdit) {
        res = await fetch(`/api/ngo/campaigns/${campaignId}`, {
          method: 'PUT',
          body: formData,
          headers
        });
      } else {
        res = await fetch('/api/ngo/campaigns', {
          method: 'POST',
          body: formData,
          headers
        });
      }

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to save campaign');
      }

      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ['/api/ngo/campaigns'] });
      toast({ title: 'Success', description: isEdit ? 'Campaign updated successfully' : 'Campaign submitted for approval' });
      setLocation('/ngo/campaigns');
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && isLoadingCampaign) {
    return (
      <NgoLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </NgoLayout>
    );
  }

  return (
    <NgoLayout>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/ngo/campaigns">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Campaign' : 'Create Campaign'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Flood Relief 2026"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description (shown on card)</Label>
                <Textarea
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  rows={2}
                  maxLength={150}
                  placeholder="A brief summary shown on campaign cards (max 150 chars)"
                />
                <p className="text-xs text-gray-400">{shortDescription.length}/150</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Detailed description shown on the campaign detail page"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goalAmount">Goal Amount (₹) *</Label>
                  <Input
                    id="goalAmount"
                    type="number"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    placeholder="100000"
                    min="100"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverImage">Cover Image *</Label>
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="w-full max-w-md h-32 object-cover rounded-md mb-2 border"
                    />
                  )}
                  <Input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={isUploading}
                    required={!coverImage}
                  />
                  {isUploading && <p className="text-xs text-amber-600">Uploading...</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payout Details (Bank & UPI) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payout Details (Bank & UPI)</CardTitle>
            <p className="text-sm text-gray-500">
              Provide the details of the bank account or UPI ID where donations collected for this campaign will be settled. These details are auto-filled from your NGO profile but can be customized.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccountHolder">Account Holder Name *</Label>
                <Input
                  id="bankAccountHolder"
                  value={bankAccountHolder}
                  onChange={(e) => setBankAccountHolder(e.target.value)}
                  placeholder="e.g. Gauranitai Foundation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Bank Account Number *</Label>
                <Input
                  id="bankAccountNumber"
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="e.g. 1234567890"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankIfsc">IFSC Code *</Label>
                <Input
                  id="bankIfsc"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value)}
                  placeholder="e.g. SBIN0001234"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. State Bank of India"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankBranch">Bank Branch</Label>
                <Input
                  id="bankBranch"
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  placeholder="e.g. Juhu Branch"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. gauranitai@upi"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="qrCodeImage">UPI QR Code Image</Label>
                {qrCodeImage && (
                  <img
                    src={qrCodeImage}
                    alt="UPI QR Code preview"
                    className="w-32 h-32 object-contain rounded-md mb-2 border p-1"
                  />
                )}
                <Input
                  id="qrCodeImage"
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                  disabled={isQrUploading}
                />
                {isQrUploading && <p className="text-xs text-amber-600">Uploading QR Code...</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Donation Amount Cards */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Donation Amount Cards
            </CardTitle>
            <p className="text-sm text-gray-500">
              Set up preset donation amounts that donors can quickly select. These appear as clickable cards on your campaign page.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {presetAmounts.map((preset, index) => (
              <div key={index} className="flex items-end gap-3 p-3 bg-gray-50 rounded-lg border">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-gray-500">Amount (₹)</Label>
                  <Input
                    type="number"
                    value={preset.amount}
                    onChange={(e) => updatePresetAmount(index, 'amount', e.target.value)}
                    placeholder="505"
                    min="1"
                    className="h-9"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-gray-500">Label (optional)</Label>
                  <Input
                    type="text"
                    value={preset.label}
                    onChange={(e) => updatePresetAmount(index, 'label', e.target.value)}
                    placeholder="₹505"
                    className="h-9"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 h-9 px-2"
                  onClick={() => removePresetAmount(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPresetAmount}
              className="w-full border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Preset Amount
            </Button>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label className="text-sm font-medium">Allow Custom Amount</Label>
                <p className="text-xs text-gray-500">Let donors enter any amount instead of a preset</p>
              </div>
              <Switch
                checked={allowCustomAmount}
                onCheckedChange={setAllowCustomAmount}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEdit ? 'Update Campaign' : 'Submit Campaign for Approval'}
          </Button>
          <Link href="/ngo/campaigns">
            <Button variant="ghost">Cancel</Button>
          </Link>
        </div>
      </form>
    </NgoLayout>
  );
}
