import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { User, DonationCard, DonationCategory, Event, BankDetails } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import useAuth from '@/hooks/useAuth';
import { Loader2, CreditCard, IndianRupee, Upload, Copy, Check } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  donationCard?: DonationCard;
  eventDonationCard?: {
    id: number;
    eventId: number;
    title: string;
    amount: number;
    description: string | null;
    imageUrl: string | null;
  };
  customAmount?: number;
  donationCategory?: DonationCategory;
  event?: Event;
}

const PaymentModal = ({
  isOpen,
  onClose,
  donationCard,
  eventDonationCard,
  customAmount,
  donationCategory,
  event
}: PaymentModalProps) => {
  const { toast } = useToast();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [panCard, setPanCard] = useState('');
  const [copied, setCopied] = useState(false);

  // Fetch bank details for category or event
  const { data: bankDetails = [] } = useQuery<BankDetails[]>({
    queryKey: donationCategory 
      ? [`/api/categories/${donationCategory.id}/bank-details`]
      : event 
      ? [`/api/events/${event.id}/bank-details`]
      : ['/api/bank-details'],
    enabled: Boolean(isOpen && (donationCategory || event)),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });


  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    amount: customAmount || donationCard?.amount || eventDonationCard?.amount || 0,
    message: ''
  });

  // No authentication check - allow donations without login

  // Auto-populate form with user data when available
  useEffect(() => {
    if (authUser) {
      setFormData(prev => ({
        ...prev,
        name: authUser.name || '',
        email: authUser.email || ''
      }));
    }
  }, [authUser]);

  // Set amount when props change
  useEffect(() => {
    if (customAmount) {
      setFormData(prev => ({ ...prev, amount: customAmount }));
    } else if (donationCard) {
      setFormData(prev => ({ ...prev, amount: donationCard.amount }));
    } else if (eventDonationCard) {
      setFormData(prev => ({ ...prev, amount: eventDonationCard.amount }));
    }
  }, [customAmount, donationCard, eventDonationCard]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter your name",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return false;
    }
    if (formData.amount <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid donation amount",
        variant: "destructive"
      });
      return false;
    }
    if (!proofFile) {
      toast({
        title: "Validation Error",
        description: "Please upload a payment proof",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      // 1. Upload payment proof file
      const fileData = new FormData();
      fileData.append('file', proofFile!);
      const uploadRes = await apiRequest('/api/upload/proof', 'POST', fileData);
      const { url: proofFileUrl } = await uploadRes.json();

      // 2. Prepare donation data
      const finalAmount = customAmount ? formData.amount : (donationCard?.amount || eventDonationCard?.amount || formData.amount);
      const amountType = customAmount ? 'custom' : 'preset';
      
      const donationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || undefined,
        panCard: panCard || undefined,
        amount: finalAmount,
        amountType: amountType,
        message: formData.message || undefined,
        categoryId: donationCard?.categoryId || donationCategory?.id || undefined,
        cardId: donationCard?.id || undefined,
        eventId: eventDonationCard?.eventId || event?.id || undefined,
        eventCardId: eventDonationCard?.id || undefined,
        paymentProofFile: proofFileUrl,
        status: 'pending'
      };

      // 3. Submit offline donation
      await apiRequest('/api/donations', 'POST', donationData);

      toast({
        title: "Success",
        description: "Your donation has been submitted for approval.",
      });
      
      onClose();
      // Reload page to reflect changes
      window.location.reload();
      
    } catch (error: any) {
      // Check if it's an authentication error
      if (error.message && error.message.includes('401')) {
        toast({
          title: "Authentication Required",
          description: "Your session has expired. Redirecting to login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }, 2000);
        onClose();
      } else {
        toast({
          title: "Payment Error",
          description: error.message || "Failed to process payment. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getDonationTitle = () => {
    if (eventDonationCard) return eventDonationCard.title;
    if (donationCard) return donationCard.title;
    if (customAmount) return "Custom Donation";
    return "Donation";
  };

  const getDonationDescription = () => {
    if (eventDonationCard) return eventDonationCard.description;
    if (donationCard) return donationCard.description;
    if (customAmount && donationCategory) return `Custom donation for ${donationCategory.name}`;
    return "Your generous contribution";
  };

  const getMainHeading = () => {
    if (event) return `${event.title} - ${getDonationTitle()}`;
    if (donationCategory) return `${donationCategory.name} - ${getDonationTitle()}`;
    return getDonationTitle();
  };

  const getSubHeading = () => {
    if (eventDonationCard) return `Donating for ${event?.title || 'Special Event'}`;
    if (donationCard && donationCategory) return `Donating for ${donationCategory.name}`;
    if (customAmount && donationCategory) return `Custom donation for ${donationCategory.name}`;
    return "Making a donation";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-poppins font-semibold text-primary">
            Complete Your Donation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Donation Details */}
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-primary">
            <h3 className="font-poppins font-semibold text-lg text-primary mb-1">
              {getMainHeading()}
            </h3>
            <p className="text-sm text-orange-700 font-medium mb-2">
              {getSubHeading()}
            </p>
            <p className="text-sm text-gray-600 mb-3">
              {getDonationDescription()}
            </p>
            <div className="flex items-center text-2xl font-bold text-primary">
              <IndianRupee className="w-6 h-6 mr-1" />
              {formData.amount.toLocaleString('en-IN')}
            </div>
          </div>

          {/* User Details Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your 10-digit phone number"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter your address (optional)"
                className="mt-1"
              />
            </div>

            {customAmount && (
              <div>
                <Label htmlFor="amount">Donation Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseInt(e.target.value) || 0)}
                  placeholder="Enter amount"
                  className="mt-1"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="panCard">PAN Card (Optional)</Label>
              <Input
                id="panCard"
                type="text"
                value={panCard}
                onChange={(e) => setPanCard(e.target.value.toUpperCase())}
                placeholder="Enter PAN Card Number"
                className="mt-1 uppercase"
                maxLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">Required for 80G tax exemption</p>
            </div>

            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Leave a message with your donation"
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Bank Details Section */}
          {bankDetails.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">Bank Details for Direct Transfer</h3>
              <div className="space-y-2 text-sm">
                <div><strong>Account Name:</strong> {bankDetails[0].accountName}</div>
                <div><strong>Bank Name:</strong> {bankDetails[0].bankName}</div>
                <div><strong>Account Number:</strong> {bankDetails[0].accountNumber}</div>
                <div><strong>IFSC Code:</strong> {bankDetails[0].ifscCode}</div>
                {bankDetails[0].swiftCode && (
                  <div><strong>SWIFT Code:</strong> {bankDetails[0].swiftCode}</div>
                )}
              </div>
              
              {/* QR Code for UPI */}
              {bankDetails[0].qrCodeUrl && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-blue-700 mb-2">Or scan QR code for UPI payment:</p>
                  <img
                    src={bankDetails[0].qrCodeUrl}
                    alt="UPI QR Code"
                    className="w-32 h-32 mx-auto rounded border"
                  />
                </div>
              )}

              {bankDetails[0].upiId && (
                <div className="mt-4 p-2 bg-white rounded border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">UPI ID</span>
                    <strong className="font-mono">{bankDetails[0].upiId}</strong>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      navigator.clipboard.writeText(bankDetails[0].upiId!);
                      setCopied(true);
                      toast({
                        title: "Copied!",
                        description: "UPI ID copied to clipboard",
                      });
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="h-8 ml-2"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Payment Proof Upload Section */}
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h3 className="font-semibold text-primary mb-3">Upload Payment Proof *</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('proof-upload')?.click()}
                  className="w-full h-20 border-dashed border-2 flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {proofFile ? proofFile.name : 'Click to upload screenshot/PDF'}
                  </span>
                </Button>
                <input
                  id="proof-upload"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setProofFile(file);
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                Please transfer the amount using the details above and upload the success screenshot here.
              </p>
            </div>
          </div>

          {/* Payment Button */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;