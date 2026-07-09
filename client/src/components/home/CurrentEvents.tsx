import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { Campaign } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

const CurrentCampaigns = () => {
  const [, setLocation] = useLocation();
  const [expandedCampaign, setExpandedCampaign] = useState<number | null>(null);
  
  const { data: campaigns = [], isLoading } = useQuery<(Campaign & { totalRaised: number; donorCount: number })[]>({
    queryKey: ['/api/campaigns'],
  });

  const toggleExpanded = (campaignId: number) => {
    setExpandedCampaign(expandedCampaign === campaignId ? null : campaignId);
  };
  
  if (isLoading) {
    return (
      <section className="current-events-section">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-2/3 mx-auto mb-4" />
            <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (campaigns.length === 0) {
    return null;
  }
  
  return (
    <section className="current-events-section bg-neutral-50 py-16 border-t">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-primary mb-4">Current Campaigns</h2>
          <div className="title-underline mx-auto bg-secondary w-20 h-1 mb-4 rounded"></div>
          <p className="current-events-subtitle text-gray-600 font-opensans max-w-2xl mx-auto">
            Participate in our active fundraising drives and contribute directly to community service.
          </p>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {campaigns
            .slice(0, 3)
            .map((campaign) => {
              const percent = campaign.goalAmount 
                ? Math.min(Math.round((campaign.totalRaised / Number(campaign.goalAmount)) * 100), 100)
                : 0;

              return (
                <div key={campaign.id} className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col justify-between p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  {/* Campaign Image */}
                  {campaign.coverImage && (
                    <div className="h-48 w-full overflow-hidden rounded-xl mb-4 bg-gray-50 group">
                      <img 
                        src={campaign.coverImage} 
                        alt={campaign.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}

                  {/* Campaign Content */}
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-poppins font-bold text-primary mb-2">{campaign.title}</h3>
                      
                      {/* Campaign Description */}
                      <div className="text-sm font-opensans text-gray-500 mb-4 line-clamp-3">
                        <p>{campaign.description || "No description provided."}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {campaign.goalAmount && (
                      <div className="space-y-2 mb-6">
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
                        <p className="text-xs text-gray-500 pt-1">
                          Raised: <strong>₹{campaign.totalRaised.toLocaleString()}</strong>
                        </p>
                      </div>
                    )}

                    {/* Action Button */}
                    <button 
                      className="w-full py-3 bg-primary hover:bg-opacity-95 text-white font-poppins font-semibold rounded-xl transition-all"
                      onClick={() => setLocation(`/campaigns/${campaign.id}`)}
                    >
                      View & Donate
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* View All Campaigns Button */}
        {campaigns.length > 2 && (
          <div className="text-center mt-12">
            <Link 
              href="/campaigns"
              className="inline-block bg-secondary text-white font-poppins font-semibold py-3 px-8 rounded-xl hover:bg-opacity-90 transition-colors"
            >
              View All Campaigns
            </Link>
          </div>
        )}


      </div>
    </section>
  );
};

export default CurrentCampaigns;
