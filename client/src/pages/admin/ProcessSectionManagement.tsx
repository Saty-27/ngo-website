import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { ProcessSection } from "@shared/schema";

export default function ProcessSectionManagement() {
  const [desktopPreview, setDesktopPreview] = useState<string>("");
  const [mobilePreview, setMobilePreview] = useState<string>("");
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [title, setTitle] = useState("ISKCON FOOD FOR CHILD");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const { data: section, isLoading } = useQuery<ProcessSection>({
    queryKey: ["/api/process-section"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      desktopImageUrl?: string;
      mobileImageUrl?: string;
    }) => {
      const uploadedData = { ...data };
      
      try {
        if (desktopFile) {
          const formData = new FormData();
          formData.append("file", desktopFile);
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (!response.ok) {
            throw new Error("Desktop image upload failed");
          }
          const uploadedFile = await response.json();
          uploadedData.desktopImageUrl = uploadedFile.url;
        }
        
        if (mobileFile) {
          const formData = new FormData();
          formData.append("file", mobileFile);
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (!response.ok) {
            throw new Error("Mobile image upload failed");
          }
          const uploadedFile = await response.json();
          uploadedData.mobileImageUrl = uploadedFile.url;
        }

        const response = await fetch("/api/process-section", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(uploadedData),
        });
        
        if (!response.ok) {
          throw new Error("Failed to update process section");
        }
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/process-section"] });
      toast({
        title: "Success",
        description: "Process section updated successfully",
      });
      setDesktopFile(null);
      setMobileFile(null);
      setDesktopPreview("");
      setMobilePreview("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update process section",
        variant: "destructive",
      });
    },
  });

  const handleDesktopFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDesktopFile(file);
      setDesktopPreview(URL.createObjectURL(file));
    }
  };

  const handleMobileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMobileFile(file);
      setMobilePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      title,
      description,
      desktopImageUrl: section?.desktopImageUrl,
      mobileImageUrl: section?.mobileImageUrl,
    });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Process Section Management">
        <div className="text-center py-12">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Process Section Management">
      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Edit ISKCON Food for Child Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Section Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter section title"
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter section description"
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Desktop Image */}
            <div>
              <Label>Desktop Image</Label>
              <div className="border-2 border-dashed rounded-lg p-4 mt-1">
                {desktopPreview || section?.desktopImageUrl ? (
                  <div className="space-y-2">
                    <img
                      src={desktopPreview || section?.desktopImageUrl}
                      alt="Desktop preview"
                      className="max-h-64 w-full object-cover rounded"
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleDesktopFileChange}
                      className="mt-2"
                    />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer py-8">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload desktop image</span>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleDesktopFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Mobile Image */}
            <div>
              <Label>Mobile Image</Label>
              <div className="border-2 border-dashed rounded-lg p-4 mt-1">
                {mobilePreview || section?.mobileImageUrl ? (
                  <div className="space-y-2">
                    <img
                      src={mobilePreview || section?.mobileImageUrl}
                      alt="Mobile preview"
                      className="max-h-64 w-full object-cover rounded"
                    />
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleMobileFileChange}
                      className="mt-2"
                    />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer py-8">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload mobile image</span>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleMobileFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="w-full bg-primary"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
