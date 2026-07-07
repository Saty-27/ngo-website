import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Campaign, DonationAmountCard } from '@shared/schema';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Users, Target, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import CampaignDonationModal from '@/components/donate/CampaignDonationModal';

export default function Campaigns() {
  const [, setLocation] = useLocation();
  const [selectedCampaign, setSelectedCampaign] = useState<(Campaign & { totalRaised?: number; donorCount?: number }) | null>(null);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);

  const { data: campaigns = [], isLoading } = useQuery<(Campaign & { totalRaised: number; donorCount: number })[]>({
    queryKey: ['/api/campaigns'],
  });

  // Query to fetch amount cards for the selected campaign when needed
  const { data: cards = [] } = useQuery<DonationAmountCard[]>({
    queryKey: [`/api/campaigns/${selectedCampaign?.id}/cards`],
    enabled: !!selectedCampaign,
  });

  const handleOpenDonateModal = (campaign: Campaign & { totalRaised?: number; donorCount?: number }) => {
    setSelectedCampaign(campaign);
    setIsDonateModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Campaigns - NGO Admin</title>
        <meta name="description" content="Support our ongoing campaigns and fundraising drives. Your contributions make direct differences in community welfare and food distribution." />
      </Helmet>

      <Header />

      <main className="bg-neutral-50 min-h-screen">
        {/* Hero Section */}
        <section className="relative py-20 bg-primary">
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-white font-poppins font-bold text-4xl md:text-5xl mb-4">
              Current Campaigns & Fundraising
            </h1>
            <p className="text-white font-opensans text-lg md:text-xl max-w-3xl mx-auto">
              Contribute to our active campaigns. Your generosity helps us spread message, support education, feed children, and build community structures.
            </p>
          </div>
        </section>

        {/* Campaigns list */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="font-poppins font-bold text-3xl md:text-4xl text-primary mb-4">
                Active Fundraising Campaigns
              </h2>
              <p className="font-opensans text-lg max-w-2xl mx-auto text-dark">
                Explore our active drives below. Click a campaign to see details and make a secure manual donation with transaction proof submission.
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 flex flex-col p-6 space-y-4">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-250/50 max-w-md mx-auto">
                <h3 className="font-poppins font-semibold text-xl text-primary mb-2">No Active Campaigns</h3>
                <p className="font-opensans text-gray-500 mb-6">
                  There are no active fundraising campaigns right now. Please check back later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {campaigns.map((campaign) => {
                  const percent = campaign.goalAmount 
                    ? Math.min(Math.round((campaign.totalRaised / Number(campaign.goalAmount)) * 100), 100)
                    : 0;

                  return (
                    <div 
                      key={campaign.id} 
                      className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow flex flex-col h-full"
                    >
                      {/* Image cover */}
                      <div className="h-48 w-full relative bg-gray-100">
                        {campaign.coverImage ? (
                          <img 
                            src={campaign.coverImage} 
                            alt={campaign.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                            <Target className="w-12 h-12 text-primary" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="font-poppins font-bold text-xl text-primary mb-2 line-clamp-1">
                          {campaign.title}
                        </h3>
                        <p className="font-opensans text-sm text-gray-500 mb-4 line-clamp-3">
                          {campaign.description || "No description provided."}
                        </p>

                        {/* Progress */}
                        {campaign.goalAmount && (
                          <div className="space-y-2 mt-auto mb-6">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-secondary font-poppins">{percent}% Raised</span>
                              <span className="text-primary font-poppins">Goal: ₹{Number(campaign.goalAmount).toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div 
                                className="bg-secondary h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 font-opensans pt-1">
                              <span>Raised: <strong>₹{campaign.totalRaised.toLocaleString()}</strong></span>
                              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {campaign.donorCount} donors</span>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3 mt-auto">
                          <Button 
                            variant="outline" 
                            onClick={() => setLocation(`/campaigns/${campaign.id}`)}
                            className="font-poppins font-semibold border-primary text-primary hover:bg-neutral"
                          >
                            Details
                          </Button>
                          <Button 
                            onClick={() => handleOpenDonateModal(campaign)}
                            className="bg-primary hover:bg-opacity-95 text-white font-poppins font-semibold"
                          >
                            Donate Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {selectedCampaign && (
        <CampaignDonationModal
          isOpen={isDonateModalOpen}
          onClose={() => {
            setIsDonateModalOpen(false);
            setSelectedCampaign(null);
          }}
          campaign={selectedCampaign}
          cards={cards}
        />
      )}

      <Footer />
    </>
  );
}
