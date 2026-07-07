// Image optimization utility for lazy loading and responsive images

export const getOptimizedImageUrl = (url: string, size: 'small' | 'medium' | 'large' = 'medium'): string => {
  if (!url) return '';
  
  // For local uploads, add quality parameter
  if (url.startsWith('/uploads/')) {
    // Size recommendations: small=300px, medium=800px, large=1200px
    const sizes: Record<string, string> = {
      small: '300',
      medium: '800',
      large: '1200',
    };
    return url; // In production, use image CDN with size parameters
  }
  
  return url;
};

export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

export const generateSrcSet = (baseUrl: string): string => {
  if (!baseUrl) return '';
  return baseUrl; // Ready for CDN integration
};
