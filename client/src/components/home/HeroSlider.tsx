import { useState, useEffect, useMemo } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Banner } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import iskconDeitiesImg from "@assets/Website FFC_20250531_190536_0000_1749327853462.png";

// Preload next slide image for smooth transitions
const useImagePreload = (url: string | undefined) => {
  useEffect(() => {
    if (!url) return;
    const img = new Image();
    img.src = url;
  }, [url]);
};

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const { data: banners = [], isLoading, error } = useQuery<Banner[]>({
    queryKey: ['/api/banners'],
  });

  // Detect screen size for mobile vs desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is standard mobile breakpoint
    };
    
    // Check on mount
    checkMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Debug logging
  console.log('Banners:', banners, 'Length:', banners.length, 'Loading:', isLoading, 'Error:', error);
  console.log('Current slide:', currentSlide);
  
  // Preload next image for smooth transitions
  const nextSlideIndex = (currentSlide + 1) % banners.length;
  const nextImageUrl = banners[nextSlideIndex]?.imageUrl;
  useImagePreload(nextImageUrl);

  // Auto-advance slides
  useEffect(() => {
    if (banners.length <= 1) return; // Only auto-advance if there are multiple banners
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [banners.length]);
  
  // Reset current slide when banners change
  useEffect(() => {
    setCurrentSlide(0);
  }, [banners]);
  
  if (isLoading) {
    return (
      <section className="relative overflow-hidden h-[70vh] sm:h-[80vh] md:h-screen">
        <Skeleton className="w-full h-full" />
      </section>
    );
  }
  
  // Show fallback only if no banners exist and not loading
  if (banners.length === 0 && !isLoading) {
    return (
      <section className="relative overflow-hidden h-[70vh] sm:h-[80vh] md:h-screen">
        <div className="h-full w-full absolute inset-0">
          <img 
            src={iskconDeitiesImg} 
            alt="Sri Sri Radha Rasabihari" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-20 flex items-end justify-center pb-8 sm:pb-12 md:pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-black bg-opacity-40 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur-sm max-w-full">
              <h1 className="hero-heading text-4xl md:text-6xl lg:text-7xl font-bold font-poppins text-white mb-6 tracking-tight leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)]">
                Welcome to Gauranitai Foundation
              </h1>
              <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 sm:mb-6 md:mb-8 lg:mb-10 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto leading-relaxed drop-shadow-lg">
                Experience divine bliss at the spiritual heart of Mumbai
              </p>
              <div className="flex justify-center gap-3 sm:gap-4">
                <Link href="/donate" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 sm:px-6 sm:py-2 md:px-8 md:py-3 lg:px-10 lg:py-4 rounded-full 
                    inline-block transition-all transform hover:-translate-y-1 text-xs sm:text-sm md:text-base lg:text-lg shadow-lg">
                  Donate Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="relative overflow-hidden h-[70vh] sm:h-[80vh] md:h-screen">
      {banners.length > 0 && banners[currentSlide] && (
        <div className="h-full w-full absolute inset-0">
          <img 
            src={isMobile && banners[currentSlide].mobileImageUrl ? banners[currentSlide].mobileImageUrl : banners[currentSlide].imageUrl} 
            alt={banners[currentSlide].title} 
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            onError={(e) => {
              console.error('Image failed to load:', isMobile && banners[currentSlide].mobileImageUrl ? banners[currentSlide].mobileImageUrl : banners[currentSlide].imageUrl);
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', isMobile && banners[currentSlide].mobileImageUrl ? banners[currentSlide].mobileImageUrl : banners[currentSlide].imageUrl);
            }}
          />
          <div className="absolute inset-0 flex items-end justify-center pb-8 sm:pb-12 md:pb-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="p-4 sm:p-6 md:p-8 lg:p-12 max-w-full">
                <h2 className="text-white font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-3 sm:mb-4 md:mb-6 lg:mb-8 leading-tight drop-shadow-lg break-words">
                  {banners[currentSlide].title}
                </h2>
                {banners[currentSlide].description && (
                  <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 sm:mb-6 md:mb-8 lg:mb-10 max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl mx-auto leading-relaxed drop-shadow-lg break-words">
                    {banners[currentSlide].description}
                  </p>
                )}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                  {banners[currentSlide].buttonText && banners[currentSlide].buttonLink && (
                    <Link href={banners[currentSlide].buttonLink} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 sm:px-6 sm:py-2 md:px-8 md:py-3 lg:px-10 lg:py-4 rounded-full 
                        inline-block transition-all transform hover:-translate-y-1 text-xs sm:text-sm md:text-base lg:text-lg shadow-lg">
                      {banners[currentSlide].buttonText}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slider Navigation */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-0 right-0 z-30 flex justify-center space-x-2 sm:space-x-3">
          {banners.map((_, index) => (
            <button 
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-orange-500' 
                  : 'bg-white bg-opacity-60 hover:bg-opacity-80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSlider;