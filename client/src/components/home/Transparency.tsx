import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck, Download, FileText, PieChart } from 'lucide-react';

export default function Transparency() {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/transparency'],
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <Skeleton className="h-10 w-64 mx-auto mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </section>
    );
  }

  if (!data) return null;
  
  const { certificates = [], annualReports = [], fundAllocations = [] } = data;

  // Don't render section if totally empty
  if (certificates.length === 0 && annualReports.length === 0 && fundAllocations.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="font-poppins font-bold text-3xl md:text-4xl text-primary mb-4">
            Trust & Transparency
          </h2>
          <p className="font-opensans text-lg text-gray-600 max-w-2xl mx-auto">
            We are committed to complete financial transparency and accountability to our donors and community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: Certifications & Registration */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <h3 className="font-bold font-poppins text-xl text-primary mb-6 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-blue-500" /> Registrations
            </h3>
            
            <div className="space-y-6">
              {certificates.length > 0 ? certificates.map((cert: any) => (
                <div key={cert.id} className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-4 flex-shrink-0">
                    {cert.badgeIconUrl ? (
                      <img src={cert.badgeIconUrl} alt="Badge" className="w-6 h-6" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                    {cert.number && <p className="text-sm text-gray-500 font-mono mt-1">{cert.number}</p>}
                    {cert.fileUrl && (
                      <a href={cert.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium">
                        <Download className="w-3 h-3 mr-1" /> View Certificate
                      </a>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-gray-500 text-sm">Registrations will be listed here.</p>
              )}
            </div>
          </div>

          {/* Column 2: Where the money goes */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 md:col-span-1">
            <h3 className="font-bold font-poppins text-xl text-primary mb-6 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-orange-500" /> Fund Allocation
            </h3>
            
            {fundAllocations.length > 0 ? (
              <div className="space-y-5">
                {fundAllocations.map((fund: any) => (
                  <div key={fund.id}>
                    <div className="flex justify-between text-sm mb-1 font-medium text-gray-700">
                      <span>{fund.label}</span>
                      <span>{fund.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${fund.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Allocation details will be updated shortly.</p>
            )}
          </div>

          {/* Column 3: Annual Reports */}
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
            <h3 className="font-bold font-poppins text-xl text-primary mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-600" /> Annual Reports
            </h3>
            
            <div className="space-y-4">
              {annualReports.length > 0 ? annualReports.map((report: any) => (
                <a 
                  key={report.id} 
                  href={report.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mr-3 font-bold font-mono text-sm">
                      {report.year}
                    </div>
                    <span className="font-medium text-gray-800 group-hover:text-green-800 transition-colors">{report.title}</span>
                  </div>
                  <Download className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </a>
              )) : (
                <p className="text-gray-500 text-sm">Annual reports will be available for download here.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
