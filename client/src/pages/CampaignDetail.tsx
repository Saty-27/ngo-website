import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Campaign, DonationAmountCard } from '@shared/schema';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { CalendarIcon, Users, Target, ChevronDown, ChevronUp, Copy, Check, Info } from 'lucide-react';
import { useState } from 'react';
import CampaignDonationModal from '@/components/donate/CampaignDonationModal';
import { useToast } from '@/hooks/use-toast';

interface CampaignDetailData extends Campaign {
  totalRaised: number;
  donorCount: number;
  cards: DonationAmountCard[];
  donations: { name: string; amount: number; createdAt: string }[];
}

export default function CampaignDetail() {
  const [, params] = useRoute('/campaigns/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const id = parseInt(params?.id || '0');

  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const { data: campaign, isLoading, error } = useQuery<CampaignDetailData>({
    queryKey: [`/api/campaigns/${id}`],
    enabled: id > 0,
  });

  if (error || (!isLoading && !campaign)) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-20 text-center min-h-[60vh]">
          <h2 className="text-2xl font-bold font-poppins text-primary mb-4">Campaign Not Found</h2>
          <p className="text-gray-500 mb-8">The campaign you are looking for does not exist or has been removed.</p>
          <Button onClick={() => setLocation('/campaigns')} className="bg-primary hover:bg-opacity-95 text-white">
            Back to Campaigns
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  const handleCopyUpi = () => {
    if (campaign?.upiId) {
      navigator.clipboard.writeText(campaign.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
      toast({
        title: "Copied!",
        description: "UPI ID copied to clipboard",
      });
    }
  };

  const percent = campaign && campaign.goalAmount 
    ? Math.min(Math.round((campaign.totalRaised / Number(campaign.goalAmount)) * 100), 100)
    : 0;

  return (
    <>
      <Helmet>
        <title>{campaign ? `${campaign.title} - Campaigns` : 'Loading Campaign...'} - NGO Admin</title>
        <meta name="description" content={campaign?.description || 'Campaign details'} />
      </Helmet>

      <Header />

      <main className="bg-neutral-50 min-h-screen py-10">
        <div className="container mx-auto px-4 max-w-5xl">
          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-96 w-full rounded-2xl" />
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
            </div>
          ) : campaign && (
            <div className="space-y-8">
              {/* Cover Banner */}
              <div className="h-96 w-full rounded-2xl overflow-hidden shadow-md relative bg-gray-150">
                {campaign.coverImage ? (
                  <img 
                    src={campaign.coverImage} 
                    alt={campaign.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                    <Target className="w-20 h-20 text-primary" />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-primary text-white font-poppins text-xs font-semibold px-3 py-1.5 rounded-full capitalize">
                  {campaign.status}
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Details (Left 2 cols) */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold font-poppins text-primary leading-tight">
                      {campaign.title}
                    </h1>

                    {campaign.shortDescription && (
                      <p className="text-lg text-gray-600 font-medium font-opensans leading-snug">
                        {campaign.shortDescription}
                      </p>
                    )}

                    {campaign.donationCategoryId && (
                      <div className="inline-flex items-center gap-1.5 bg-neutral px-3 py-1.5 rounded-full text-xs text-primary font-semibold">
                        Tag: Campaign Category Group
                      </div>
                    )}

                    {campaign.description && (
                      <div 
                        className="prose max-w-none text-primary font-opensans leading-relaxed pt-2"
                        dangerouslySetInnerHTML={{ __html: campaign.description }}
                      />
                    )}

                    {/* Video Section */}
                    {Boolean(campaign.videoUrl) && (
                      <div className="pt-6">
                        <h3 className="text-xl font-bold font-poppins text-primary mb-4">Campaign Video</h3>
                        <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden bg-black/5">
                          {campaign.videoUrl!.includes('youtube.com') || campaign.videoUrl!.includes('youtu.be') ? (
                            <iframe 
                              src={`https://www.youtube.com/embed/${campaign.videoUrl!.split('v=')[1]?.split('&')[0] || campaign.videoUrl!.split('youtu.be/')[1]}`} 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                              allowFullScreen
                              className="w-full h-full min-h-[300px]"
                            />
                          ) : (
                            <video src={campaign.videoUrl!} controls className="w-full h-full max-h-[400px] object-cover" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Gallery Section */}
                    {Boolean(campaign.galleryImages) && Array.isArray(campaign.galleryImages) && campaign.galleryImages.length > 0 && (
                      <div className="pt-6">
                        <h3 className="text-xl font-bold font-poppins text-primary mb-4">Gallery</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {(campaign.galleryImages as string[]).map((img, i) => (
                            <img key={i} src={img} alt={`Gallery ${i}`} className="w-full h-32 object-cover rounded-lg shadow-sm" />
                          ))}
                        </div>
                      </div>
                    )}

                    {(campaign.startDate || campaign.endDate) && (
                      <div className="border-t pt-4 flex flex-wrap gap-6 text-sm text-gray-500 font-opensans">
                        {campaign.startDate && (
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="w-4 h-4 text-secondary" />
                            <span>Started: <strong>{format(new Date(campaign.startDate), 'dd MMMM yyyy')}</strong></span>
                          </div>
                        )}
                        {campaign.endDate && (
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="w-4 h-4 text-secondary" />
                            <span>Ends: <strong>{format(new Date(campaign.endDate), 'dd MMMM yyyy')}</strong></span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Payment Details info */}
                  <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-xl font-bold font-poppins text-primary">Payment Information</h3>
                    <p className="text-sm text-gray-500 font-opensans">
                      Use the following information to pay offline before uploading proof:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {campaign.upiId && (
                        <div className="border p-4 rounded-xl space-y-2 bg-neutral/10">
                          <span className="text-xs text-gray-500 font-poppins uppercase font-semibold">UPI ID</span>
                          <div className="flex items-center justify-between bg-white border p-2 rounded-lg">
                            <span className="font-mono text-sm text-primary select-all">{campaign.upiId}</span>
                            <Button size="sm" variant="ghost" onClick={handleCopyUpi}>
                              {copiedUpi ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      )}
                      {campaign.bankAccountNumber && (
                        <div className="border p-4 rounded-xl space-y-2 bg-neutral/10">
                          <span className="text-xs text-gray-500 font-poppins uppercase font-semibold">Bank details</span>
                          <p className="text-xs text-primary font-opensans leading-relaxed">
                            A/c Holder: <strong>{campaign.bankAccountHolder}</strong><br />
                            A/c No: <strong>{campaign.bankAccountNumber}</strong><br />
                            IFSC: <strong>{campaign.bankIfsc}</strong><br />
                            Bank: <strong>{campaign.bankName}</strong>
                            {campaign.bankBranch && <><br />Branch: <strong>{campaign.bankBranch}</strong></>}
                            {campaign.swiftCode && <><br />SWIFT: <strong>{campaign.swiftCode}</strong></>}
                            {campaign.micrCode && <><br />MICR: <strong>{campaign.micrCode}</strong></>}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Display allowed payment methods mock UI */}
                    {Boolean(campaign.paymentMethods) && Array.isArray(campaign.paymentMethods) && campaign.paymentMethods.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 font-poppins uppercase font-semibold mb-2">Supported Payment Methods</p>
                        <div className="flex flex-wrap gap-2">
                          {(campaign.paymentMethods as string[]).map(pm => (
                            <span key={pm} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded border">{pm}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sticky Donation card (Right 1 col) */}
                <div className="space-y-6">
                  <Card className="rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden sticky top-6">
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <span className="text-xs text-gray-500 uppercase font-semibold font-poppins">Fundraising Progress</span>
                        
                        {/* Interactive total raised click triggers breakdown */}
                        <div 
                          onClick={() => setShowBreakdown(!showBreakdown)}
                          className="flex items-baseline justify-between cursor-pointer hover:text-secondary group transition-colors"
                          title="Click to view breakdown"
                        >
                          <h4 className="text-3xl font-poppins font-bold text-primary group-hover:text-secondary">
                            ₹{campaign.totalRaised.toLocaleString()}
                          </h4>
                          <span className="text-xs text-secondary flex items-center gap-1">
                            {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            breakdown
                          </span>
                        </div>

                        {campaign.goalAmount && (
                          <div className="space-y-2 pt-1">
                            <div className="w-full bg-gray-100 rounded-full h-3">
                              <div 
                                className="bg-secondary h-3 rounded-full transition-all duration-500" 
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span><strong>{percent}%</strong> of goal ₹{Number(campaign.goalAmount).toLocaleString()}</span>
                              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {campaign.donorCount} donors</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Expandable Breakdown Details */}
                      {showBreakdown && (
                        <div className="border-t pt-4 space-y-3">
                          <h5 className="font-poppins font-bold text-sm text-primary flex items-center gap-1.5">
                            <Info className="w-4 h-4 text-secondary" /> Approved Donations Breakdown
                          </h5>
                          {campaign.donations.length === 0 ? (
                            <p className="text-xs text-gray-400 font-opensans italic">No approved donations yet. Be the first to donate!</p>
                          ) : (
                            <div className="max-h-[200px] overflow-y-auto space-y-2.5 pr-1">
                              {campaign.donations.map((d, index) => (
                                <div key={index} className="flex justify-between items-center text-xs border-b pb-1.5">
                                  <div>
                                    <p className="font-semibold text-primary">{d.name}</p>
                                    <p className="text-[10px] text-gray-400">{format(new Date(d.createdAt), 'dd MMM yyyy')}</p>
                                  </div>
                                  <strong className="text-secondary font-poppins font-bold">₹{Number(d.amount).toLocaleString()}</strong>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <Button 
                        onClick={() => setIsDonateModalOpen(true)}
                        disabled={campaign.status !== 'active'}
                        className="w-full bg-primary hover:bg-opacity-95 text-white font-poppins font-bold text-lg py-6 rounded-xl"
                      >
                        {campaign.status === 'active' ? 'Donate Now' : 'Campaign Closed'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {campaign && (
        <CampaignDonationModal
          isOpen={isDonateModalOpen}
          onClose={() => setIsDonateModalOpen(false)}
          campaign={campaign}
          cards={campaign.cards}
        />
      )}

      <Footer />
    </>
  );
}
