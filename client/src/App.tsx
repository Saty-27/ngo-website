import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Campaigns from "@/pages/Campaigns";
import CampaignDetail from "@/pages/CampaignDetail";

import Donate from "@/pages/Donate";
import CategoryDonation from "@/pages/CategoryDonation";
import EventDonation from "@/pages/EventDonation";

import DonateThankYou from "@/pages/donate/ThankYou";
import PaymentGateway from "@/pages/donate/PaymentGateway";
import PaymentFailed from "@/pages/donate/PaymentFailed";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentFailure from "@/pages/PaymentFailure";
import Gallery from "@/pages/Gallery";
import Videos from "@/pages/Videos";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import AdminRoute from "@/components/auth/AdminRoute";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminBanners from "@/pages/admin/Banners";
import AdminCampaigns from "@/pages/admin/Campaigns";
import AdminCampaignManagement from "@/pages/admin/CampaignManagement";
import AdminGallery from "@/pages/admin/Gallery";
import AdminVideos from "@/pages/admin/Videos";
import AdminLiveVideos from "@/pages/admin/LiveVideos";
import AdminDonations from "@/pages/admin/Donations";
import AdminDonationCategories from "@/pages/admin/DonationCategories";
import AdminDonationStats from "@/pages/admin/DonationStats";
import AdminQuotes from "@/pages/admin/Quotes";
import AdminUsers from "@/pages/admin/Users";
import AdminMessages from "@/pages/admin/Messages";
import AdminTestimonials from "@/pages/admin/Testimonials";
import AdminSocialLinks from "@/pages/admin/SocialLinks";
import BlogManagement from "@/pages/admin/BlogManagement";
import ProcessSectionManagement from "@/pages/admin/ProcessSectionManagement";
import DonationsExport from "@/pages/admin/DonationsExport";
import FooterSettings from "@/pages/admin/FooterSettings";
import LogoSettings from "@/pages/admin/LogoSettings";
import PoliciesAdmin from "@/pages/admin/Policies";
import PoliciesPageSettings from "@/pages/admin/PoliciesPageSettings";
import PoliciesListPage from '@/pages/Policies';
import Sitemap from '@/pages/Sitemap';
import PolicyPage from "@/pages/Policy";

// New features
import AdminTimeline from "@/pages/admin/Timeline";
import AdminVolunteers from "@/pages/admin/Volunteers";
import AdminTransparency from "@/pages/admin/Transparency";
import AdminFAQ from "@/pages/admin/FAQ";
import AdminRecurringGiving from "@/pages/admin/RecurringGiving";
import AdminStats from "@/pages/admin/Stats";

function Router() {
  return (
    <Switch>
      {/* Main routes */}
      <Route path="/" component={Home} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/campaigns/:id" component={CampaignDetail} />

      <Route path="/donate" component={Donate} />
      <Route path="/donate/thank-you" component={DonateThankYou} />
      <Route path="/donate/payment-gateway" component={PaymentGateway} />
      <Route path="/donate/payment-failed" component={PaymentFailed} />
      <Route path="/donate/event/:eventId" component={EventDonation} />
      <Route path="/donate/category/:categoryId" component={CategoryDonation} />
      <Route path="/donate/:categoryId" component={CategoryDonation} />
      
      {/* Payment result pages */}
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/failure" component={PaymentFailure} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/videos" component={Videos} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/contact" component={Contact} />
      <Route path="/policies" component={PoliciesListPage} />
      <Route path="/policies/:slug" component={PolicyPage} />
      <Route path="/sitemap" component={Sitemap} />
      
      {/* Authentication routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/profile" component={Profile} />
      
      {/* Admin routes - protected with AdminRoute */}
      <Route path="/admin">
        {() => (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/banners">
        {() => (
          <AdminRoute>
            <AdminBanners />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/campaigns">
        {() => (
          <AdminRoute>
            <AdminCampaigns />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/campaigns/:id">
        {() => (
          <AdminRoute>
            <AdminCampaignManagement />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/timeline">
        {() => (
          <AdminRoute>
            <AdminTimeline />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/volunteers">
        {() => (
          <AdminRoute>
            <AdminVolunteers />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/transparency">
        {() => (
          <AdminRoute>
            <AdminTransparency />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/faqs">
        {() => (
          <AdminRoute>
            <AdminFAQ />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/recurring-giving">
        {() => (
          <AdminRoute>
            <AdminRecurringGiving />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/stats">
        {() => (
          <AdminRoute>
            <AdminStats />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/gallery">
        {() => (
          <AdminRoute>
            <AdminGallery />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/videos">
        {() => (
          <AdminRoute>
            <AdminVideos />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/live-videos">
        {() => (
          <AdminRoute>
            <AdminLiveVideos />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/donations">
        {() => (
          <AdminRoute>
            <AdminDonations />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/donation-categories">
        {() => (
          <AdminRoute>
            <AdminDonationCategories />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/donation-stats">
        {() => (
          <AdminRoute>
            <AdminDonationStats />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/donations-export">
        {() => (
          <AdminRoute>
            <DonationsExport />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/quotes">
        {() => (
          <AdminRoute>
            <AdminQuotes />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/users">
        {() => (
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/messages">
        {() => (
          <AdminRoute>
            <AdminMessages />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/testimonials">
        {() => (
          <AdminRoute>
            <AdminTestimonials />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/social-links">
        {() => (
          <AdminRoute>
            <AdminSocialLinks />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/blog">
        {() => (
          <AdminRoute>
            <BlogManagement />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/process-section">
        {() => (
          <AdminRoute>
            <ProcessSectionManagement />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/footer-settings">
        {() => (
          <AdminRoute>
            <FooterSettings />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/logo">
        {() => (
          <AdminRoute>
            <LogoSettings />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/policies">
        {() => (
          <AdminRoute>
            <PoliciesAdmin />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/policies-page">
        {() => (
          <AdminRoute>
            <PoliciesPageSettings />
          </AdminRoute>
        )}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ScrollToTop />
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;