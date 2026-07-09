import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Campaign, DonationAmountCard } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import useAuth from '@/hooks/useAuth';
import { Copy, Check, Upload, ArrowRight, ArrowLeft } from 'lucide-react';

interface CampaignDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign & { 
    totalRaised?: number; 
    donorCount?: number;
    minCustomAmount?: number | null;
    maxCustomAmount?: number | null;
    bankBranch?: string | null;
    swiftCode?: string | null;
    micrCode?: string | null;
    successMessage?: string | null;
  };
  cards: DonationAmountCard[];
}

export default function CampaignDonationModal({ isOpen, onClose, campaign, cards }: CampaignDonationModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Multi-step state: 1: Details, 2: Amount, 3: Instructions, 4: Proof, 5: Confirmation
  const [step, setStep] = useState(1);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [panCard, setPanCard] = useState('');
  const [message, setMessage] = useState('');

  // Amount states
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [amountType, setAmountType] = useState<'preset' | 'custom'>('preset');

  // Payment proof states
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone((user as any).phone || '');
      setAddress((user as any).address || '');
    }
  }, [user, isOpen]);

  // Copy UPI ID
  const handleCopyUpi = () => {
    if (campaign.upiId) {
      navigator.clipboard.writeText(campaign.upiId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "UPI ID copied to clipboard",
      });
    }
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await apiRequest('/api/upload/proof', 'POST', formData);
      return res.json() as Promise<{ url: string }>;
    },
    onSuccess: (data) => {
      setProofUrl(data.url);
      submitDonationMutation.mutate(data.url);
    },
    onError: (error) => {
      setIsUploading(false);
      toast({
        title: "Upload Failed",
        description: "Failed to upload payment proof. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Submit donation mutation
  const submitDonationMutation = useMutation({
    mutationFn: async (proofFileUrl: string) => {
      const finalAmount = amountType === 'preset' ? selectedAmount : parseInt(customAmount);
      const res = await apiRequest(`/api/campaigns/${campaign.id}/donate`, 'POST', {
          name,
          email,
          phone,
          address: address || undefined,
          panCard: panCard || undefined,
          message: message || undefined,
          amount: finalAmount,
          amountType,
          paymentProofFile: proofFileUrl,
      });
      return res.json();
    },
    onSuccess: () => {
      setIsUploading(false);
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaign.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/donations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/donations'] });
      setStep(5);
    },
    onError: (error) => {
      setIsUploading(false);
      toast({
        title: "Submission Failed",
        description: "Failed to submit donation details. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleNextStep = () => {
    if (step === 1) {
      if (!name || !email) {
        toast({ title: 'Missing Info', description: 'Name and Email are required', variant: 'destructive' });
        return;
      }
    }
    
    if (step === 2) {
      if (amountType === 'custom') {
        const val = parseInt(customAmount);
        if (isNaN(val) || val <= 0) {
          toast({ title: 'Invalid Amount', description: 'Please enter a valid amount', variant: 'destructive' });
          return;
        }
        
        const minAmount = campaign.minCustomAmount || 10;
        const maxAmount = campaign.maxCustomAmount || 1000000;
        
        if (val < minAmount) {
          toast({ title: 'Amount Too Low', description: `Minimum donation amount is ₹${minAmount}`, variant: 'destructive' });
          return;
        }
        if (val > maxAmount) {
          toast({ title: 'Amount Too High', description: `Maximum donation amount is ₹${maxAmount}`, variant: 'destructive' });
          return;
        }
      } else if (!selectedAmount) {
        toast({ title: 'Select Amount', description: 'Please select a donation amount', variant: 'destructive' });
        return;
      }
    }

    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBackStep = () => {
    if (step > 1 && step < 5) {
      setStep(step - 1);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Max file size is 5MB.",
          variant: "destructive"
        });
        return;
      }
      setProofFile(file);
    }
  };

  const handleSubmitProof = () => {
    if (!proofFile) {
      toast({
        title: "Missing Proof",
        description: "Please upload a screenshot or PDF proof of payment.",
        variant: "destructive"
      });
      return;
    }
    setIsUploading(true);
    uploadMutation.mutate(proofFile);
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Donor Information";
      case 2: return "Choose Donation Amount";
      case 3: return "Offline Payment Details";
      case 4: return "Upload Payment Confirmation";
      case 5: return "Donation Received!";
      default: return "Donate";
    }
  };

  const finalAmount = amountType === 'preset' ? selectedAmount : parseInt(customAmount);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg w-full max-h-[90vh] overflow-y-auto bg-white p-6 rounded-xl border border-gray-150">
        <DialogHeader className="border-b pb-4 mb-4">
          {/* Campaign Image Banner */}
          {campaign.coverImage && (
            <div className="-mx-6 -mt-6 mb-4 h-32 overflow-hidden rounded-t-xl relative">
              <img
                src={campaign.coverImage}
                alt={campaign.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-2 left-4">
                <span className="text-white text-xs font-semibold bg-secondary/90 px-2 py-0.5 rounded-full uppercase">
                  {campaign.status}
                </span>
              </div>
            </div>
          )}
          <DialogTitle className="text-2xl font-poppins font-bold text-primary">
            {getStepTitle()}
          </DialogTitle>
          <DialogDescription className="text-sm font-opensans text-gray-500">
            Campaign: <span className="font-semibold text-secondary">{campaign.title}</span>
            {campaign.goalAmount && (
              <span className="ml-2 text-xs text-gray-400">
                · Goal: ₹{Number(campaign.goalAmount).toLocaleString()}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: DONOR DETAILS */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="donor-name" className="text-primary font-semibold">Full Name *</Label>
              <Input 
                id="donor-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your full name" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="donor-email" className="text-primary font-semibold">Email Address *</Label>
              <Input 
                id="donor-email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your email address" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="donor-phone" className="text-primary font-semibold">Phone Number *</Label>
              <Input 
                id="donor-phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="Enter your phone/WhatsApp number" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="donor-address" className="text-primary font-semibold">Residential Address (Optional)</Label>
              <Input 
                id="donor-address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="Enter your address for 80G tax benefits" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="donor-pan" className="text-primary font-semibold">PAN Card (Optional)</Label>
              <Input 
                id="donor-pan" 
                value={panCard} 
                onChange={(e) => setPanCard(e.target.value.toUpperCase())} 
                placeholder="ABCDE1234F" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="donor-message" className="text-primary font-semibold">Message (Optional)</Label>
              <Textarea 
                id="donor-message" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                placeholder="Write a message or dedication" 
                rows={2}
              />
            </div>
            <div className="flex justify-end pt-4 border-t mt-4">
              <Button onClick={handleNextStep} className="bg-primary hover:bg-opacity-95 text-white font-poppins font-medium px-6 py-2.5 rounded-lg flex items-center gap-2">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE AMOUNT */}
        {step === 2 && (
          <div className="space-y-6 py-2">
            <div>
              <p className="text-sm text-gray-500 font-opensans mb-4">
                Please select a suggested amount card or input a custom donation value:
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {cards.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => {
                      setSelectedAmount(card.amount);
                      setAmountType('preset');
                    }}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex flex-col items-start justify-between gap-2 ${
                      amountType === 'preset' && selectedAmount === card.amount
                        ? 'border-secondary bg-orange-50 shadow-md'
                        : 'border-gray-200 hover:border-primary hover:shadow-sm'
                    }`}
                  >
                    <div className="w-full">
                      <span className="text-xl font-poppins font-bold text-primary block">₹{card.amount.toLocaleString()}</span>
                      {card.label && (
                        <span className="text-xs text-gray-500 font-opensans mt-0.5 block leading-snug">{card.label}</span>
                      )}
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 self-end ${
                      amountType === 'preset' && selectedAmount === card.amount
                        ? 'border-secondary bg-secondary'
                        : 'border-gray-300'
                    }`}>
                      {amountType === 'preset' && selectedAmount === card.amount && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {campaign.allowCustomAmount && (
              <div className="border-t pt-4">
                <Label htmlFor="custom-amount" className="text-primary font-semibold mb-2 block">
                  Or enter custom amount:
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 text-lg font-semibold">₹</span>
                  <Input
                    id="custom-amount"
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setAmountType('custom');
                      setSelectedAmount(null);
                    }}
                    placeholder="Enter any amount"
                    className="pl-8 text-lg font-poppins font-semibold"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t mt-4">
              <Button variant="outline" onClick={handleBackStep} className="font-poppins font-medium px-4 py-2 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button onClick={handleNextStep} className="bg-primary hover:bg-opacity-95 text-white font-poppins font-medium px-6 py-2 flex items-center gap-2">
                Proceed to Pay <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT INSTRUCTIONS */}
        {step === 3 && (
          <div className="space-y-6 py-2">
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center">
              <span className="text-xs font-semibold uppercase text-secondary font-poppins">Amount to pay</span>
              <h4 className="text-3xl font-poppins font-bold text-primary mt-1">₹{finalAmount}</h4>
            </div>

            {/* UPI Section */}
            {campaign.upiId && (
              <div className="border p-4 rounded-xl space-y-3 bg-neutral/30">
                <h5 className="font-poppins font-bold text-primary">Pay via UPI</h5>
                <div className="flex items-center justify-between bg-white border p-2.5 rounded-lg">
                  <span className="font-mono font-medium text-primary select-all">{campaign.upiId}</span>
                  <Button size="sm" variant="ghost" onClick={handleCopyUpi} className="text-secondary hover:text-primary">
                    {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                
                {campaign.qrCodeImage && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-500 font-opensans mb-2">Scan QR code with any UPI App:</p>
                    <img 
                      src={campaign.qrCodeImage} 
                      alt="UPI QR Code" 
                      className="w-44 h-44 object-contain mx-auto border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Bank Transfer Section */}
            {campaign.bankAccountNumber && (
              <div className="border p-4 rounded-xl space-y-3 bg-neutral/30">
                <h5 className="font-poppins font-bold text-primary">Pay via Bank Transfer (NEFT/IMPS)</h5>
                <div className="grid grid-cols-2 gap-3 text-sm font-opensans text-primary">
                  <div>
                    <span className="text-xs text-gray-500 block">Bank Name</span>
                    <strong className="font-medium">{campaign.bankName || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Account Holder</span>
                    <strong className="font-medium">{campaign.bankAccountHolder || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Account Number</span>
                    <strong className="font-mono font-semibold">{campaign.bankAccountNumber}</strong>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">IFSC Code</span>
                    <strong className="font-mono font-semibold">{campaign.bankIfsc}</strong>
                  </div>
                  {campaign.bankBranch && (
                    <div>
                      <span className="text-xs text-gray-500 block">Branch Name</span>
                      <strong className="font-medium">{campaign.bankBranch}</strong>
                    </div>
                  )}
                  {campaign.swiftCode && (
                    <div>
                      <span className="text-xs text-gray-500 block">SWIFT Code</span>
                      <strong className="font-mono font-semibold">{campaign.swiftCode}</strong>
                    </div>
                  )}
                  {campaign.micrCode && (
                    <div>
                      <span className="text-xs text-gray-500 block">MICR Code</span>
                      <strong className="font-mono font-semibold">{campaign.micrCode}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-150 p-4 rounded-xl">
              <p className="text-xs text-blue-700 font-opensans leading-relaxed">
                📢 <strong>Instructions:</strong> Please make the payment using your favorite payment app (GPay, PhonePe, Paytm, or your bank's net-banking app) using the details above. Make sure to take a screenshot of the successful transaction page (or download a PDF receipt) to upload as proof on the next screen.
              </p>
            </div>

            <div className="flex justify-between pt-4 border-t mt-4">
              <Button variant="outline" onClick={handleBackStep} className="font-poppins font-medium px-4 py-2 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button onClick={handleNextStep} className="bg-primary hover:bg-opacity-95 text-white font-poppins font-medium px-6 py-2 flex items-center gap-2">
                Done, Upload Proof <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: UPLOAD PAYMENT PROOF */}
        {step === 4 && (
          <div className="space-y-6 py-2">
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center">
              <span className="text-xs font-semibold uppercase text-secondary font-poppins">Amount Paid</span>
              <h4 className="text-3xl font-poppins font-bold text-primary mt-1">₹{finalAmount}</h4>
            </div>

            <div className="space-y-3">
              <Label className="text-primary font-semibold block text-center">Upload Screenshot or PDF Receipt *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary transition-colors bg-neutral/10 relative">
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-poppins font-semibold text-primary">
                  {proofFile ? proofFile.name : "Click to browse or drag & drop files here"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Accepts JPG, PNG, or PDF formats up to 5MB</p>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t mt-4">
              <Button variant="outline" onClick={handleBackStep} className="font-poppins font-medium px-4 py-2 flex items-center gap-2" disabled={isUploading}>
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button 
                onClick={handleSubmitProof} 
                disabled={!proofFile || isUploading}
                className="bg-primary hover:bg-opacity-95 text-white font-poppins font-medium px-6 py-2 flex items-center gap-2"
              >
                {isUploading ? "Submitting..." : "Submit Donation"}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5: CONFIRMATION SCREEN */}
        {step === 5 && (
          <div className="space-y-6 py-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-poppins font-bold text-primary">Thank You for Your Support!</h3>
              
              {campaign.successMessage ? (
                <div 
                  className="prose max-w-sm mx-auto text-sm text-gray-600 font-opensans leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: campaign.successMessage }}
                />
              ) : (
                <p className="text-sm text-gray-600 font-opensans max-w-sm mx-auto leading-relaxed">
                  Your donation of <span className="font-semibold text-secondary">₹{finalAmount}</span> has been submitted successfully and is pending manual verification.
                </p>
              )}
            </div>

            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl max-w-sm mx-auto">
              <p className="text-xs text-secondary font-opensans leading-normal">
                Our team will review the transaction proof and approve your donation. You can check the verification status in your profile history at any time.
              </p>
            </div>

            <div className="pt-4 border-t mt-6">
              <Button 
                onClick={() => {
                  onClose();
                  setStep(1);
                  setProofFile(null);
                  setProofUrl('');
                  setSelectedAmount(null);
                  setCustomAmount('');
                }}
                className="bg-primary hover:bg-opacity-95 text-white font-poppins font-medium px-8 py-2.5 rounded-lg"
              >
                Close Window
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
