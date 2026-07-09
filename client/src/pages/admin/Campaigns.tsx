import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Target, Loader2, CheckCircle2 } from 'lucide-react';
import AdminLayout from "@/components/admin/Layout";
import { Campaign, DonationCategory } from '@shared/schema';

// ─── Auth helper ─────────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('authToken');
}

async function authedFetch(url: string, opts: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Surface the real backend message
    const msg =
      data?.error ||
      data?.message ||
      (Array.isArray(data?.errors)
        ? data.errors.map((e: any) => e.message).join(', ')
        : null) ||
      `Server error ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminCampaigns() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'draft' | 'active' | 'closed'>('active');
  const [isUploading, setIsUploading] = useState(false);
  const [newCampaignId, setNewCampaignId] = useState<number | null>(null);

  // ── Image upload ──────────────────────────────────────────────────────────
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setIsUploading(true);
    try {
      const token = getToken();
      const res = await fetch('/api/upload/banner', {
        method: 'POST',
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setCoverImage(data.imageUrl || data.url || '');
      toast({ title: '✅ Image uploaded successfully' });
    } catch {
      toast({ title: 'Image upload failed', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data: campaigns = [], isLoading } = useQuery<
    (Campaign & { totalRaised: number; donorCount: number })[]
  >({ queryKey: ['/api/campaigns?all=true'] });

  const { data: categories = [] } = useQuery<DonationCategory[]>({
    queryKey: ['/api/donation-categories'],
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: any) =>
      authedFetch('/api/admin/campaigns', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    onSuccess: (data) => {
      // 1. Refresh list
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns?all=true'] });
      // 2. Close modal & reset
      setIsModalOpen(false);
      resetForm();
      // 3. Mark new card for highlight
      setNewCampaignId(data.id);
      setTimeout(() => setNewCampaignId(null), 3000);
      // 4. Toast
      toast({
        title: '✅ Campaign Created Successfully',
        description: `"${data.title}" is ready to configure.`,
      });
      // 5. Navigate to detail page
      setTimeout(() => setLocation(`/admin/campaigns/${data.id}`), 600);
    },

    onError: (err: Error) => {
      console.error('[Campaign create error]', err);
      toast({
        title: 'Unable to create campaign',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      authedFetch(`/api/admin/campaigns/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns?all=true'] });
      toast({ title: 'Campaign deleted' });
    },
    onError: (err: Error) => {
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
    },
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const resetForm = () => {
    setTitle('');
    setSlug('');
    setShortDescription('');
    setGoalAmount('');
    setCoverImage('');
    setStartDate('');
    setEndDate('');
    setStatus('active');
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: 'Campaign Title is required', variant: 'destructive' });
      return;
    }
    if (!goalAmount || isNaN(Number(goalAmount)) || Number(goalAmount) <= 0) {
      toast({ title: 'A valid Goal Amount is required', variant: 'destructive' });
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      slug: slug.trim() || undefined,
      shortDescription: shortDescription.trim() || null,
      description: null,
      goalAmount: parseFloat(goalAmount),
      coverImage: coverImage || '',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status,
      displayOrder: 1,
      isFeatured: false,
      showOnHomepage: true,
      allowCustomAmount: true,
    });
  };

  const isPending = createMutation.isPending;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold font-poppins text-primary">Campaigns Management</h1>
            <p className="text-sm text-gray-500 font-opensans">
              Create campaigns, set up offline payment parameters, preset suggestion cards, and monitor approvals.
            </p>
          </div>
          <Button onClick={handleOpenModal} className="bg-primary hover:bg-opacity-95 text-white flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Campaign
          </Button>
        </div>

        {/* Campaign cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Target className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold font-poppins text-primary mb-1">No Campaigns Created</h3>
              <p className="text-sm text-gray-500 max-w-md mb-6">
                Create a campaign to let visitors donate manually using UPI or bank transfers, and upload payment receipts.
              </p>
              <Button onClick={handleOpenModal} className="bg-primary hover:bg-opacity-95 text-white">
                Create First Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {campaigns.map((campaign) => {
              const isNew = campaign.id === newCampaignId;
              const c = campaign as any;
              return (
                <Card
                  key={campaign.id}
                  className={`border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${isNew
                      ? 'ring-2 ring-green-500 ring-offset-2 animate-pulse bg-green-50'
                      : ''
                    }`}
                >
                  {/* Campaign Cover Image */}
                  {c.coverImage && (
                    <div className="h-36 w-full overflow-hidden relative">
                      <img
                        src={c.coverImage}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                        <h3 className="text-white font-bold font-poppins text-base line-clamp-1 drop-shadow">
                          {campaign.title}
                        </h3>
                        <Badge
                          className={`capitalize font-semibold shrink-0 text-xs ${campaign.status === 'active'
                              ? 'bg-green-500 text-white'
                              : campaign.status === 'draft'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-red-500 text-white'
                            }`}
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      {isNew && (
                        <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-500 text-white">
                          <CheckCircle2 className="w-3 h-3" /> New
                        </span>
                      )}
                    </div>
                  )}

                  <CardHeader className={`pb-2 ${c.coverImage ? 'pt-3' : 'pb-4'}`}>
                    {!c.coverImage && (
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {isNew && (
                            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-500 text-white">
                              <CheckCircle2 className="w-3 h-3" /> New
                            </span>
                          )}
                          <CardTitle className="text-lg font-bold font-poppins text-primary line-clamp-1">
                            {campaign.title}
                          </CardTitle>
                        </div>
                        <Badge
                          className={`capitalize font-semibold shrink-0 ${campaign.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : campaign.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                    )}
                    {c.shortDescription && (
                      <p className="text-xs text-gray-500 font-opensans line-clamp-2 mt-1">{c.shortDescription}</p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div className="grid grid-cols-3 gap-2 text-xs font-opensans text-primary">
                      <div>
                        <span className="text-gray-400 block">Goal</span>
                        <strong className="font-semibold text-sm">₹{Number(campaign.goalAmount).toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Raised</span>
                        <strong className="font-semibold text-sm">₹{campaign.totalRaised.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Donors</span>
                        <strong className="font-semibold text-sm">{campaign.donorCount}</strong>
                      </div>
                    </div>
                    {/* Progress bar */}
                    {campaign.goalAmount && (
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-secondary h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(Math.round((campaign.totalRaised / Number(campaign.goalAmount)) * 100), 100)}%` }}
                        />
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/admin/campaigns/${campaign.id}`)}
                        className="text-primary border-primary hover:bg-neutral"
                      >
                        <Pencil className="w-4 h-4 mr-1.5" /> Manage & Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Delete this campaign? This cannot be undone.'))
                            deleteMutation.mutate(campaign.id);
                        }}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── Create Campaign Dialog ──────────────────────────────────────── */}
        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            if (!open && !isPending) {
              setIsModalOpen(false);
              resetForm();
            }
          }}
        >
          <DialogContent
            className="sm:max-w-lg bg-white border border-gray-200 rounded-xl p-0 flex flex-col gap-0"
            style={{ maxHeight: '90vh' }}
          >
            {/* ── Sticky Header ── */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
              <DialogTitle className="text-xl font-bold font-poppins text-primary">
                Create New Campaign
              </DialogTitle>
              <DialogDescription className="text-sm font-opensans text-gray-500 mt-1">
                Provide title, goal, and core settings. You can configure QR codes and amount cards in the next step.
              </DialogDescription>
            </div>

            {/* ── Scrollable Body ── */}
            <form
              id="create-campaign-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 py-4 space-y-5"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {/* Campaign Title */}
              <div className="grid gap-2">
                <Label htmlFor="cam-title" className="text-primary font-semibold">
                  Campaign Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cam-title"
                  value={title}
                  disabled={isPending}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Janmashtami Anna Daan 2026"
                />
              </div>

              {/* Slug */}
              <div className="grid gap-2">
                <Label htmlFor="cam-slug" className="text-primary font-semibold">
                  Campaign Slug <span className="text-gray-400 font-normal">(Optional)</span>
                </Label>
                <Input
                  id="cam-slug"
                  value={slug}
                  disabled={isPending}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="Auto-generated if empty"
                />
              </div>

              {/* Short Description */}
              <div className="grid gap-2">
                <Label htmlFor="cam-desc" className="text-primary font-semibold">
                  Short Description
                </Label>
                <Textarea
                  id="cam-desc"
                  value={shortDescription}
                  disabled={isPending}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Help us serve prasadam to thousands of devotees..."
                  rows={2}
                />
              </div>

              {/* Goal Amount */}
              <div className="grid gap-2">
                <Label htmlFor="cam-goal" className="text-primary font-semibold">
                  Goal Amount (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cam-goal"
                  type="number"
                  min={1}
                  value={goalAmount}
                  disabled={isPending}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  placeholder="e.g. 500000"
                />
              </div>

              {/* Cover Image */}
              <div className="grid gap-2">
                <Label className="text-primary font-semibold">Cover Image</Label>
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={isPending || isUploading}
                    onChange={handleCoverUpload}
                  />
                  {isUploading && (
                    <span className="flex items-center gap-2 text-xs text-primary">
                      <Loader2 className="w-3 h-3 animate-spin" /> Uploading image…
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 font-medium shrink-0">OR URL:</span>
                    <Input
                      value={coverImage}
                      disabled={isPending}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  {coverImage && (
                    <div className="relative mt-1 h-32 w-full rounded-md border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img src={coverImage} alt="Preview" className="max-h-full max-w-full object-contain" />
                      {!isPending && (
                        <button
                          type="button"
                          onClick={() => setCoverImage('')}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cam-start" className="text-primary font-semibold">
                    Start Date <span className="text-gray-400 font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="cam-start"
                    type="date"
                    value={startDate}
                    disabled={isPending}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cam-end" className="text-primary font-semibold">
                    End Date <span className="text-gray-400 font-normal">(Optional)</span>
                  </Label>
                  <Input
                    id="cam-end"
                    type="date"
                    value={endDate}
                    disabled={isPending}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="grid gap-2">
                <Label htmlFor="cam-status" className="text-primary font-semibold">
                  Initial Status
                </Label>
                <Select
                  value={status}
                  disabled={isPending}
                  onValueChange={(val: any) => setStatus(val)}
                >
                  <SelectTrigger id="cam-status">
                    <SelectValue placeholder="Active (Visible)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border">
                    <SelectItem value="draft">Draft (Hidden)</SelectItem>
                    <SelectItem value="active">Active (Visible)</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>

            {/* ── Sticky Footer ── */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0 flex justify-end gap-3 rounded-b-xl">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="create-campaign-form"
                disabled={isPending || isUploading}
                className="bg-primary hover:bg-opacity-95 text-white min-w-[160px]"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Campaign…
                  </span>
                ) : (
                  'Create & Configure'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
