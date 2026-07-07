import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { HeartHandshake } from 'lucide-react';
import { Link } from 'wouter';

export default function RecurringGiving() {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/recurring-giving'],
  });

  if (isLoading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Skeleton className="h-[400px] w-full rounded-3xl" />
        </div>
      </section>
    );
  }

  if (!settings) return null;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl overflow-hidden bg-purple-900 text-white shadow-2xl">
          {/* Background Image / Overlay */}
          <div className="absolute inset-0">
            {settings.backgroundImageUrl ? (
              <>
                <img 
                  src={settings.backgroundImageUrl} 
                  alt="Recurring Giving" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-purple-900/80 mix-blend-multiply"></div>
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-900"></div>
            )}
            
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-orange-500/20 blur-3xl"></div>
          </div>

          <div className="relative z-10 px-6 py-16 md:py-20 md:px-16 flex flex-col md:flex-row items-center justify-between gap-12">
            
            <div className="w-full md:w-1/2 text-center md:text-left">
              <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm border border-white/20">
                <HeartHandshake className="w-8 h-8 text-orange-400" />
              </div>
              <h2 className="font-poppins font-bold text-3xl md:text-5xl mb-4 leading-tight">
                {settings.headline || "Become a Monthly Sponsor"}
              </h2>
              <p className="font-opensans text-lg md:text-xl text-purple-100 mb-8 max-w-xl leading-relaxed">
                {settings.description || "Consistent support allows us to plan ahead and reach more people. Join our community of monthly givers."}
              </p>
            </div>

            <div className="w-full md:w-1/2 max-w-md">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-xl">
                <h3 className="text-xl font-bold font-poppins mb-6 text-center">Choose your monthly impact</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {(settings.presetAmounts || [500, 1000, 2500, 5000]).map((amount: number) => (
                    <Link key={amount} href={`/donate?frequency=monthly&amount=${amount}`}>
                      <a className="flex items-center justify-center py-4 rounded-xl border-2 border-white/30 hover:border-orange-400 hover:bg-orange-400/10 transition-colors text-xl font-bold text-white bg-white/5">
                        ₹{amount}
                      </a>
                    </Link>
                  ))}
                </div>
                
                <Link href="/donate?frequency=monthly">
                  <a className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                    {settings.ctaText || "Give Monthly"}
                  </a>
                </Link>
                
                <p className="text-center text-sm text-purple-200 mt-4 font-opensans">
                  You can pause or cancel at any time.
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
