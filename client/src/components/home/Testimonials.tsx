import { useQuery } from '@tanstack/react-query';
import { Testimonial } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Quote, Star } from 'lucide-react';

const Testimonials = () => {
  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
  });
  
  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-2/3 mx-auto mb-4" />
            <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative bg-neutral p-8 rounded-2xl shadow-md max-w-md w-full">
                <div className="flex items-center mb-4">
                  <Skeleton className="w-14 h-14 rounded-full mr-4" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (testimonials.length === 0) {
    return null;
  }
  
  return (
    <section className="py-20 relative overflow-hidden bg-gray-50/50">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-200/30 blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-orange-200/20 blur-3xl translate-x-1/3 -translate-y-1/2"></div>
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-purple-200/20 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-primary mb-4">
            Devotee Experiences
          </h2>
          <p className="font-opensans text-lg max-w-2xl mx-auto text-dark">
            Hear from those whose lives have been transformed through their connection with Gauranitai Foundation.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="relative bg-white p-8 rounded-2xl shadow-lg border border-gray-50 max-w-md w-full hover:shadow-xl transition-shadow overflow-hidden group">
              <Quote className="absolute -bottom-6 -right-6 w-40 h-40 text-purple-50 opacity-50 rotate-12 transform group-hover:scale-110 transition-transform duration-500" strokeWidth={1} />
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4 border-2 border-primary/10 p-0.5">
                  <img 
                    src={testimonial.imageUrl || "https://via.placeholder.com/100?text=N/A"} 
                    alt={testimonial.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-poppins font-semibold text-primary">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600 mb-1">{testimonial.location}</p>
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < (testimonial.rating ?? 5) ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                </div>
                <p className="font-opensans text-gray-700 italic leading-relaxed text-lg relative">
                  "{testimonial.message}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
