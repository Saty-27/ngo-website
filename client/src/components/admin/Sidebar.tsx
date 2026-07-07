import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Images,
  Calendar,
  Film,
  Tv,
  DollarSign,
  Target,
  Quote,
  FileText,
  Users,
  Mail,
  MessageSquare,
  Share,
  Home,
  Menu,
  X,
  Sparkles,
  Download
} from "lucide-react";

const Sidebar = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard", tourId: "dashboard-nav" },
    { href: "/admin/banners", icon: Images, label: "Banners", tourId: "content-nav" },
    { href: "/admin/campaigns", icon: Calendar, label: "Campaigns", tourId: "campaigns-nav" },
    { href: "/admin/gallery", icon: Images, label: "Gallery", tourId: "content-nav" },
    { href: "/admin/videos", icon: Film, label: "Videos", tourId: "content-nav" },
    { href: "/admin/live-videos", icon: Tv, label: "Live Videos", tourId: "content-nav" },
    { href: "/admin/process-section", icon: Sparkles, label: "Process Section", tourId: "content-nav" },
    { href: "/admin/donations", icon: DollarSign, label: "Donations", tourId: "donations-nav" },
    { href: "/admin/donations-export", icon: Download, label: "Export Donations", tourId: "donations-nav" },
    { href: "/admin/donation-categories", icon: Target, label: "Donation Categories", tourId: "categories-nav" },
    { href: "/admin/quotes", icon: Quote, label: "Quotes", tourId: "content-nav" },
    { href: "/admin/blog", icon: FileText, label: "Blog Management", tourId: "content-nav" },
    { href: "/admin/users", icon: Users, label: "Users", tourId: "users-nav" },
    { href: "/admin/messages", icon: Mail, label: "Messages", tourId: "content-nav" },
    { href: "/admin/testimonials", icon: MessageSquare, label: "Testimonials", tourId: "content-nav" },
    { href: "/admin/social-links", icon: Share, label: "Social Links", tourId: "content-nav" },
    { href: "/admin/footer-settings", icon: Share, label: "Footer Settings", tourId: "content-nav" },
    { href: "/admin/logo", icon: Images, label: "Website Logo", tourId: "content-nav" },
    { href: "/admin/policies", icon: FileText, label: "Policies", tourId: "content-nav" },
    { href: "/admin/policies-page", icon: FileText, label: "Policies Page", tourId: "content-nav" },
    { href: "/admin/stats", icon: Target, label: "Homepage Counters", tourId: "content-nav" },
    { href: "/admin/timeline", icon: Calendar, label: "Timeline Milestones", tourId: "content-nav" },
    { href: "/admin/volunteers", icon: Users, label: "Volunteers", tourId: "users-nav" },
    { href: "/admin/transparency", icon: FileText, label: "Transparency", tourId: "content-nav" },
    { href: "/admin/faqs", icon: MessageSquare, label: "FAQs", tourId: "content-nav" },
    { href: "/admin/recurring-giving", icon: DollarSign, label: "Recurring Giving", tourId: "content-nav" },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <h1 className="text-gray-900 font-bold text-xl">NGO Admin</h1>
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static md:translate-x-0 transition-transform left-0 top-16 md:top-0 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto md:h-screen md:sticky md:top-0 ${
          isMobileMenuOpen ? "translate-x-0 z-40" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <Link href="/" className="hidden md:flex items-center gap-2 mb-8">
            <Home className="w-6 h-6 text-purple-600" />
            <span className="font-bold text-lg">NGO Admin</span>
          </Link>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-purple-100 text-purple-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
