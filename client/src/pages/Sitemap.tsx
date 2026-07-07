import { Link } from "wouter";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { Campaign, BlogPost, Policy } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Sitemap() {
  const { data: campaigns } = useQuery<Campaign[]>({ queryKey: ['/api/campaigns'] });
  const { data: blogs } = useQuery<BlogPost[]>({ queryKey: ['/api/blogs'] });
  const { data: policies } = useQuery<Policy[]>({ queryKey: ['/api/policies'] });

  const staticLinks = [
    { name: "Home", path: "/" },
    { name: "Donate", path: "/donate" },
    { name: "Campaigns", path: "/campaigns" },
    { name: "Gallery", path: "/gallery" },
    { name: "Videos", path: "/videos" },
    { name: "Blog", path: "/blog" },
    { name: "Contact Us", path: "/contact" },
    { name: "Login", path: "/login" },
    { name: "Register", path: "/register" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Helmet>
        <title>Sitemap - NGO Website</title>
      </Helmet>

      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold font-poppins text-[#4B0082] mb-8 border-b pb-4">Site Map</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Main Pages</h2>
            <ul className="space-y-2">
              {staticLinks.map(link => (
                <li key={link.path}>
                  <Link href={link.path} className="text-[#FF9933] hover:underline font-opensans">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Campaigns</h2>
            <ul className="space-y-2">
              {!campaigns ? (
                <Skeleton className="h-4 w-32" />
              ) : campaigns.map(c => (
                <li key={c.id}>
                  <Link href={`/campaigns/${c.id}`} className="text-[#FF9933] hover:underline font-opensans">
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Blog Posts</h2>
            <ul className="space-y-2">
              {!blogs ? (
                <Skeleton className="h-4 w-32" />
              ) : blogs.map(b => (
                <li key={b.id}>
                  <Link href={`/blog/${b.slug}`} className="text-[#FF9933] hover:underline font-opensans">
                    {b.title}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="text-2xl font-semibold mb-4 mt-8 text-gray-800">Policies</h2>
            <ul className="space-y-2">
              {!policies ? (
                <Skeleton className="h-4 w-32" />
              ) : policies.map(p => (
                <li key={p.id}>
                  <Link href={`/policies/${p.slug}`} className="text-[#FF9933] hover:underline font-opensans">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
