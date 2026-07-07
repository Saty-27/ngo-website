import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertFooterSettingsSchema } from "@shared/schema";
import { Loader2 } from "lucide-react";

type FooterSettingsFormValues = typeof insertFooterSettingsSchema._type;

interface FooterSettings {
  id?: number;
  address: string;
  phone: string;
  email: string;
  templeHours: string;
  templeHoursSpecial: string;
  introDescription: string;
  logoUrl?: string;
}

export default function FooterSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data: footerSettings } = useQuery<FooterSettings>({
    queryKey: ['/api/footer-settings'],
  });

  const form = useForm<FooterSettingsFormValues>({
    resolver: zodResolver(insertFooterSettingsSchema),
    defaultValues: {
      address: footerSettings?.address || "",
      phone: footerSettings?.phone || "",
      email: footerSettings?.email || "",
      templeHours: footerSettings?.templeHours || "",
      templeHoursSpecial: footerSettings?.templeHoursSpecial || "",
      introDescription: footerSettings?.introDescription || "",
      logoUrl: footerSettings?.logoUrl || "",
    },
    values: footerSettings ? {
      address: footerSettings.address,
      phone: footerSettings.phone,
      email: footerSettings.email,
      templeHours: footerSettings.templeHours,
      templeHoursSpecial: footerSettings.templeHoursSpecial,
      introDescription: footerSettings.introDescription,
      logoUrl: footerSettings.logoUrl || "",
    } : undefined,
  });

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
      form.setValue('logoUrl', data.imageUrl);
      toast({ title: 'Success', description: 'Logo uploaded successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload logo', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (data: FooterSettingsFormValues) => {
      setIsLoading(true);
      try {
        const response = await apiRequest('/api/footer-settings', 'PUT', data);
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: FooterSettingsFormValues) => {
    updateMutation.mutate(data);
  };

  return (
    <AdminLayout title="Footer Settings">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Footer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website Navbar Logo / Icon</FormLabel>
                      <div className="flex flex-col gap-2 border p-4 rounded-lg bg-gray-50/50">
                        <Input 
                          type="file" 
                          accept="image/*"
                          disabled={isUploading}
                          onChange={handleLogoUpload}
                        />
                        {isUploading && (
                          <span className="flex items-center gap-2 text-xs text-purple-600 animate-pulse font-medium">
                            <Loader2 className="w-3 h-3 animate-spin" /> Uploading logo…
                          </span>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500 font-medium shrink-0">OR URL:</span>
                          <Input placeholder="Logo URL (e.g. /uploads/banners/logo.png)" {...field} value={field.value || ""} />
                        </div>
                        {field.value && (
                          <div className="mt-2 h-20 w-full object-contain rounded-md border border-gray-200 overflow-hidden bg-white flex items-center justify-center p-2">
                            <img src={field.value} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="introDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Introduction Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="We'd love to hear from you..." 
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Temple address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 22 2620 0072" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="info@iskconjuhu.in" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="templeHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temple Hours</FormLabel>
                      <FormControl>
                        <Input placeholder="Daily: 4:30 AM - 9:00 PM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="templeHoursSpecial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Hours Note</FormLabel>
                      <FormControl>
                        <Input placeholder="Special timings during festivals" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={isLoading || updateMutation.isPending}
                >
                  {(isLoading || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
