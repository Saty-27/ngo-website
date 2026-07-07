import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HeartHandshake, Save, Upload, X, Image } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminRecurringGiving() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({ queryKey: ['/api/admin/recurring-giving'] });

  const [formData, setFormData] = useState({
    headline: "",
    description: "",
    presetAmounts: "500, 1000, 2500, 5000",
    ctaText: "",
    backgroundImageUrl: ""
  });

  useEffect(() => {
    if (settings) {
      const bgUrl = settings.backgroundImageUrl || "";
      setFormData({
        headline: settings.headline || "",
        description: settings.description || "",
        presetAmounts: Array.isArray(settings.presetAmounts) ? settings.presetAmounts.join(", ") : "500, 1000, 2500, 5000",
        ctaText: settings.ctaText || "",
        backgroundImageUrl: bgUrl
      });
      setImagePreview(bgUrl || null);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("/api/admin/recurring-giving", "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/recurring-giving'] });
      toast({ title: "Settings saved successfully" });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image under 5MB.", variant: "destructive" });
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      uploadForm.append("type", "banner");

      const token = localStorage.getItem("token");
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: uploadForm,
      });

      if (!response.ok) throw new Error("Upload failed");
      const result = await response.json();
      setFormData(prev => ({ ...prev, backgroundImageUrl: result.url }));
      toast({ title: "Image uploaded successfully!" });
    } catch (error) {
      toast({ title: "Upload failed", description: "Could not upload image. Try using a URL instead.", variant: "destructive" });
      setImagePreview(formData.backgroundImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setFormData(prev => ({ ...prev, backgroundImageUrl: "" }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountsArray = formData.presetAmounts
      .split(',')
      .map(s => parseInt(s.trim()))
      .filter(n => !isNaN(n));

    if (amountsArray.length === 0) {
      toast({ title: "Validation Error", description: "Please enter at least one valid number for preset amounts.", variant: "destructive" });
      return;
    }

    updateMutation.mutate({
      ...formData,
      presetAmounts: amountsArray
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-poppins text-primary">Recurring Giving Settings</h1>
          <p className="text-gray-500">Manage the monthly donation highlight section on the homepage</p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading settings...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-3xl">
          <div className="p-6 border-b border-gray-100 flex items-center bg-purple-50/50">
            <HeartHandshake className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-purple-900">Homepage Call to Action</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="headline" className="text-base font-semibold">Headline</Label>
              <Input 
                id="headline" 
                value={formData.headline} 
                onChange={e => setFormData({...formData, headline: e.target.value})} 
                placeholder="Become a Monthly Sponsor" 
                className="text-lg"
              />
              <p className="text-sm text-gray-500">The main bold text displayed in the section.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">Description</Label>
              <Textarea 
                id="description" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Consistent support allows us to plan ahead..."
                className="min-h-[100px]"
              />
              <p className="text-sm text-gray-500">A brief explanation of why monthly giving is important.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="presetAmounts" className="text-base font-semibold">Preset Amounts (₹)</Label>
              <Input 
                id="presetAmounts" 
                value={formData.presetAmounts} 
                onChange={e => setFormData({...formData, presetAmounts: e.target.value})} 
                placeholder="500, 1000, 2500, 5000" 
              />
              <p className="text-sm text-gray-500">Enter comma-separated numbers (e.g., 500, 1000, 2500, 5000). These will be displayed as clickable options.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaText" className="text-base font-semibold">Button Text</Label>
              <Input 
                id="ctaText" 
                value={formData.ctaText} 
                onChange={e => setFormData({...formData, ctaText: e.target.value})} 
                placeholder="Give Monthly" 
              />
            </div>

            {/* Background Image Section */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Background Image (Optional)</Label>
              <p className="text-sm text-gray-500">Leave blank to use the default purple gradient background.</p>

              {/* Preview with overlay */}
              {imagePreview && (
                <div className="rounded-lg overflow-hidden border border-gray-200 relative h-44">
                  <img src={imagePreview} alt="Background Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-purple-900/70 flex items-center justify-center">
                    <span className="text-white font-bold tracking-widest uppercase text-sm">Overlay Preview</span>
                  </div>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Upload from local */}
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                  isUploading
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/40'
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
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Uploading image...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-7 h-7 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">Click to upload from your computer</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">OR paste a URL</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* URL input */}
              <div className="relative">
                <Image className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9"
                  id="backgroundImageUrl"
                  value={formData.backgroundImageUrl}
                  onChange={e => {
                    setFormData({...formData, backgroundImageUrl: e.target.value});
                    setImagePreview(e.target.value || null);
                  }}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <Button type="submit" size="lg" disabled={updateMutation.isPending || isUploading} className="bg-primary px-8">
                {updateMutation.isPending ? "Saving..." : (
                  <><Save className="w-4 h-4 mr-2" /> Save Settings</>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
