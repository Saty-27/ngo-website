import { useState } from 'react';
import { Menu, Download, User, HelpCircle, LogOut, Home } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import useAuth from '@/hooks/useAuth';
import { useOnboarding } from '@/components/admin/OnboardingProvider';
import * as XLSX from 'xlsx';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { startTour } = useOnboarding();

  const handleLogout = async () => {
    await logout();
    setLocation('/'); // Redirect to home page after logout
  };

  const handleExportDonations = async () => {
    try {
      // Fetch ALL donations from admin endpoint
      const response = await fetch(
        `/api/admin/donations`,
        {
          credentials: 'include',
        }
      );
      
      if (!response.ok) {
        console.error('Failed to export donations');
        return;
      }
      
      const donations = await response.json();
      
      // Prepare data for Excel
      const excelData = donations.map((donation: any) => ({
        "ID": donation.id,
        "Donor Name": donation.name || "-",
        "Email": donation.email || "-",
        "Phone": donation.phone || "-",
        "Amount (₹)": donation.amount || 0,
        "Category": donation.categoryName || "N/A",
        "Event": donation.eventTitle || "N/A",
        "Status": donation.status || "-",
        "Date": donation.createdAt
          ? new Date(donation.createdAt).toLocaleDateString('en-IN')
          : "-",
        "Payment ID": donation.paymentId || "-",
      }));
      
      // Create Excel workbook
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Donations");
      
      // Set column widths
      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 20 },
        { wch: 25 },
        { wch: 15 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
      ];
      
      // Download file
      const today = new Date().toISOString().split('T')[0];
      const fileName = `all_donations_${today}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getPageTitle = () => {
    if (location === '/admin') return 'Dashboard';
    if (location === '/admin/donations') return 'Donation Management';
    if (location === '/admin/users') return 'User Management';
    if (location === '/admin/messages') return 'Message Management';
    if (location === '/admin/testimonials') return 'Testimonial Management';
    if (location === '/admin/social-links') return 'Social Links Management';
    return 'Admin Panel';
  };

  const showExportButton = location === '/admin/donations';

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-2 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Back to Website Button (with logout functionality) */}
        <Button 
          onClick={handleLogout}
          variant="outline" 
          size="sm"
          className="flex items-center hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
          title="Back to Website"
        >
          <Home className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Back to Website</span>
        </Button>

        {/* Tour Help Button */}
        <Button 
          onClick={startTour}
          variant="outline" 
          size="sm"
          className="hidden md:flex items-center"
          title="Restart Admin Tour"
        >
          <HelpCircle className="h-4 w-4 mr-2" />
          Tour
        </Button>
        
        {showExportButton && (
          <Button 
            onClick={handleExportDonations}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 font-medium transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Donations
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center space-x-3 text-sm focus:outline-none"
            >
              <div className="h-10 w-10 rounded-full bg-purple-100 border-2 border-purple-200 flex items-center justify-center">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <span className="hidden md:inline-block font-medium text-gray-700">
                {user?.name || 'Admin User'}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;