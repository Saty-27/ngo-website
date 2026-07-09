import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from "@/components/admin/Layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ContactInfo, insertContactInfoSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';

const ContactInfoManagementPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertContactInfoSchema.partial()),
    defaultValues: {
      locationEmbed: '',
      visitingHoursOffice: '',
      visitingHoursSaturday: '',
      visitingHoursSunday: '',
      visitingHoursSpecial: '',
      gettingHereTrain: '',
      gettingHereBus: '',
      gettingHereTaxi: '',
      gettingHereCar: '',
      gettingHereAirport: '',
      guidelines: '',
    },
  });

  const { data: contactInfo, isLoading } = useQuery<ContactInfo | null>({
    queryKey: ['/api/contact-info'],
  });

  useEffect(() => {
    if (contactInfo) {
      form.reset({
        locationEmbed: contactInfo.locationEmbed || '',
        visitingHoursOffice: contactInfo.visitingHoursOffice || '',
        visitingHoursSaturday: contactInfo.visitingHoursSaturday || '',
        visitingHoursSunday: contactInfo.visitingHoursSunday || '',
        visitingHoursSpecial: contactInfo.visitingHoursSpecial || '',
        gettingHereTrain: contactInfo.gettingHereTrain || '',
        gettingHereBus: contactInfo.gettingHereBus || '',
        gettingHereTaxi: contactInfo.gettingHereTaxi || '',
        gettingHereCar: contactInfo.gettingHereCar || '',
        gettingHereAirport: contactInfo.gettingHereAirport || '',
        guidelines: contactInfo.guidelines || '',
      });
    }
  }, [contactInfo, form]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<ContactInfo>) => apiRequest('/api/admin/contact-info', 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact-info'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contact-info'] });
      toast({ title: 'Success', description: 'Contact info updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update contact info', variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <AdminLayout title="Contact Info Management">
        <div className="container mx-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Contact Info</h1>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
          <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Contact Info Management">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Contact Info</h1>
          <p className="text-gray-600">Manage the Contact Us page content</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <Label htmlFor="locationEmbed">Location Embed (Google Maps iframe or URL)</Label>
                  <Textarea
                    id="locationEmbed"
                    {...form.register('locationEmbed')}
                    placeholder="Paste Google Maps iframe or URL here..."
                    rows={4}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Visiting Hours</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="visitingHoursOffice">Office Hours (Mon-Fri)</Label>
                      <Input
                        id="visitingHoursOffice"
                        {...form.register('visitingHoursOffice')}
                        placeholder="9:00 AM to 6:00 PM"
                      />
                    </div>
                    <div>
                      <Label htmlFor="visitingHoursSaturday">Saturday Hours</Label>
                      <Input
                        id="visitingHoursSaturday"
                        {...form.register('visitingHoursSaturday')}
                        placeholder="10:00 AM to 4:00 PM"
                      />
                    </div>
                    <div>
                      <Label htmlFor="visitingHoursSunday">Sunday Hours</Label>
                      <Input
                        id="visitingHoursSunday"
                        {...form.register('visitingHoursSunday')}
                        placeholder="Closed"
                      />
                    </div>
                    <div>
                      <Label htmlFor="visitingHoursSpecial">Special Hours</Label>
                      <Input
                        id="visitingHoursSpecial"
                        {...form.register('visitingHoursSpecial')}
                        placeholder="e.g., Closed on public holidays"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Getting Here</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gettingHereTrain">By Train</Label>
                      <Input
                        id="gettingHereTrain"
                        {...form.register('gettingHereTrain')}
                        placeholder="Nearest station - Vile Parle (Western Line)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gettingHereBus">By Bus</Label>
                      <Input
                        id="gettingHereBus"
                        {...form.register('gettingHereBus')}
                        placeholder="Multiple BEST bus routes available"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gettingHereTaxi">By Taxi/Auto</Label>
                      <Input
                        id="gettingHereTaxi"
                        {...form.register('gettingHereTaxi')}
                        placeholder="Easily accessible from anywhere in Mumbai"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gettingHereCar">By Car</Label>
                      <Input
                        id="gettingHereCar"
                        {...form.register('gettingHereCar')}
                        placeholder="Limited parking available"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="gettingHereAirport">From Airport</Label>
                      <Input
                        id="gettingHereAirport"
                        {...form.register('gettingHereAirport')}
                        placeholder="15 minutes from domestic terminal"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Guidelines</h3>
                  <Textarea
                    id="guidelines"
                    {...form.register('guidelines')}
                    placeholder="Visitors guidelines..."
                    rows={6}
                  />
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={() => {
                      const data = form.getValues();
                      updateMutation.mutate(data);
                    }}
                    disabled={updateMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ContactInfoManagementPage;