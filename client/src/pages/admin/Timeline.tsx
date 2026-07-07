import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Clock, Edit, Trash2, Plus, Search, Upload, X, Image } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminTimeline() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    yearOrDate: "", title: "", description: "", imageUrl: "", displayOrder: 0, isActive: true
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: milestones = [], isLoading } = useQuery({ queryKey: ['/api/admin/timeline'] });

  const addMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("/api/admin/timeline", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/timeline'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({ title: "Milestone added successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => apiRequest(`/api/admin/timeline/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/timeline'] });
      setIsEditDialogOpen(false);
      toast({ title: "Milestone updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest(`/api/admin/timeline/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/timeline'] });
      toast({ title: "Milestone deleted" });
    },
  });

  const resetForm = () => {
    setFormData({ yearOrDate: "", title: "", description: "", imageUrl: "", displayOrder: 0, isActive: true });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setFormData({
      yearOrDate: item.yearOrDate, title: item.title, description: item.description,
      imageUrl: item.imageUrl || "", displayOrder: item.displayOrder, isActive: item.isActive
    });
    setImagePreview(item.imageUrl || null);
    setIsEditDialogOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image under 5MB.", variant: "destructive" });
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("type", "timeline");

      const token = localStorage.getItem("token");
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formDataUpload,
      });

      if (!response.ok) throw new Error("Upload failed");
      const result = await response.json();
      setFormData(prev => ({ ...prev, imageUrl: result.url }));
      toast({ title: "Image uploaded successfully!" });
    } catch (error) {
      toast({ title: "Upload failed", description: "Could not upload image. Try using a URL instead.", variant: "destructive" });
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: "" }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent, isEditing: boolean) => {
    e.preventDefault();
    if (isEditing && editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const filteredData = milestones.filter((m: any) => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.yearOrDate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-poppins text-primary">Timeline Milestones</h1>
          <p className="text-gray-500">Manage the organization's history</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary">
          <Plus className="w-4 h-4 mr-2" /> Add Milestone
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search milestones..." className="pl-9 h-9 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Year/Date</th>
                <th className="px-6 py-4 text-left">Title</th>
                <th className="px-6 py-4 text-center">Image</th>
                <th className="px-6 py-4 text-center">Order</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No milestones found.</td></tr>
              ) : (
                filteredData.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.yearOrDate}</td>
                    <td className="px-6 py-4">{item.title}</td>
                    <td className="px-6 py-4 text-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-12 h-10 object-cover rounded mx-auto border" />
                      ) : (
                        <span className="text-gray-400 text-xs">No image</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">{item.displayOrder}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(item)} className="text-blue-600 mr-2"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { if(confirm('Delete?')) deleteMutation.mutate(item.id); }} className="text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) { setIsAddDialogOpen(false); setIsEditDialogOpen(false); resetForm(); }
      }}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? 'Edit Milestone' : 'Add New Milestone'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => handleSubmit(e, isEditDialogOpen)} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Year or Date *</Label>
                <Input required value={formData.yearOrDate} onChange={e => setFormData({...formData, yearOrDate: e.target.value})} placeholder="e.g. 2010" />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" required value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: parseInt(e.target.value)})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label>Image (Optional)</Label>

              {/* Preview */}
              {imagePreview && (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Upload from local */}
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isUploading ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Uploading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <p className="text-sm font-medium text-gray-600">Click to upload from computer</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* URL input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Image className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    className="pl-9"
                    value={formData.imageUrl}
                    onChange={e => {
                      setFormData({...formData, imageUrl: e.target.value});
                      setImagePreview(e.target.value || null);
                    }}
                    placeholder="Paste image URL here"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch checked={formData.isActive} onCheckedChange={c => setFormData({...formData, isActive: c})} />
              <Label>Active (Visible on website)</Label>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => { setIsAddDialogOpen(false); setIsEditDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button type="submit" disabled={addMutation.isPending || updateMutation.isPending || isUploading}>
                {isEditDialogOpen ? 'Save Changes' : 'Add Milestone'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
