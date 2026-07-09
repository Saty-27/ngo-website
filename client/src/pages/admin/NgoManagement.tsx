import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Check, X, Loader2, FileText, ExternalLink, Building2, KeyRound, Copy } from 'lucide-react';

// Helper: show image or PDF link
function MediaViewer({ url, label }: { url: string; label: string }) {
  if (!url) return null;
  const isPdf = url.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  return (
    <div className="border rounded-xl overflow-hidden bg-gray-50">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 pt-3 pb-1">{label}</p>
      {isImage ? (
        <div className="relative">
          <img src={url} alt={label} className="w-full max-h-48 object-contain bg-white p-2" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
          <a href={url} target="_blank" rel="noreferrer" className="absolute bottom-2 right-2 bg-primary/80 text-white text-xs px-2 py-1 rounded hover:bg-primary flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> Open Full
          </a>
        </div>
      ) : isPdf ? (
        <div className="flex items-center gap-3 p-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">PDF Document</p>
            <a href={url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Open / Download
            </a>
          </div>
        </div>
      ) : (
        <div className="p-3">
          <a href={url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> View File
          </a>
        </div>
      )}
    </div>
  );
}

// Helper: password field with show/hide toggle and copy
function PasswordField({ password }: { password: string }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2 mt-1">
      <span className={`font-mono text-sm text-gray-800 flex-1 ${show ? '' : 'tracking-widest select-none'}`}>
        {show ? password : '•'.repeat(Math.min(password.length, 12))}
      </span>
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="text-gray-400 hover:text-primary transition-colors p-1"
        title={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="text-gray-400 hover:text-primary transition-colors p-1"
        title="Copy password"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function AdminNgoManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedNgo, setSelectedNgo] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [newPasswords, setNewPasswords] = useState<Record<number, string>>({});
  const [resettingId, setResettingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: ngos, isLoading } = useQuery({
    queryKey: ['/api/admin/ngos'],
    queryFn: async () => {
      const res = await fetch('/api/admin/ngos');
      if (!res.ok) throw new Error('Failed to fetch NGOs');
      return res.json();
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (ngoId: number) => {
      const res = await fetch(`/api/admin/ngos/${ngoId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to approve NGO');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ngos'] });
      toast({ title: 'Success', description: 'NGO approved successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ ngoId, reason }: { ngoId: number; reason: string }) => {
      const res = await fetch(`/api/admin/ngos/${ngoId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Failed to reject NGO');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/ngos'] });
      setRejectDialogOpen(false);
      setRejectionReason('');
      toast({ title: 'Success', description: 'NGO rejected' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  });

  const filteredNgos = statusFilter === 'all' 
    ? ngos 
    : ngos?.filter((ngo: any) => ngo.status === statusFilter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'suspended':
        return <Badge className="bg-orange-100 text-orange-800">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleApprove = (ngo: any) => {
    approveMutation.mutate(ngo.id);
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await rejectMutation.mutateAsync({ ngoId: selectedNgo.id, reason: rejectionReason });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">NGO Management</h1>
        
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
          {filteredNgos?.map((ngo: any) => (
            <Card key={ngo.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    {ngo.name}
                    {getStatusBadge(ngo.status)}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{ngo.email}</p>
                  <p className="text-sm text-gray-500">{ngo.phone}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSelectedNgo(ngo);
                      setViewDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {ngo.status === 'pending' && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-600"
                        onClick={() => handleApprove(ngo)}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => {
                          setSelectedNgo(ngo);
                          setRejectDialogOpen(true);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
          {filteredNgos?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                No NGOs found.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>NGO Details</DialogTitle>
          </DialogHeader>
          {selectedNgo && (
            <div className="space-y-5">
              {/* NGO Header: Logo + Name + Status */}
              <div className="flex items-center gap-4 pb-3 border-b">
                {selectedNgo.logo ? (
                  <img
                    src={selectedNgo.logo}
                    alt={selectedNgo.name}
                    className="w-16 h-16 rounded-xl object-contain border bg-white p-1 shadow-sm"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{selectedNgo.name}</h3>
                  <p className="text-sm text-gray-500">{selectedNgo.registrationNumber}</p>
                  {getStatusBadge(selectedNgo.status)}
                </div>
              </div>

              {/* Media Files Section */}
              {(selectedNgo.logo || selectedNgo.registrationCertificate || selectedNgo.qrCode) && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-primary text-sm uppercase tracking-wide">📎 Uploaded Documents & Media</h4>
                  <div className="grid gap-3">
                    {selectedNgo.logo && (
                      <MediaViewer url={selectedNgo.logo} label="NGO Logo" />
                    )}
                    {selectedNgo.registrationCertificate && (
                      <MediaViewer url={selectedNgo.registrationCertificate} label="Registration Certificate" />
                    )}
                    {selectedNgo.qrCode && (
                      <MediaViewer url={selectedNgo.qrCode} label="UPI QR Code" />
                    )}
                  </div>
                </div>
              )}

              {/* Basic Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500 uppercase">Email</Label>
                  <p className="text-gray-800 font-medium">{selectedNgo.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 uppercase">Phone</Label>
                  <p className="text-gray-800 font-medium">{selectedNgo.phone}</p>
                </div>
                {selectedNgo.alternatePhone && (
                  <div>
                    <Label className="text-xs text-gray-500 uppercase">Alternate Phone</Label>
                    <p className="text-gray-800 font-medium">{selectedNgo.alternatePhone}</p>
                  </div>
                )}
                {selectedNgo.website && (
                  <div>
                    <Label className="text-xs text-gray-500 uppercase">Website</Label>
                    <a href={selectedNgo.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> {selectedNgo.website}
                    </a>
                  </div>
                )}
                <div className="md:col-span-2">
                  <Label className="text-xs text-gray-500 uppercase">Address</Label>
                  <p className="text-gray-800">{selectedNgo.address}</p>
                </div>
                {selectedNgo.city && (
                  <div className="md:col-span-2">
                    <Label className="text-xs text-gray-500 uppercase">Location</Label>
                    <p className="text-gray-800">{selectedNgo.city}, {selectedNgo.state} - {selectedNgo.pincode} ({selectedNgo.country})</p>
                  </div>
                )}
              </div>

              {/* Authorized Person + Login Credentials */}
              {(selectedNgo.authorizedPersonName || selectedNgo.authorizedPersonDesignation || (selectedNgo.loginCredentials && selectedNgo.loginCredentials.length > 0)) && (
                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-semibold text-primary text-sm">👤 Authorized Person & Login Credentials</h4>
                  <div className="grid md:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
                    {selectedNgo.authorizedPersonName && (
                      <div>
                        <Label className="text-xs text-gray-500 uppercase">Name</Label>
                        <p className="text-gray-800 font-medium">{selectedNgo.authorizedPersonName}</p>
                      </div>
                    )}
                    {selectedNgo.authorizedPersonDesignation && (
                      <div>
                        <Label className="text-xs text-gray-500 uppercase">Designation</Label>
                        <p className="text-gray-800">{selectedNgo.authorizedPersonDesignation}</p>
                      </div>
                    )}
                    {selectedNgo.authorizedPersonPhone && (
                      <div>
                        <Label className="text-xs text-gray-500 uppercase">Phone</Label>
                        <p className="text-gray-800">{selectedNgo.authorizedPersonPhone}</p>
                      </div>
                    )}
                    {selectedNgo.authorizedPersonEmail && (
                      <div>
                        <Label className="text-xs text-gray-500 uppercase">Email</Label>
                        <p className="text-gray-800">{selectedNgo.authorizedPersonEmail}</p>
                      </div>
                    )}
                  </div>

                  {/* Login Credentials */}
                  {selectedNgo.loginCredentials && selectedNgo.loginCredentials.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide flex items-center gap-1">
                        <KeyRound className="w-3.5 h-3.5" /> NGO Portal Login Credentials
                      </p>
                      {selectedNgo.loginCredentials.map((cred: any) => (
                        <div key={cred.id} className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-800 uppercase">{cred.role?.replace('_', ' ')}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              cred.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {cred.isActive ? '✓ Active' : '✗ Inactive'}
                            </span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs text-gray-500 uppercase">Login Name</Label>
                              <p className="text-gray-800 font-medium text-sm">{cred.name}</p>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-500 uppercase">Login Email</Label>
                              <p className="text-gray-800 font-mono text-sm">{cred.email}</p>
                            </div>
                            <div className="md:col-span-2">
                              <Label className="text-xs text-gray-500 uppercase">Password</Label>
                              {cred.plainPassword ? (
                                <PasswordField password={cred.plainPassword} />
                              ) : (
                                <p className="text-xs text-amber-700 italic mt-1">Password set before this feature — use Reset below</p>
                              )}
                            </div>
                            {/* Reset Password inline */}
                            <div className="md:col-span-2 border-t pt-3">
                              <Label className="text-xs text-gray-500 uppercase mb-1 block">Set / Reset Password</Label>
                              <div className="flex gap-2">
                                <Input
                                  type="text"
                                  placeholder="Enter new password..."
                                  value={newPasswords[cred.id] || ''}
                                  onChange={(e) => setNewPasswords(prev => ({ ...prev, [cred.id]: e.target.value }))}
                                  className="text-sm h-8 font-mono"
                                />
                                <Button
                                  size="sm"
                                  disabled={resettingId === cred.id || !newPasswords[cred.id]?.trim()}
                                  onClick={async () => {
                                    const pw = newPasswords[cred.id]?.trim();
                                    if (!pw) return;
                                    setResettingId(cred.id);
                                    try {
                                      const res = await fetch(`/api/admin/ngo-users/${cred.id}/reset-password`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ password: pw }),
                                      });
                                      if (!res.ok) throw new Error('Failed');
                                      toast({ title: 'Password Updated', description: `Password set to: ${pw}` });
                                      queryClient.invalidateQueries({ queryKey: ['/api/admin/ngos'] });
                                      // Update selectedNgo inline
                                      setSelectedNgo((prev: any) => ({
                                        ...prev,
                                        loginCredentials: prev.loginCredentials.map((c: any) =>
                                          c.id === cred.id ? { ...c, plainPassword: pw } : c
                                        )
                                      }));
                                      setNewPasswords(prev => ({ ...prev, [cred.id]: '' }));
                                    } catch {
                                      toast({ title: 'Error', description: 'Failed to reset password', variant: 'destructive' });
                                    } finally {
                                      setResettingId(null);
                                    }
                                  }}
                                  className="h-8 bg-primary text-white text-xs px-3 whitespace-nowrap"
                                >
                                  {resettingId === cred.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Set Password'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* About / Mission / Vision */}
              {(selectedNgo.about || selectedNgo.mission || selectedNgo.vision) && (
                <div className="border-t pt-4 space-y-3">
                  <h4 className="font-semibold text-primary text-sm">📋 About & Mission</h4>
                  {selectedNgo.about && (
                    <div>
                      <Label className="text-xs text-gray-500 uppercase">About</Label>
                      <p className="text-gray-700 text-sm leading-relaxed">{selectedNgo.about}</p>
                    </div>
                  )}
                  {selectedNgo.mission && (
                    <div>
                      <Label className="text-xs text-gray-500 uppercase">Mission</Label>
                      <p className="text-gray-700 text-sm leading-relaxed">{selectedNgo.mission}</p>
                    </div>
                  )}
                  {selectedNgo.vision && (
                    <div>
                      <Label className="text-xs text-gray-500 uppercase">Vision</Label>
                      <p className="text-gray-700 text-sm leading-relaxed">{selectedNgo.vision}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Details */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-primary text-sm mb-3">🏦 Payment Details</h4>
                <div className="grid md:grid-cols-2 gap-3 bg-blue-50 p-3 rounded-lg">
                  {selectedNgo.accountHolderName && (
                    <div>
                      <Label className="text-xs text-gray-500 uppercase">Account Holder</Label>
                      <p className="text-gray-800 font-medium">{selectedNgo.accountHolderName}</p>
                    </div>
                  )}
                  {selectedNgo.bankName && (
                    <div>
                      <Label className="text-xs text-gray-500 uppercase">Bank Name</Label>
                      <p className="text-gray-800">{selectedNgo.bankName}</p>
                    </div>
                  )}
                  {selectedNgo.accountNumber && (
                    <div>
                      <Label className="text-xs text-gray-500 uppercase">Account Number</Label>
                      <p className="text-gray-800 font-mono font-semibold">{selectedNgo.accountNumber}</p>
                    </div>
                  )}
                  {selectedNgo.ifscCode && (
                    <div>
                      <Label className="text-xs text-gray-500 uppercase">IFSC Code</Label>
                      <p className="text-gray-800 font-mono">{selectedNgo.ifscCode}</p>
                    </div>
                  )}
                  {selectedNgo.branchName && (
                    <div>
                      <Label className="text-xs text-gray-500 uppercase">Branch</Label>
                      <p className="text-gray-800">{selectedNgo.branchName}</p>
                    </div>
                  )}
                  {selectedNgo.upiId && (
                    <div>
                      <Label className="text-xs text-gray-500 uppercase">UPI ID</Label>
                      <p className="text-gray-800 font-mono">{selectedNgo.upiId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              {(selectedNgo.establishedYear || selectedNgo.totalVolunteers || selectedNgo.totalBeneficiaries) && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-primary text-sm mb-3">📊 Organization Stats</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedNgo.establishedYear && (
                      <div className="text-center bg-primary/5 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Est. Year</p>
                        <p className="font-bold text-primary text-lg">{selectedNgo.establishedYear}</p>
                      </div>
                    )}
                    {selectedNgo.totalVolunteers && (
                      <div className="text-center bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Volunteers</p>
                        <p className="font-bold text-green-700 text-lg">{selectedNgo.totalVolunteers}</p>
                      </div>
                    )}
                    {selectedNgo.totalBeneficiaries && (
                      <div className="text-center bg-orange-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Beneficiaries</p>
                        <p className="font-bold text-orange-700 text-lg">{selectedNgo.totalBeneficiaries}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedNgo.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <Label className="text-red-800 font-semibold">❌ Rejection Reason</Label>
                  <p className="text-red-700 text-sm mt-1">{selectedNgo.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setViewDialogOpen(false)}>Close</Button>
            {selectedNgo?.status === 'pending' && (
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
                    handleApprove(selectedNgo);
                    setViewDialogOpen(false);
                  }}
                >
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject NGO Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this NGO registration.
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
