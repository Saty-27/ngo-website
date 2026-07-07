import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Download, Calendar, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

interface Donation {
  id: number;
  name: string;
  email: string;
  phone: string;
  amount: number;
  status: string;
  createdAt: string;
  categoryName?: string;
  eventTitle?: string;
  paymentId?: string;
}

export default function DonationsExport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { toast } = useToast();

  // Fetch donations for preview
  const { data: previewDonations = [], isLoading: isLoadingPreview } = useQuery<Donation[]>({
    queryKey: ["/api/admin/donations", fromDate, toDate],
    queryFn: async () => {
      // Fetch all donations
      const response = await fetch(
        `/api/admin/donations`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch donations");
      }

      let allDonations = await response.json();
      
      // Filter by date range if both dates are selected
      if (fromDate && toDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);

        allDonations = allDonations.filter((donation: Donation) => {
          const donationDate = new Date(donation.createdAt);
          return donationDate >= from && donationDate <= to;
        });
      }

      return allDonations;
    },
    enabled: true,
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      if (!fromDate || !toDate) {
        throw new Error("Please select both from and to dates");
      }

      if (previewDonations.length === 0) {
        throw new Error("No donations found for the selected date range");
      }

      // Prepare data for Excel
      const excelData = previewDonations.map((donation: any) => ({
        "Donor Name": donation.name || "-",
        "Email": donation.email || "-",
        "Phone": donation.phone || "-",
        "Amount": donation.amount || 0,
        "Category": donation.categoryName || "N/A",
        "Event": donation.eventTitle || "N/A",
        "Status": donation.status || "-",
        "Date": donation.createdAt
          ? new Date(donation.createdAt).toLocaleDateString()
          : "-",
        "Payment ID": donation.paymentId || "-",
      }));

      // Create Excel workbook
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Donations");

      // Set column widths
      worksheet["!cols"] = [
        { wch: 20 },
        { wch: 25 },
        { wch: 15 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
      ];

      // Download file
      const fileName = `donations-${fromDate}-to-${toDate}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Donations exported successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to export donations",
        variant: "destructive",
      });
    },
  });

  return (
    <AdminLayout title="Export Donations">
      <div className="max-w-6xl space-y-6">
        {/* Export Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Download Donations Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-gray-600">
              Select a date range to see and export all donations made within that period.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* From Date */}
              <div>
                <Label htmlFor="fromDate" className="text-sm font-medium">From Date</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    id="fromDate"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* To Date */}
              <div>
                <Label htmlFor="toDate" className="text-sm font-medium">To Date</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    id="toDate"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Select a date range above to preview donations and download as Excel.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview Table */}
        {fromDate && toDate && (
          <Card>
            <CardHeader>
              <CardTitle>
                Preview ({previewDonations.length} donation{previewDonations.length !== 1 ? "s" : ""})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPreview ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
              ) : previewDonations.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100 border-b">
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Donor Name</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Phone</th>
                          <th className="px-4 py-3 text-right font-medium text-gray-700">Amount</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Category</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewDonations.map((donation, index) => (
                          <tr key={donation.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="px-4 py-3 text-gray-900">{donation.name}</td>
                            <td className="px-4 py-3 text-gray-600">{donation.email}</td>
                            <td className="px-4 py-3 text-gray-600">{donation.phone}</td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-900">₹{donation.amount}</td>
                            <td className="px-4 py-3 text-gray-600">{donation.categoryName || "N/A"}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                donation.status === "completed" || donation.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : donation.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {donation.status === "completed" || donation.status === "approved" ? "Success" : 
                                 donation.status === "pending" ? "Pending" : "Failed"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {new Date(donation.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Export Button */}
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={() => exportMutation.mutate()}
                      disabled={exportMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700 gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {exportMutation.isPending ? "Exporting..." : "Export to Excel"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <p>No donations found for this date range</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
