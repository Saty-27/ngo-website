import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Heart, Send, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function VolunteerSection() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    interestArea: '',
    availability: ''
  });

  const volunteerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("/api/volunteers", "POST", data);
    },
    onSuccess: () => {
      setIsOpen(false);
      setFormData({ name: '', phone: '', email: '', city: '', interestArea: '', availability: '' });
      toast({
        title: "Application Submitted!",
        description: "Thank you for offering your time. Our volunteer coordinator will contact you soon.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.interestArea) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    volunteerMutation.mutate(formData);
  };

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-primary to-purple-900 text-white">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <Heart className="w-16 h-16 mx-auto mb-6 text-orange-400 animate-pulse" />
        
        <h2 className="font-poppins font-bold text-3xl md:text-5xl mb-6">
          Give Your Time, Not Just Your Money
        </h2>
        
        <p className="font-opensans text-lg md:text-xl max-w-2xl mx-auto text-purple-100 mb-10 leading-relaxed">
          Join our dedicated community of volunteers. Whether it's cooking prasadam, organizing festivals, digital outreach, or community service, your skills can make a divine difference.
        </p>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 px-10 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              Become a Volunteer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white text-gray-900 max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader className="mb-4 text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-bold font-poppins text-primary">Join Our Volunteer Team</DialogTitle>
              <DialogDescription className="text-gray-500 font-opensans">
                Tell us a little about yourself and how you'd like to help.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" required placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" required placeholder="+91 98765 43210" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" required placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City/Location *</Label>
                  <Input id="city" required placeholder="Mumbai" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestArea">Area of Interest *</Label>
                <select 
                  id="interestArea"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.interestArea}
                  onChange={e => setFormData({...formData, interestArea: e.target.value})}
                >
                  <option value="" disabled>Select an area...</option>
                  <option value="cooking">Cooking / Kitchen Seva</option>
                  <option value="distribution">Prasadam Distribution</option>
                  <option value="events">Event & Festival Organization</option>
                  <option value="digital">Digital & Social Media</option>
                  <option value="teaching">Teaching / Mentoring</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Textarea 
                  id="availability" 
                  placeholder="e.g., Weekends, Every evening after 6 PM"
                  value={formData.availability}
                  onChange={e => setFormData({...formData, availability: e.target.value})}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 mt-4 rounded-xl"
                disabled={volunteerMutation.isPending}
              >
                {volunteerMutation.isPending ? "Submitting..." : (
                  <>Submit Application <Send className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
