import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import AdminLayout from '@/components/admin/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Eye, Check, X, Loader2, Edit, Pause, Play, Trash2, Power } from 'lucide-react';

export default function AdminNgoCampaignApproval() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['/api/admin/ngo-campaigns'],
    queryFn: async () => {
      const res = await fetch('/api/admin/ngo-campaigns');
      if (!res.ok) throw new Error('Failed to fetch NGO campaigns');
      return res.json();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ campaignId, displayOrder }: { campaignId: number; displayOrder: number }) => {
      const res = await fetch(`/api/admin/ngo-campaigns/${campaignId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayOrder }),
      });
      if (!res.ok) throw new Error('Failed to approve campaign');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ngo-campaigns'] });
      setApproveDialogOpen(false);
      setDisplayOrder('1');
      toast({ title: 'Success', description: 'Campaign approved and published successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ campaignId, reason }: { campaignId: number; reason: string }) => {
      const res = await fetch(`/api/admin/ngo-campaigns/${campaignId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Failed to reject campaign');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ngo-campaigns'] });
      setRejectDialogOpen(false);
      setRejectionReason('');
      toast({ title: 'Success', description: 'Campaign rejected' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (campaignId: number) => {
      const res = await fetch(`/api/admin/ngo-campaigns/${campaignId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete campaign');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ngo-campaigns'] });
      toast({ title: 'Deleted', description: 'Campaign has been deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  });

  const statusChangeMutation = useMutation({
    mutationFn: async ({ campaignId, status }: { campaignId: number; status: string }) => {
      const res = await fetch(`/api/admin/ngo-campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update campaign status');
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ngo-campaigns'] });
      toast({ title: 'Updated', description: `Campaign ${vars.status === 'paused' ? 'paused' : vars.status === 'draft' ? 'deactivated' : 'updated'}` });
    },
    onError: (error) => {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  });

  const filteredCampaigns = statusFilter === 'all' 
    ? campaigns 
    : campaigns?.filter((c: any) => c.campaign.approvalStatus === statusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleApproveClick = (campaign: any) => {
    setSelectedCampaign(campaign);
    setDisplayOrder(campaign.campaign.displayOrder?.toString() || '1');
    setApproveDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!selectedCampaign) return;
    setIsSubmitting(true);
    try {
      await approveMutation.mutateAsync({
        campaignId: selectedCampaign.campaign.id,
        displayOrder: parseInt(displayOrder) || 1
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await rejectMutation.mutateAsync({ 
        campaignId: selectedCampaign.campaign.id, 
        reason: rejectionReason 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">NGO Campaigns</h1>
        
        <div className="flex gap-2 mb-4">
          <Button 
            variant={statusFilter === 'all' ? 'default' : 'ghost'} 
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === 'pending' ? 'default' : 'ghost'} 
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </Button>
          <Button 
            variant={statusFilter === 'approved' ? 'default' : 'ghost'} 
            onClick={() => setStatusFilter('approved')}
          >
            Approved
          </Button>
          <Button 
            variant={statusFilter === 'rejected' ? 'default' : 'ghost'} 
            onClick={() => setStatusFilter('rejected')}
          >
            Rejected
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCampaigns?.map((item: any) => (
            <Card key={item.campaign.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    {item.campaign.title}
                    {getStatusBadge(item.campaign.approvalStatus)}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">by {item.ngo?.name || 'Unknown NGO'}</p>
                  <p className="text-sm text-gray-500">Goal: ₹{item.campaign.goalAmount}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSelectedCampaign(item);
                      setViewDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Link href={`/admin/campaigns/${item.campaign.id}`}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  {item.campaign.approvalStatus === 'pending' && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-600"
                        onClick={() => handleApproveClick(item)}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => {
                          setSelectedCampaign(item);
                          setRejectDialogOpen(true);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {item.campaign.approvalStatus === 'approved' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600"
                      onClick={() => {
                        setSelectedCampaign(item);
                        setRejectDialogOpen(true);
                      }}
                      title="Reject/Take Down Campaign"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {/* Admin power buttons: Pause/Resume, Deactivate, Delete */}
                  {item.campaign.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-amber-600"
                      onClick={() => statusChangeMutation.mutate({ campaignId: item.campaign.id, status: 'paused' })}
                      title="Pause Campaign"
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  )}
                  {item.campaign.status === 'paused' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-emerald-600"
                      onClick={() => statusChangeMutation.mutate({ campaignId: item.campaign.id, status: 'active' })}
                      title="Resume Campaign"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  {item.campaign.status !== 'draft' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600"
                      onClick={() => statusChangeMutation.mutate({ campaignId: item.campaign.id, status: 'draft' })}
                      title="Deactivate Campaign"
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => {
                      if (confirm('Are you sure you want to permanently delete this campaign?')) {
                        deleteMutation.mutate(item.campaign.id);
                      }
                    }}
                    title="Delete Campaign"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
          {filteredCampaigns?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No campaigns found.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">{selectedCampaign.campaign.title}</h3>
                {getStatusBadge(selectedCampaign.campaign.approvalStatus)}
              </div>
              
              {selectedCampaign.campaign.coverImage && (
                <div>
                  <img 
                    src={selectedCampaign.campaign.coverImage} 
                    alt={selectedCampaign.campaign.title} 
                    className="w-full h-64 object-cover rounded-md"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label>NGO</Label>
                <p className="text-gray-700">{selectedCampaign.ngo?.name || 'Unknown'}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Goal Amount</Label>
                  <p className="text-gray-700">₹{selectedCampaign.campaign.goalAmount}</p>
                </div>
                {selectedCampaign.campaign.category && (
                  <div>
                    <Label>Category</Label>
                    <p className="text-gray-700">{selectedCampaign.campaign.category}</p>
                  </div>
                )}
              </div>
              
              {selectedCampaign.campaign.shortDescription && (
                <div className="space-y-2">
                  <Label>Short Description</Label>
                  <p className="text-gray-700">{selectedCampaign.campaign.shortDescription}</p>
                </div>
              )}
              
              {selectedCampaign.campaign.description && (
                <div className="space-y-2">
                  <Label>Description</Label>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedCampaign.campaign.description}</p>
                </div>
              )}
              
              {selectedCampaign.campaign.beneficiaryDetails && (
                <div className="space-y-2">
                  <Label>Beneficiary Details</Label>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedCampaign.campaign.beneficiaryDetails}</p>
                </div>
              )}
              
              {selectedCampaign.campaign.adminRemarks && (
                <div className="mt-4 p-3 bg-yellow-50 rounded">
                  <Label className="text-yellow-800">Admin Remarks</Label>
                  <p className="text-yellow-700">{selectedCampaign.campaign.adminRemarks}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setViewDialogOpen(false)}>Close</Button>
              {selectedCampaign && (
                <Link href={`/admin/campaigns/${selectedCampaign.campaign.id}`}>
                  <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Campaign
                  </Button>
                </Link>
              )}
            </div>
            <div className="flex gap-2">
              {selectedCampaign?.campaign.approvalStatus === 'pending' && (
                <>
                  <Button 
                    variant="ghost" 
                    className="text-red-600" 
                    onClick={() => {
                      setViewDialogOpen(false);
                      setRejectDialogOpen(true);
                    }}
                  >
                    Reject
                  </Button>
                  <Button 
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleApproveClick(selectedCampaign);
                    }}
                  >
                    Approve
                  </Button>
                </>
              )}
              {selectedCampaign?.campaign.approvalStatus === 'approved' && (
                <Button 
                  variant="ghost" 
                  className="text-red-600" 
                  onClick={() => {
                    setViewDialogOpen(false);
                    setRejectDialogOpen(true);
                  }}
                >
                  Reject / Take Down
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Campaign</DialogTitle>
            <DialogDescription>
              Specify the display order for this campaign on the public page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                min="1"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">Lower numbers display first.</p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => {
                setApproveDialogOpen(false);
                setDisplayOrder('1');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApproveConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Approve & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Campaign</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this campaign.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting || !rejectionReason.trim()}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
