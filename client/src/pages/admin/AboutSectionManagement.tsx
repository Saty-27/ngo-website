import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from "@/components/admin/Layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AboutSection, insertAboutSectionSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const aboutSectionFormSchema = insertAboutSectionSchema.extend({
  sectionNumber: z.number().min(1, 'Section number must be at least 1'),
  title: z.string().min(1, 'Title is required'),
});

const AboutSectionManagementPage = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<AboutSection | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof aboutSectionFormSchema>>({
    resolver: zodResolver(aboutSectionFormSchema),
    defaultValues: {
      sectionNumber: 1,
      title: '',
      description: '',
      imageUrl: '',
      icon: '',
      isActive: true,
    },
  });

  const { data: sections = [], isLoading } = useQuery<AboutSection[]>({
    queryKey: ['/api/admin/about-sections'],
  });

  useEffect(() => {
    if (editingSection && isEditDialogOpen) {
      form.reset({
        sectionNumber: editingSection.sectionNumber,
        title: editingSection.title,
        description: editingSection.description || '',
        imageUrl: editingSection.imageUrl || '',
        icon: editingSection.icon || '',
        isActive: editingSection.isActive,
      });
      setImagePreview(editingSection.imageUrl || '');
    } else if (isAddDialogOpen) {
      form.reset({
        sectionNumber: sections.length + 1,
        title: '',
        description: '',
        imageUrl: '',
        icon: '',
        isActive: true,
      });
      setImagePreview('');
      setImageFile(null);
    }
  }, [editingSection, isEditDialogOpen, isAddDialogOpen, sections.length, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
      return null;
    }
  };

  const createSectionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof aboutSectionFormSchema>) => {
      let imageUrl = data.imageUrl;
      if (imageFile) {
        const uploadedUrl = await handleFileUpload(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      return apiRequest('/api/admin/about-sections', 'POST', { ...data, imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/about-sections'] });
      queryClient.invalidateQueries({ queryKey: ['/api/about-sections'] });
      toast({ title: 'Success', description: 'About section created successfully' });
      setIsAddDialogOpen(false);
      setImageFile(null);
      setImagePreview('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create about section', variant: 'destructive' });
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<z.infer<typeof aboutSectionFormSchema>> }) => {
      let imageUrl = data.imageUrl;
      if (imageFile) {
        const uploadedUrl = await handleFileUpload(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      return apiRequest(`/api/admin/about-sections/${id}`, 'PUT', { ...data, imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/about-sections'] });
      queryClient.invalidateQueries({ queryKey: ['/api/about-sections'] });
      toast({ title: 'Success', description: 'About section updated successfully' });
      setIsEditDialogOpen(false);
      setEditingSection(null);
      setImageFile(null);
      setImagePreview('');
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update about section', variant: 'destructive' });
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/about-sections/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/about-sections'] });
      queryClient.invalidateQueries({ queryKey: ['/api/about-sections'] });
      toast({ title: 'Success', description: 'About section deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete about section', variant: 'destructive' });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this section?')) {
      deleteSectionMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="About Sections Management">
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold">About Sections</h1>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="About Sections Management">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">About Sections</h1>
            <p className="text-gray-600">Manage the sections on the About Us page</p>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Section
          </Button>
        </div>

        <div className="grid gap-6">
          {sections.sort((a, b) => a.sectionNumber - b.sectionNumber).map((section) => (
            <Card key={section.id} className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-6 flex-1">
                    {section.imageUrl && (
                      <img
                        src={section.imageUrl}
                        alt={section.title}
                        className="w-32 h-24 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg font-semibold text-purple-600">{section.sectionNumber}.</span>
                        <h3 className="text-lg font-semibold">{section.title}</h3>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${section.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {section.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">{section.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingSection(section);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(section.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {sections.length === 0 && (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="p-12 text-center">
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No about sections</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first about section</p>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Section
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add Section Modal */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create About Section</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sectionNumber">Section Number</Label>
                    <Input
                      id="sectionNumber"
                      type="number"
                      {...form.register('sectionNumber', { valueAsNumber: true })}
                      placeholder="1"
                    />
                    {form.formState.errors.sectionNumber && (
                      <p className="text-sm text-red-600">{form.formState.errors.sectionNumber.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      {...form.register('title')}
                      placeholder="Who We Are"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Tell us about this section..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Image</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 mt-1">
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-48 w-full object-cover rounded"
                        />
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="mt-2"
                        />
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer py-8">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Click to upload image</span>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div className="mt-2">
                    <Label htmlFor="imageUrl">Or enter image URL</Label>
                    <Input
                      id="imageUrl"
                      {...form.register('imageUrl')}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="icon">Icon (optional)</Label>
                  <Input
                    id="icon"
                    {...form.register('icon')}
                    placeholder="Icon name or emoji"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={form.watch('isActive')}
                    onCheckedChange={(checked) => form.setValue('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      const data = form.getValues();
                      createSectionMutation.mutate(data);
                    }}
                    disabled={createSectionMutation.isPending}
                  >
                    {createSectionMutation.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Section Modal */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit About Section</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sectionNumber">Section Number</Label>
                    <Input
                      id="sectionNumber"
                      type="number"
                      {...form.register('sectionNumber', { valueAsNumber: true })}
                      placeholder="1"
                    />
                    {form.formState.errors.sectionNumber && (
                      <p className="text-sm text-red-600">{form.formState.errors.sectionNumber.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      {...form.register('title')}
                      placeholder="Who We Are"
                    />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Tell us about this section..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Image</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 mt-1">
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-48 w-full object-cover rounded"
                        />
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="mt-2"
                        />
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer py-8">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Click to upload image</span>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <div className="mt-2">
                    <Label htmlFor="imageUrl">Or enter image URL</Label>
                    <Input
                      id="imageUrl"
                      {...form.register('imageUrl')}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="icon">Icon (optional)</Label>
                  <Input
                    id="icon"
                    {...form.register('icon')}
                    placeholder="Icon name or emoji"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={form.watch('isActive')}
                    onCheckedChange={(checked) => form.setValue('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (editingSection) {
                        const data = form.getValues();
                        updateSectionMutation.mutate({ id: editingSection.id, data });
                      }
                    }}
                    disabled={updateSectionMutation.isPending}
                  >
                    {updateSectionMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AboutSectionManagementPage;