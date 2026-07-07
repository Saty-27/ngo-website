import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

export default function Timeline() {
  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['/api/timeline'],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-48 mx-auto mb-12" />
          <div className="space-y-8">
            <Skeleton className="h-24 w-full max-w-3xl mx-auto" />
            <Skeleton className="h-24 w-full max-w-3xl mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  if (milestones.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-50 mix-blend-overlay"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-primary mb-4">
            Our Journey & Impact
          </h2>
          <p className="font-opensans text-lg max-w-2xl mx-auto text-gray-600">
            A track record of service, devotion, and community building spanning decades.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative border-l-4 border-orange-400/30 ml-3 md:mx-auto md:border-l-0">
            {/* Center line for desktop */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full border-l-4 border-orange-400/30"></div>
            
            {milestones.map((milestone: any, index: number) => (
              <div key={milestone.id} className={`mb-12 relative flex flex-col md:flex-row items-center justify-between ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                {/* Center dot */}
                <div className="absolute left-[-1.1rem] md:left-1/2 transform md:-translate-x-1/2 w-8 h-8 rounded-full bg-white border-4 border-primary z-10 flex items-center justify-center shadow-md">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                </div>

                <div className="order-1 w-full md:w-5/12"></div>
                
                <div className="order-1 w-full md:w-5/12 px-6 py-6 text-left relative">
                  <div className={`bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 relative border border-gray-100`}>
                    {/* Connecting triangle */}
                    <div className={`hidden md:block absolute top-6 w-0 h-0 border-y-8 border-y-transparent ${index % 2 === 0 ? 'right-[-16px] border-l-[16px] border-l-white' : 'left-[-16px] border-r-[16px] border-r-white'}`}></div>
                    
                    <span className="text-orange-500 font-bold text-xl mb-1 block font-poppins">{milestone.yearOrDate}</span>
                    <h3 className="font-bold text-2xl text-primary mb-3 font-poppins">{milestone.title}</h3>
                    <p className="text-gray-600 font-opensans leading-relaxed">{milestone.description}</p>
                    
                    {milestone.imageUrl && (
                      <img src={milestone.imageUrl} alt={milestone.title} className="mt-4 rounded-xl w-full h-48 object-cover shadow-sm" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
