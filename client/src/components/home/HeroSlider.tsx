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
      <section className="relative overflow-hidden w-full">
        <Skeleton className="w-full" style={{ aspectRatio: isMobile ? '9/16' : '16/9' }} />
      </section>
    );
  }
  
  // Show fallback only if no banners exist and not loading
  if (banners.length === 0 && !isLoading) {
    return (
      <section className="relative overflow-hidden w-full">
        <img 
          src={iskconDeitiesImg} 
          alt="Sri Sri Radha Rasabihari" 
          className="w-full block"
        />
      </section>
    );
  }
  
  return (
    <section className="relative overflow-hidden w-full">
      {banners.length > 0 && banners[currentSlide] && (
        <a
          href="https://ngosite.shop/donate"
          className="w-full block cursor-pointer relative"
          aria-label="Donate Now"
        >
          <img 
            src={isMobile && banners[currentSlide].mobileImageUrl ? banners[currentSlide].mobileImageUrl : banners[currentSlide].imageUrl} 
            alt={banners[currentSlide].title} 
            className="w-full block"
            loading="eager"
            decoding="async"
            onError={(e) => {
              console.error('Image failed to load:', isMobile && banners[currentSlide].mobileImageUrl ? banners[currentSlide].mobileImageUrl : banners[currentSlide].imageUrl);
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', isMobile && banners[currentSlide].mobileImageUrl ? banners[currentSlide].mobileImageUrl : banners[currentSlide].imageUrl);
            }}
          />
          {/* Text overlay */}
          <div className="absolute inset-0 flex items-end justify-center pb-8 sm:pb-12 md:pb-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="p-4 sm:p-6 md:p-8 max-w-full">
                <h2 className="text-white font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl mb-3 sm:mb-4 md:mb-6 leading-tight drop-shadow-lg break-words">
                  {banners[currentSlide].title}
                </h2>
                {banners[currentSlide].description && (
                  <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 max-w-xs sm:max-w-md md:max-w-2xl mx-auto leading-relaxed drop-shadow-lg break-words">
                    {banners[currentSlide].description}
                  </p>
                )}
                {banners[currentSlide].buttonText && banners[currentSlide].buttonLink && (
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                    <span className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 sm:px-6 sm:py-2 md:px-8 md:py-3 rounded-full inline-block transition-all transform hover:-translate-y-1 text-xs sm:text-sm md:text-base shadow-lg">
                      {banners[currentSlide].buttonText}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </a>
      )}

      {/* Slider Navigation */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-30 flex justify-center space-x-2 sm:space-x-3">
          {banners.map((_, index) => (
            <button 
              key={index}
              onClick={(e) => { e.preventDefault(); setCurrentSlide(index); }}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
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