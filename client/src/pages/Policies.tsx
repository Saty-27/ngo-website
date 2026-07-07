import { useQuery } from '@tanstack/react-query';
import { type Policy, type PoliciesPage } from '@shared/schema';
import { Link } from 'wouter';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PoliciesPage() {
  const { data: policies = [], isLoading } = useQuery<Policy[]>({
    queryKey: ['/api/policies'],
  });

  const { data: pageSettings } = useQuery<PoliciesPage>({
    queryKey: ['/api/policies-page'],
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 font-poppins">{pageSettings?.title || "Policies of Usage"}</h1>
            <p className="text-gray-600 mb-8 font-opensans">
              {pageSettings?.description || "Please review our policies to understand how we operate and your rights as a user."}
            </p>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading policies...</p>
              </div>
            ) : policies.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <p className="text-gray-500">No policies available at this time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {policies.map((policy) => (
                  <Link key={policy.id} href={`/policies/${policy.slug}`}>
                    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
                      <h2 className="text-xl font-semibold text-gray-900 font-poppins hover:text-purple-600 transition-colors">
                        {policy.title}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Updated: {new Date(policy.updatedAt).toLocaleDateString('en-IN')}
                      </p>
                      <p className="text-gray-600 mt-3 line-clamp-2 font-opensans">
                        {policy.content}
                      </p>
                      <p className="text-purple-600 font-medium mt-4 hover:underline">
                        Read full policy →
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
