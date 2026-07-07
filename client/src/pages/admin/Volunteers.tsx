import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Heart, MapPin, Mail, Phone, Clock, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminVolunteers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', city: '', interestArea: '', availability: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: volunteers = [], isLoading } = useQuery({ queryKey: ['/api/admin/volunteers'] });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => apiRequest(`/api/admin/volunteers/${id}/status`, "PATCH", { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/volunteers'] });
      toast({ title: "Status updated" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => apiRequest(`/api/admin/volunteers/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/volunteers'] });
      setIsEditDialogOpen(false);
      toast({ title: "Volunteer updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest(`/api/admin/volunteers/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/volunteers'] });
      toast({ title: "Volunteer deleted" });
    },
  });

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name, phone: item.phone, email: item.email, 
      city: item.city, interestArea: item.interestArea, availability: item.availability
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    }
  };

  const filteredData = volunteers.filter((v: any) => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.interestArea.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'onboarded': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-poppins text-primary">Volunteer Applications</h1>
          <p className="text-gray-500">Manage people offering their time and skills</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search by name, email, or interest..." className="pl-9 h-10 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading applications...</div>
      ) : filteredData.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No volunteers found</h3>
          <p className="text-gray-500">Applications will appear here once submitted.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredData.map((v: any) => (
            <div key={v.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center">
                      {v.name}
                      <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(v.status)}`}>
                        {v.status}
                      </span>
                    </h3>
                    <p className="text-sm font-medium text-orange-600 uppercase tracking-wider mt-1">{v.interestArea}</p>
                  </div>
                  
                    <div className="flex gap-2 items-start">
                    <select 
                      className="h-9 rounded-md border border-gray-300 text-sm px-3 mr-2"
                      value={v.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: v.id, status: e.target.value })}
                      disabled={updateStatusMutation.isPending}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="onboarded">Onboarded</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(v)} className="text-blue-600"><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => { if(confirm('Delete this volunteer?')) deleteMutation.mutate(v.id); }} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3">
                    <p className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-400" /> <a href={`mailto:${v.email}`} className="text-blue-600 hover:underline">{v.email}</a></p>
                    <p className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400" /> {v.phone}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400" /> {v.city}</p>
                    <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-400" /> Applied: {new Date(v.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {v.availability && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Availability:</h4>
                    <p className="text-sm text-gray-600">{v.availability}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Volunteer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Phone *</Label>
                <Input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City *</Label>
                <Input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Interest Area *</Label>
                <Input required value={formData.interestArea} onChange={e => setFormData({...formData, interestArea: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Availability *</Label>
              <Input required value={formData.availability} onChange={e => setFormData({...formData, availability: e.target.value})} />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
