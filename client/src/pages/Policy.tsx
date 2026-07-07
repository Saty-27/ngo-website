import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { type Policy } from '@shared/schema';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import NotFound from './not-found';

export default function PolicyPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: policy, isLoading, isError } = useQuery<Policy>({
    queryKey: [`/api/policies/${slug}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isError || !policy) {
    return <NotFound />;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 font-poppins">{policy.title}</h1>
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed font-opensans">
                  {policy.content}
                </div>
              </div>
            </div>
            <div className="mt-8 text-sm text-gray-500">
              <p>Last updated: {new Date(policy.updatedAt).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
