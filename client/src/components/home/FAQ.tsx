import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function FAQ() {
  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['/api/faqs'],
  });

  const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-10 w-64 mx-auto mb-12" />
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </section>
    );
  }

  if (faqs.length === 0) return null;

  return (
    <section className="py-20 bg-white relative">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-full mb-4">
            <HelpCircle className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <p className="font-opensans text-lg text-gray-600">
            Find answers to common questions about donations, volunteering, and tax benefits.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq: any, index: number) => (
            <div 
              key={faq.id} 
              className={`border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === index ? 'bg-orange-50/30 border-orange-200 shadow-md' : 'bg-white hover:border-orange-200 hover:shadow-sm'}`}
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className={`font-semibold font-poppins pr-4 ${openIndex === index ? 'text-orange-600' : 'text-primary'}`}>
                  {faq.question}
                </h3>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIndex === index ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-6 pt-0 text-gray-600 font-opensans leading-relaxed">
                  {/* Safely rendering HTML if admin uses rich text, otherwise plain text */}
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
