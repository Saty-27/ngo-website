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
import { insertPoliciesPageSchema, type PoliciesPage } from "@shared/schema";
import { Loader2 } from "lucide-react";

type PoliciesPageFormValues = typeof insertPoliciesPageSchema._type;

export default function PoliciesPageSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { data: pageSettings } = useQuery<PoliciesPage>({
    queryKey: ['/api/policies-page'],
  });

  const form = useForm<PoliciesPageFormValues>({
    resolver: zodResolver(insertPoliciesPageSchema),
    defaultValues: {
      title: pageSettings?.title || "Policies of Usage",
      description: pageSettings?.description || "",
    },
    values: pageSettings ? {
      title: pageSettings.title,
      description: pageSettings.description,
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PoliciesPageFormValues) => {
      setIsLoading(true);
      try {
        const response = await apiRequest('/api/admin/policies-page', 'PUT', data);
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Policies page settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update policies page settings",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: PoliciesPageFormValues) => {
    updateMutation.mutate(data);
  };

  return (
    <AdminLayout title="Policies Page Settings">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Policies Page Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Policies of Usage" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please review our policies to understand how we operate and your rights as a user." 
                          {...field}
                          rows={5}
                        />
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
