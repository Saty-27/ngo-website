import { useState } from 'react';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { SocialLink, type Policy } from '@shared/schema';
import { MapPin, Phone, Mail, Clock } from "lucide-react";

interface FooterSettings {
  id?: number;
  address: string;
  phone: string;
  email: string;
  templeHours: string;
  templeHoursSpecial: string;
}

const Footer = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  
  const { data: socialLinks = [] } = useQuery<SocialLink[]>({
    queryKey: ['/api/social-links'],
  });

  const { data: policies = [] } = useQuery<Policy[]>({
    queryKey: ['/api/policies'],
  });

  const { data: footerSettings } = useQuery<FooterSettings>({
    queryKey: ['/api/footer-settings'],
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await apiRequest('/api/subscribe', 'POST', { email });
      toast({
        title: "Subscription Successful",
        description: "Thank you for subscribing to our newsletter!",
      });
      setEmail('');
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: "There was an error subscribing to the newsletter. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <footer className="relative pt-16 pb-8" style={{ backgroundColor: '#1A1A2E' }}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="font-poppins font-bold text-2xl mb-4 text-white">
              NGO <span className="text-[#FF9933]">Website</span>
            </h3>
            <p className="font-opensans mb-6 text-[#C9C2E8]">
              Dedicated to serving the community with compassion, spreading awareness, and empowering lives through charitable initiatives and social programs.
            </p>
            <div className="flex space-x-4">
              {socialLinks.filter(link => link.isActive).map((link) => (
                <a 
                  key={link.id}
                  href={link.url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: '#2A2A4E', color: '#FF9933' }}
                >
                  {link.icon && link.icon.startsWith('/uploads/') ? (
                    <img 
                      src={link.icon} 
                      alt={`${link.platform} icon`} 
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <i className={`${link.icon || 'ri-link'} text-lg`}></i>
                  )}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-poppins font-semibold text-xl mb-4 text-white">Quick links</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="font-opensans text-[#C9C2E8] hover:text-[#FF9933] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/donate" className="font-opensans text-[#C9C2E8] hover:text-[#FF9933] transition-colors">
                  Donate
                </Link>
              </li>
              <li>
                <Link href="/campaigns" className="font-opensans text-[#C9C2E8] hover:text-[#FF9933] transition-colors">
                  Campaigns
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="font-opensans text-[#C9C2E8] hover:text-[#FF9933] transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="font-opensans text-[#C9C2E8] hover:text-[#FF9933] transition-colors">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-poppins font-semibold text-xl mb-4 text-white">Contact us</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-[#FF9933] mr-3 mt-1 flex-shrink-0" />
                <span className="font-opensans text-[#C9C2E8] text-sm">
                  {footerSettings?.address || "123 NGO Street, Charity Nagar, Mumbai - 400001"}
                </span>
              </li>
              <li className="flex items-start">
                <Phone className="w-5 h-5 text-[#FF9933] mr-3 mt-0.5 flex-shrink-0" />
                <span className="font-opensans text-[#C9C2E8] text-sm">
                  {footerSettings?.phone || "+91 98765 43210"}
                </span>
              </li>
              <li className="flex items-start">
                <Mail className="w-5 h-5 text-[#FF9933] mr-3 mt-0.5 flex-shrink-0" />
                <span className="font-opensans text-[#C9C2E8] text-sm break-all">
                  {footerSettings?.email || "info@ngowebsite.org"}
                </span>
              </li>
              <li className="flex items-start">
                <Clock className="w-5 h-5 text-[#FF9933] mr-3 mt-1 flex-shrink-0" />
                <span className="font-opensans text-[#C9C2E8] text-sm">
                  {footerSettings?.templeHours || "Daily: 4:30 AM - 9:00 PM"}
                </span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-poppins font-semibold text-xl mb-4 text-white">Newsletter</h4>
            <p className="text-[#C9C2E8] font-opensans mb-4">
              Subscribe for updates on campaigns, festivals, and spiritual insights.
            </p>
            <form className="space-y-3" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address" 
                className="w-full px-4 py-3 rounded-md bg-[#2A2A4E] border border-[#3A3A5E]
                focus:outline-none focus:ring-1 focus:ring-[#FF9933] focus:border-[#FF9933] 
                text-white placeholder-[#C9C2E8] transition-colors" 
                required 
              />
              <button 
                type="submit" 
                className="w-full text-gray-900 font-poppins font-medium py-3 rounded-md 
                hover:opacity-90 transition-opacity bg-[#FF9933]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-white border-opacity-10 pt-8 flex flex-col md:flex-row justify-center items-center text-center flex-wrap gap-y-2">
          <p className="font-opensans text-sm text-[#C9C2E8] md:mr-2">&copy; {new Date().getFullYear()} NGO Website. All rights reserved.</p>
          
          <span className="hidden md:inline text-[#C9C2E8] mx-2">&middot;</span>
          <Link href="/policies/privacy-policy" className="font-opensans text-sm text-[#C9C2E8] hover:text-[#FF9933] transition-colors">
            Privacy Policy
          </Link>
          
          <span className="hidden md:inline text-[#C9C2E8] mx-2">&middot;</span>
          <Link href="/policies/terms-and-conditions" className="font-opensans text-sm text-[#C9C2E8] hover:text-[#FF9933] transition-colors">
            Terms & Conditions
          </Link>
          
          <span className="hidden md:inline text-[#C9C2E8] mx-2">&middot;</span>
          <Link href="/sitemap" className="font-opensans text-sm text-[#C9C2E8] hover:text-[#FF9933] transition-colors">
            Sitemap
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
