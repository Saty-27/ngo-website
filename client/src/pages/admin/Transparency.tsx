import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Edit, Trash2, Plus, ShieldCheck, FileText, PieChart } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminTransparency() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transparencyData = { certificates: [], annualReports: [], fundAllocations: [] }, isLoading } = useQuery({ queryKey: ['/api/transparency'] });

  // Add/Edit Dialog States
  const [activeTab, setActiveTab] = useState("certificates");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [certForm, setCertForm] = useState({ name: "", number: "", badgeIconUrl: "", fileUrl: "", displayOrder: 0, isActive: true });
  const [reportForm, setReportForm] = useState({ year: "", title: "", fileUrl: "", displayOrder: 0 });
  const [fundForm, setFundForm] = useState({ label: "", percentage: 0, displayOrder: 0 });
  const [uploadingFile, setUploadingFile] = useState(false);

  // Generic Mutation Handlers
  const getEndpoint = () => {
    if (activeTab === 'certificates') return '/api/admin/certificates';
    if (activeTab === 'reports') return '/api/admin/annual-reports';
    return '/api/admin/fund-allocations';
  };

  const getFormData = () => {
    if (activeTab === 'certificates') return certForm;
    if (activeTab === 'reports') return reportForm;
    return fundForm;
  };

  const addMutation = useMutation({
    mutationFn: async () => apiRequest(getEndpoint(), "POST", getFormData()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transparency'] });
      setIsDialogOpen(false);
      toast({ title: "Item added successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => apiRequest(`${getEndpoint()}/${editingId}`, "PUT", getFormData()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transparency'] });
      setIsDialogOpen(false);
      toast({ title: "Item updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: number, type: string }) => {
      const endpoint = type === 'certificates' ? '/api/admin/certificates' : type === 'reports' ? '/api/admin/annual-reports' : '/api/admin/fund-allocations';
      return apiRequest(`${endpoint}/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transparency'] });
      toast({ title: "Item deleted" });
    },
  });

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setCertForm({ name: "", number: "", badgeIconUrl: "", fileUrl: "", displayOrder: 0, isActive: true });
    setReportForm({ year: "", title: "", fileUrl: "", displayOrder: 0 });
    setFundForm({ label: "", percentage: 0, displayOrder: 0 });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: any, type: string) => {
    setActiveTab(type);
    setIsEditing(true);
    setEditingId(item.id);
    if (type === 'certificates') {
      setCertForm({ name: item.name, number: item.number || "", badgeIconUrl: item.badgeIconUrl || "", fileUrl: item.fileUrl || "", displayOrder: item.displayOrder, isActive: item.isActive });
    } else if (type === 'reports') {
      setReportForm({ year: item.year, title: item.title, fileUrl: item.fileUrl, displayOrder: item.displayOrder });
    } else {
      setFundForm({ label: item.label, percentage: item.percentage, displayOrder: item.displayOrder });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) updateMutation.mutate();
    else addMutation.mutate();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'certificates' | 'reports') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      
      if (type === 'certificates') {
        setCertForm({ ...certForm, fileUrl: data.imageUrl });
      } else {
        setReportForm({ ...reportForm, fileUrl: data.imageUrl });
      }
      
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading the file.",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
      // Reset input value to allow uploading the same file again
      if (e.target) e.target.value = '';
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-poppins text-primary">Trust & Transparency</h1>
          <p className="text-gray-500">Manage certificates, reports, and fund allocations</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-primary">
          <Plus className="w-4 h-4 mr-2" /> Add New Item
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="certificates"><ShieldCheck className="w-4 h-4 mr-2"/> Certificates (80G/12A)</TabsTrigger>
          <TabsTrigger value="reports"><FileText className="w-4 h-4 mr-2"/> Annual Reports</TabsTrigger>
          <TabsTrigger value="funds"><PieChart className="w-4 h-4 mr-2"/> Fund Allocations</TabsTrigger>
        </TabsList>

        <TabsContent value="certificates">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                <tr>
                  <th className="px-6 py-4 text-left">Name</th>
                  <th className="px-6 py-4 text-left">Reg Number</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transparencyData.certificates.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6 py-4">{item.number}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(item, 'certificates')} className="text-blue-600 mr-2"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { if(confirm('Delete?')) deleteMutation.mutate({id: item.id, type: 'certificates'}); }} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                <tr>
                  <th className="px-6 py-4 text-left">Year</th>
                  <th className="px-6 py-4 text-left">Title</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transparencyData.annualReports.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{item.year}</td>
                    <td className="px-6 py-4">{item.title}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(item, 'reports')} className="text-blue-600 mr-2"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { if(confirm('Delete?')) deleteMutation.mutate({id: item.id, type: 'reports'}); }} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="funds">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                <tr>
                  <th className="px-6 py-4 text-left">Label</th>
                  <th className="px-6 py-4 text-center">Percentage</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transparencyData.fundAllocations.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{item.label}</td>
                    <td className="px-6 py-4 text-center">{item.percentage}%</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(item, 'funds')} className="text-blue-600 mr-2"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { if(confirm('Delete?')) deleteMutation.mutate({id: item.id, type: 'funds'}); }} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit' : 'Add'} {activeTab === 'certificates' ? 'Certificate' : activeTab === 'reports' ? 'Annual Report' : 'Fund Allocation'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            
            {activeTab === 'certificates' && (
              <>
                <div className="space-y-2"><Label>Name *</Label><Input required value={certForm.name} onChange={e => setCertForm({...certForm, name: e.target.value})} placeholder="e.g. 80G Registration" /></div>
                <div className="space-y-2"><Label>Registration Number</Label><Input value={certForm.number} onChange={e => setCertForm({...certForm, number: e.target.value})} /></div>
                <div className="space-y-2">
                  <Label>File URL / PDF Link</Label>
                  <div className="flex gap-2">
                    <Input value={certForm.fileUrl} onChange={e => setCertForm({...certForm, fileUrl: e.target.value})} className="flex-1" />
                    <div className="relative">
                      <Button type="button" variant="outline" disabled={uploadingFile} className="w-[100px]">
                        {uploadingFile ? "Uploading..." : "Upload File"}
                      </Button>
                      <input 
                        type="file" 
                        accept=".pdf,image/*" 
                        onChange={(e) => handleFileUpload(e, 'certificates')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploadingFile}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2"><Label>Display Order</Label><Input type="number" required value={certForm.displayOrder} onChange={e => setCertForm({...certForm, displayOrder: parseInt(e.target.value)})} /></div>
              </>
            )}

            {activeTab === 'reports' && (
              <>
                <div className="space-y-2"><Label>Financial Year *</Label><Input required value={reportForm.year} onChange={e => setReportForm({...reportForm, year: e.target.value})} placeholder="e.g. 2023-24" /></div>
                <div className="space-y-2"><Label>Report Title *</Label><Input required value={reportForm.title} onChange={e => setReportForm({...reportForm, title: e.target.value})} placeholder="e.g. Annual Activity Report" /></div>
                <div className="space-y-2">
                  <Label>PDF URL *</Label>
                  <div className="flex gap-2">
                    <Input required value={reportForm.fileUrl} onChange={e => setReportForm({...reportForm, fileUrl: e.target.value})} className="flex-1" />
                    <div className="relative">
                      <Button type="button" variant="outline" disabled={uploadingFile} className="w-[100px]">
                        {uploadingFile ? "Uploading..." : "Upload PDF"}
                      </Button>
                      <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={(e) => handleFileUpload(e, 'reports')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploadingFile}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2"><Label>Display Order</Label><Input type="number" required value={reportForm.displayOrder} onChange={e => setReportForm({...reportForm, displayOrder: parseInt(e.target.value)})} /></div>
              </>
            )}

            {activeTab === 'funds' && (
              <>
                <div className="space-y-2"><Label>Category Label *</Label><Input required value={fundForm.label} onChange={e => setFundForm({...fundForm, label: e.target.value})} placeholder="e.g. Temple Construction" /></div>
                <div className="space-y-2"><Label>Percentage (0-100) *</Label><Input type="number" required min="0" max="100" value={fundForm.percentage} onChange={e => setFundForm({...fundForm, percentage: parseInt(e.target.value)})} /></div>
                <div className="space-y-2"><Label>Display Order</Label><Input type="number" required value={fundForm.displayOrder} onChange={e => setFundForm({...fundForm, displayOrder: parseInt(e.target.value)})} /></div>
              </>
            )}

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
                {isEditing ? 'Save Changes' : 'Add Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
