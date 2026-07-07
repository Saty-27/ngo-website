import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSlider from '@/components/home/HeroSlider';
import StatsSection from '@/components/home/StatsSection';
import QuoteRotator from '@/components/home/QuoteRotator';
import DonationCategories from '@/components/home/DonationCategories';
import ProcessSection from '@/components/home/ProcessSection';
import CurrentEvents from '@/components/home/CurrentEvents';
import MediaHighlights from '@/components/home/MediaHighlights';
import Testimonials from '@/components/home/Testimonials';
import RecentBlogs from '@/components/home/RecentBlogs';
import ContactSection from '@/components/home/ContactSection';
import WatchLiveButton from '@/components/WatchLiveButton';
import Timeline from '@/components/home/Timeline';
import VolunteerSection from '@/components/home/VolunteerSection';
import Transparency from '@/components/home/Transparency';
import FAQ from '@/components/home/FAQ';
import RecurringGiving from '@/components/home/RecurringGiving';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Gauranitai Foundation - Food & Welfare NGO</title>
        <meta name="description" content="Empowering lives and spreading smiles. Join Gauranitai Foundation in our mission to feed children, support local communities, and deliver welfare services." />
        <meta property="og:title" content="Gauranitai Foundation - Food & Welfare NGO" />
        <meta property="og:description" content="Empowering lives and spreading smiles. Join Gauranitai Foundation in our mission to feed children, support local communities, and deliver welfare services." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://pixabay.com/get/g278ecce0ba61756c6b63480792d9ebbc528c6c2ca124b41aafeaaddb98ac5ee67ef5eb602cd0eb0b27645e6f00c4c672947df6b165a52a9b8c3a5795ffb5ad85_1280.jpg" />
      </Helmet>
      
      <Header />
      
      <main>
        <HeroSlider />
        <section className="temple-info-section">
          <StatsSection />
        </section>
        <QuoteRotator />
        <CurrentEvents />
        <ProcessSection />
        <Timeline />
        <DonationCategories />
        <RecurringGiving />
        <VolunteerSection />
        <MediaHighlights />
        <RecentBlogs />
        <Testimonials />
        <Transparency />
        <FAQ />
      </main>
      
      <ContactSection />
      <Footer />
      <WatchLiveButton />
    </>
  );
};

export default Home;
