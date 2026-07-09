import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Users, Heart, Target, Briefcase, Workflow, HandHeart, CreditCard, Building, LogIn, Megaphone, Award, TrendingUp, UserCircle, Handshake, Mail, CheckCircle2, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define type for About Section
interface AboutSection {
  id: number;
  sectionNumber: number;
  title: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  isActive: boolean;
}

export default function About() {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<AboutSection | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", query: "" });
  const { toast } = useToast();

  // Fetch about sections
  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch("/api/about-sections");
        if (response.ok) {
          const data = await response.json();
          setSections(data);
        } else {
          // Fallback to static data if API fails
          setSections([
            { id: 1, sectionNumber: 1, title: "Who We Are", description: "We are a dedicated platform committed to connecting donors with non-profit organizations (NGOs) working towards social causes.", isActive: true, imageUrl: "https://images.unsplash.com/photo-1582780350081-c08e8edb9263?w=800&h=350&fit=crop" },
            { id: 2, sectionNumber: 2, title: "Our Mission", description: "To empower NGOs and create a world where every individual can contribute meaningfully to causes they care about.", isActive: true, imageUrl: "https://images.unsplash.com/photo-1605540436562-66f3f0889565?w=800&h=350&fit=crop" },
            { id: 3, sectionNumber: 3, title: "Our Vision", description: "We envision a society where generosity thrives, NGOs are empowered, and every donation makes a measurable difference.", isActive: true, imageUrl: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&h=350&fit=crop" }
          ]);
        }
      } catch (error) {
        console.error("Error fetching about sections:", error);
        // Fallback to static data on error
        setSections([
          { id: 1, sectionNumber: 1, title: "Who We Are", description: "We are a dedicated platform committed to connecting donors with non-profit organizations (NGOs) working towards social causes.", isActive: true, imageUrl: "https://images.unsplash.com/photo-1582780350081-c08e8edb9263?w=800&h=350&fit=crop" },
          { id: 2, sectionNumber: 2, title: "Our Mission", description: "To empower NGOs and create a world where every individual can contribute meaningfully to causes they care about.", isActive: true, imageUrl: "https://images.unsplash.com/photo-1605540436562-66f3f0889565?w=800&h=350&fit=crop" },
          { id: 3, sectionNumber: 3, title: "Our Vision", description: "We envision a society where generosity thrives, NGOs are empowered, and every donation makes a measurable difference.", isActive: true, imageUrl: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&h=350&fit=crop" }
        ]);
      }
    };
    fetchSections();
  }, []);

  // Mutation for sending contact message
  const sendMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/contact", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Message sent successfully!", description: "We'll get back to you soon." });
      setFormData({ name: "", email: "", phone: "", query: "" });
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast({ title: "Failed to send message", description: "Please try again later.", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessageMutation.mutate({ ...formData, aboutSectionId: selectedSection?.id });
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#1A1A2E] to-[#2A2A4E] text-white py-24">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 font-poppins">
              About <span className="text-[#FF9933]">Us</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-opensans">
              Building bridges between generosity and impact
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {sections.sort((a, b) => a.sectionNumber - b.sectionNumber).map((section) => (
                <section
                  key={section.id}
                  className="group relative bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={section.imageUrl || "https://images.unsplash.com/photo-1582780350081-c08e8edb9263?w=800&h=350&fit=crop"}
                      alt={section.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-gray-100 rounded-xl p-3 shadow-inner">
                        <CheckCircle2 className="w-10 h-10 text-[#FF9933]" />
                      </div>
                      <h2 className="text-2xl font-bold font-poppins text-gray-900">
                        <span className="text-[#FF9933]">{section.sectionNumber}.</span> {section.title}
                      </h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed font-opensans">
                      {section.description}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedSection(section);
                        setIsModalOpen(true);
                      }}
                      className="mt-6 flex items-center text-[#FF9933] font-medium hover:underline"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      <span>Learn More</span>
                    </button>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-[#FF9933] to-orange-600 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-poppins">
              Ready to Make a Difference?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/donate"
                className="bg-white text-gray-900 px-8 py-4 rounded-full font-poppins font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Donate Now
              </a>
              <a
                href="/ngo/register"
                className="border-2 border-white text-white px-8 py-4 rounded-full font-poppins font-semibold text-lg hover:bg-white hover:text-gray-900 transition-colors"
              >
                Register Your NGO
              </a>
            </div>
          </div>
        </section>

        {/* Learn More Modal */}
        {isModalOpen && selectedSection && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-bold font-poppins">Learn More About {selectedSection.title}</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] focus:outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] focus:outline-none"
                    placeholder="Your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Query</label>
                  <textarea
                    rows={4}
                    value={formData.query}
                    onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF9933] focus:outline-none"
                    placeholder="What would you like to know?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sendMessageMutation.isPending}
                  className="w-full bg-[#FF9933] text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
