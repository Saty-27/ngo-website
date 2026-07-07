import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Stat } from "@shared/schema";

// Helper: get auth token
function getToken() {
  return localStorage.getItem("authToken");
}

// Helper: make authenticated JSON API calls
async function jsonRequest(url: string, method: string, body?: any) {
  const token = getToken();
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || `Error ${res.status}`);
  }
  return data;
}

const emptyForm = { label: "", value: 0, suffix: "", isActive: true };

export default function AdminStats() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Stat | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({ ...emptyForm });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats = [], isLoading } = useQuery<Stat[]>({
    queryKey: ["/api/admin/stats"],
  });

  const closeDialogs = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setEditingItem(null);
    setFormData({ ...emptyForm });
  };

  const addMutation = useMutation({
    mutationFn: (data: any) =>
      jsonRequest("/api/admin/stats", "POST", {
        ...data,
        suffix: data.suffix || "", // ensure not undefined
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      closeDialogs();
      toast({ title: "Counter added successfully ✅" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to add counter", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      jsonRequest(`/api/admin/stats/${id}`, "PUT", {
        ...data,
        suffix: data.suffix || "",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      closeDialogs();
      toast({ title: "Counter updated successfully ✅" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to update counter", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => jsonRequest(`/api/admin/stats/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Counter deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete", description: err.message, variant: "destructive" });
    },
  });

  const handleEditClick = (item: Stat) => {
    setEditingItem(item);
    setFormData({
      label: item.label,
      value: item.value,
      suffix: item.suffix || "",
      isActive: item.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim()) {
      toast({ title: "Label is required", variant: "destructive" });
      return;
    }
    if (isEditDialogOpen && editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const filteredData = stats.filter((m: Stat) =>
    m.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-poppins text-primary">Homepage Counters</h1>
          <p className="text-gray-500">Manage the animated statistics shown on the homepage</p>
        </div>
        <Button onClick={() => { setFormData({ ...emptyForm }); setIsAddDialogOpen(true); }} className="bg-primary">
          <Plus className="w-4 h-4 mr-2" /> Add Counter
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search counters..."
              className="pl-9 h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Label</th>
                <th className="px-6 py-4 text-center">Value</th>
                <th className="px-6 py-4 text-center">Suffix</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No counters found. Click "Add Counter" to create one.</td></tr>
              ) : (
                filteredData.map((item: Stat) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.label}</td>
                    <td className="px-6 py-4 text-center font-bold text-blue-600">{item.value.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center text-gray-500">{item.suffix || "—"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {item.isActive ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(item)} className="text-blue-600 mr-2">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { if (confirm("Delete this counter?")) deleteMutation.mutate(item.id); }}
                        className="text-red-600"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => { if (!open) closeDialogs(); }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? "Edit Counter" : "Add New Counter"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Label *</Label>
              <Input
                required
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g. Meals Distributed"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Value (Number) *</Label>
                <Input
                  type="number"
                  required
                  min={0}
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Suffix (Optional)</Label>
                <Input
                  value={formData.suffix}
                  onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                  placeholder="e.g. + or cr+"
                  maxLength={20}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(c) => setFormData({ ...formData, isActive: c })}
              />
              <Label>Active (Visible on website)</Label>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={closeDialogs} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : isEditDialogOpen ? "Save Changes" : "Add Counter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
