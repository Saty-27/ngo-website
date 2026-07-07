import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Upload, Link2, Check, RefreshCw } from "lucide-react";
import logoIskcon from "@/assets/logo-iskcon.png";

interface FooterSettings {
  id?: number;
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export default function LogoSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [logoUrl, setLogoUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Fetch footer settings
  const { data: settings, isLoading } = useQuery<FooterSettings>({
    queryKey: ["/api/footer-settings"],
  });

  // Sync state with fetched logoUrl when settings load
  useEffect(() => {
    if (settings?.logoUrl) {
      setLogoUrl(settings.logoUrl);
    } else {
      setLogoUrl("");
    }
  }, [settings]);

  const activeLogo = settings?.logoUrl || logoIskcon;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    
    setIsUploading(true);
    try {
      const res = await fetch('/api/upload/banner', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setLogoUrl(data.imageUrl || data.url || '');
      toast({ title: 'Success', description: 'Logo uploaded successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload logo', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const updateLogoMutation = useMutation({
    mutationFn: async (urlToSave: string) => {
      return await apiRequest('/api/footer-settings', 'PUT', { logoUrl: urlToSave });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/footer-settings'] });
      toast({
        title: "✅ Logo Updated Successfully",
        description: "The new logo is now active across the website.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update logo settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateLogoMutation.mutate(logoUrl);
  };

  const handleResetDefault = () => {
    setLogoUrl("");
    updateLogoMutation.mutate("");
  };

  return (
    <AdminLayout title="Navbar Logo Settings">
      <div className="max-w-2xl space-y-6">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold font-poppins text-primary">Website Header Logo</CardTitle>
            <CardDescription className="text-sm font-opensans text-gray-500">
              Upload a new logo/icon to replace the default ISKCON Juhu brand in the website navigation bar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Active Logo Status */}
            <div className="border border-gray-100 rounded-lg p-6 bg-gray-50/50 flex flex-col items-center justify-center gap-3">
              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Active Logo Preview</span>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 h-24 max-w-full flex items-center justify-center overflow-hidden">
                <img 
                  src={logoUrl || activeLogo} 
                  alt="Website Header Logo" 
                  className="max-h-full max-w-full object-contain" 
                />
              </div>
            </div>

            {/* Logo Settings Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold text-primary">Upload Logo from computer</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="file" 
                    accept="image/*"
                    disabled={isUploading || updateLogoMutation.isPending}
                    onChange={handleLogoUpload}
                    className="cursor-pointer"
                  />
                </div>
                {isUploading && (
                  <span className="flex items-center gap-2 text-xs text-primary animate-pulse font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading logo image…
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-url" className="font-semibold text-primary">OR Paste Logo URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      id="logo-url"
                      value={logoUrl} 
                      onChange={(e) => setLogoUrl(e.target.value)} 
                      disabled={updateLogoMutation.isPending}
                      placeholder="e.g. /uploads/banners/my-logo.png" 
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button 
                onClick={handleSave}
                disabled={isLoading || updateLogoMutation.isPending || isUploading}
                className="bg-primary hover:bg-opacity-95 text-white flex items-center gap-2"
              >
                {updateLogoMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save Settings
              </Button>
              <Button 
                variant="outline"
                onClick={handleResetDefault}
                disabled={isLoading || updateLogoMutation.isPending || isUploading}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset to Default
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
