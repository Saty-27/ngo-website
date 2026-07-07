import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { HelpCircle, Edit, Trash2, Plus, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminFAQ() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    question: "", answer: "", category: "general", displayOrder: 0, isActive: true
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: faqs = [], isLoading } = useQuery({ queryKey: ['/api/admin/faqs'] });

  const addMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("/api/admin/faqs", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/faqs'] });
      setIsAddDialogOpen(false);
      setFormData({ question: "", answer: "", category: "general", displayOrder: 0, isActive: true });
      toast({ title: "FAQ added successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => apiRequest(`/api/admin/faqs/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/faqs'] });
      setIsEditDialogOpen(false);
      toast({ title: "FAQ updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest(`/api/admin/faqs/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/faqs'] });
      toast({ title: "FAQ deleted" });
    },
  });

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setFormData({
      question: item.question, answer: item.answer, category: item.category,
      displayOrder: item.displayOrder, isActive: item.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent, isEditing: boolean) => {
    e.preventDefault();
    if (isEditing && editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const filteredData = faqs.filter((m: any) => 
    m.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-poppins text-primary">FAQs</h1>
          <p className="text-gray-500">Manage Frequently Asked Questions</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary">
          <Plus className="w-4 h-4 mr-2" /> Add FAQ
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search FAQs..." className="pl-9 h-9 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Question</th>
                <th className="px-6 py-4 text-center">Category</th>
                <th className="px-6 py-4 text-center">Order</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No FAQs found.</td></tr>
              ) : (
                filteredData.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-md truncate">{item.question}</td>
                    <td className="px-6 py-4 text-center">{item.category}</td>
                    <td className="px-6 py-4 text-center">{item.displayOrder}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(item)} className="text-blue-600 mr-2"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { if(confirm('Delete FAQ?')) deleteMutation.mutate(item.id); }} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => handleSubmit(e, isEditDialogOpen)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Question *</Label>
              <Input required value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} placeholder="e.g. Are donations tax-exempt?" />
            </div>
            <div className="space-y-2">
              <Label>Answer (Supports HTML/Text) *</Label>
              <Textarea required className="min-h-[150px]" value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="general" />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" required value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch checked={formData.isActive} onCheckedChange={c => setFormData({...formData, isActive: c})} />
              <Label>Active (Visible on website)</Label>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }}>Cancel</Button>
              <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending}>
                {isEditDialogOpen ? 'Save Changes' : 'Add FAQ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
