import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const Contact = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us - Gauranitai Foundation</title>
        <meta name="description" content="Get in touch with Gauranitai Foundation. Find our location, contact details, and working hours. Send us a message for inquiries or volunteer support." />
        <meta property="og:title" content="Contact Us - Gauranitai Foundation" />
        <meta property="og:description" content="Get in touch with Gauranitai Foundation. Find our location, contact details, and working hours." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 bg-primary">
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-white font-poppins font-bold text-4xl md:text-5xl mb-4">
              Contact Us
            </h1>
            <p className="text-white font-opensans text-lg md:text-xl max-w-3xl mx-auto">
              We'd love to hear from you. Reach out for inquiries, volunteer opportunities, or to support our social initiatives.
            </p>
          </div>
        </section>
        
        {/* Map Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-poppins font-bold text-3xl text-primary mb-8 text-center">
                Our Location
              </h2>
              
              <div className="rounded-xl overflow-hidden shadow-lg h-[400px]">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.0!2d72.8777!3d19.0760!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b63aceef0c47%3A0x2aa80cf2287dfa3b!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1626873550656!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy"
                  title="Gauranitai Foundation Temple Location"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
        
        {/* Visit Information */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-poppins font-bold text-3xl text-primary mb-8 text-center">
                Visiting Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-neutral p-6 rounded-xl shadow-md">
                  <div className="w-14 h-14 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
                    <i className="ri-time-fill text-white text-2xl"></i>
                  </div>
                  <h3 className="font-poppins font-semibold text-xl text-primary mb-2 text-center">Visiting Hours</h3>
                  <ul className="space-y-2 font-opensans">
                    <li><strong>Office Hours:</strong> 9:00 AM to 6:00 PM</li>
                    <li><strong>Monday - Friday:</strong> 9:00 AM to 6:00 PM</li>
                    <li><strong>Saturday:</strong> 10:00 AM to 4:00 PM</li>
                    <li><strong>Sunday:</strong> Closed</li>
                    <li className="text-sm italic">Special hours during events</li>
                  </ul>
                </div>
                
                <div className="bg-neutral p-6 rounded-xl shadow-md">
                  <div className="w-14 h-14 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
                    <i className="ri-route-fill text-white text-2xl"></i>
                  </div>
                  <h3 className="font-poppins font-semibold text-xl text-primary mb-2 text-center">Getting Here</h3>
                  <ul className="space-y-2 font-opensans">
                    <li><strong>By Train:</strong> Nearest station - Vile Parle (Western Line)</li>
                    <li><strong>By Bus:</strong> Multiple BEST bus routes available</li>
                    <li><strong>By Taxi/Auto:</strong> Easily accessible from anywhere in Mumbai</li>
                    <li><strong>By Car:</strong> Limited parking available</li>
                    <li><strong>From Airport:</strong> 15 minutes from domestic terminal</li>
                  </ul>
                </div>
                
                <div className="bg-neutral p-6 rounded-xl shadow-md">
                  <div className="w-14 h-14 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
                    <i className="ri-information-fill text-white text-2xl"></i>
                  </div>
                  <h3 className="font-poppins font-semibold text-xl text-primary mb-2 text-center">Guidelines</h3>
                  <ul className="space-y-2 font-opensans">
                    <li>Visitors are welcome during office hours</li>
                    <li>Please carry a valid ID for registration</li>
                    <li>Photography allowed in public areas</li>
                    <li>Maintain decorum on premises</li>
                    <li>For group visits, please contact our office in advance</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
};

export default Contact;
