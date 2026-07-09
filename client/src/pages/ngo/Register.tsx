import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const ngoRegisterFormSchema = z.object({
  // NGO Details
  name: z.string().min(3, { message: 'NGO name must be at least 3 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number' }),
  alternatePhone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  address: z.string().min(10, { message: 'Please enter a valid address' }),
  city: z.string().min(2, { message: 'Please enter a city' }),
  state: z.string().min(2, { message: 'Please enter a state' }),
  pincode: z.string().min(6, { message: 'Please enter a valid pincode' }),
  registrationNumber: z.string().min(3, { message: 'Please enter your registration number' }),
  about: z.string().min(20, { message: 'Please tell us about your NGO (at least 20 characters)' }),
  mission: z.string().min(20, { message: 'Please describe your mission (at least 20 characters)' }),
  vision: z.string().min(20, { message: 'Please describe your vision (at least 20 characters)' }),

  // Bank Details
  accountHolderName: z.string().min(3, { message: 'Please enter account holder name' }),
  bankName: z.string().min(3, { message: 'Please enter bank name' }),
  accountNumber: z.string().min(8, { message: 'Please enter a valid account number' }),
  ifscCode: z.string().min(11, { message: 'Please enter a valid IFSC code' }),
  branchName: z.string().optional(),
  upiId: z.string().optional(),

  // Authorized Person (Admin)
  authorizedPersonName: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  authorizedPersonEmail: z.string().email({ message: 'Please enter a valid email' }),
  authorizedPersonPhone: z.string().min(10, { message: 'Please enter a valid phone' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type NgoRegisterFormValues = z.infer<typeof ngoRegisterFormSchema>;

const NgoRegister = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<NgoRegisterFormValues>({
    resolver: zodResolver(ngoRegisterFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      alternatePhone: '',
      website: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      registrationNumber: '',
      about: '',
      mission: '',
      vision: '',
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',
      upiId: '',
      authorizedPersonName: '',
      authorizedPersonEmail: '',
      authorizedPersonPhone: '',
      password: '',
    },
  });
  
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [selectedRegistrationCert, setSelectedRegistrationCert] = useState<File | null>(null);
  const [selectedQrCode, setSelectedQrCode] = useState<File | null>(null);
  
  const onSubmit = async (data: NgoRegisterFormValues) => {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // Add all text fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      
      // Add file fields
      if (selectedLogo) {
        formData.append('logo', selectedLogo);
      }
      if (selectedRegistrationCert) {
        formData.append('registrationCertificate', selectedRegistrationCert);
      }
      if (selectedQrCode) {
        formData.append('qrCode', selectedQrCode);
      }
      
      const response = await fetch('/api/ngo/register', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      toast({
        title: "Registration Successful",
        description: "Your NGO registration has been submitted for admin review. We'll notify you once approved!",
      });
      
      setLocation('/ngo/login');
    } catch (error) {
      let errorMessage = "There was an error registering your NGO. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>NGO Registration - Gauranitai Foundation</title>
        <meta name="description" content="Register your NGO with Gauranitai Foundation to start fundraising campaigns." />
      </Helmet>
      
      <Header />
      
      <main>
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
              <h1 className="font-poppins font-bold text-2xl md:text-3xl text-primary mb-2 text-center">
                Register Your NGO
              </h1>
              <p className="text-center text-gray-600 mb-8">Join our platform and create impactful fundraising campaigns</p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* NGO Basic Info */}
                  <div>
                    <h3 className="font-poppins font-semibold text-xl text-dark mb-4 border-b pb-2">NGO Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">NGO Official Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter NGO name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="registrationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">Registration Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="NGO Registration Number" {...field} />
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
                            <FormLabel className="text-dark font-medium">NGO Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="ngo@example.org" {...field} />
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
                            <FormLabel className="text-dark font-medium">Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 XXXXX XXXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="alternatePhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">Alternate Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 XXXXX XXXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">Website (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://yourngo.org" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <FormLabel className="text-dark font-medium">Logo (Optional)</FormLabel>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setSelectedLogo(e.target.files?.[0] || null)}
                        />
                      </div>
                      <div>
                        <FormLabel className="text-dark font-medium">Registration Certificate (Optional)</FormLabel>
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setSelectedRegistrationCert(e.target.files?.[0] || null)}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">Physical Address *</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter complete physical address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">City *</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">State *</FormLabel>
                            <FormControl>
                              <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">Pincode *</FormLabel>
                            <FormControl>
                              <Input placeholder="Pincode" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="about"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">About Your NGO *</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Tell us about your NGO..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="mission"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">Mission *</FormLabel>
                            <FormControl>
                              <Textarea placeholder="What is your NGO's mission?" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="vision"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">Vision *</FormLabel>
                            <FormControl>
                              <Textarea placeholder="What is your NGO's vision?" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div>
                    <h3 className="font-poppins font-semibold text-xl text-dark mb-4 border-b pb-2">Bank & Payment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="accountHolderName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">Account Holder Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Account holder name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">Bank Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Bank name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">Account Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Account number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="ifscCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">IFSC Code *</FormLabel>
                            <FormControl>
                              <Input placeholder="IFSC code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="branchName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">Branch Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Branch name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="upiId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">UPI ID</FormLabel>
                            <FormControl>
                              <Input placeholder="yourngo@upi" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <FormLabel className="text-dark font-medium">QR Code (Optional)</FormLabel>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedQrCode(e.target.files?.[0] || null)}
                      />
                    </div>
                  </div>

                  {/* Authorized Person */}
                  <div>
                    <h3 className="font-poppins font-semibold text-xl text-dark mb-4 border-b pb-2">Authorized Person</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="authorizedPersonName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="authorizedPersonEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="email@yourngo.org" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="authorizedPersonPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">Phone *</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 XXXXX XXXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-dark font-medium">Password *</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white font-poppins font-medium py-3 rounded-lg hover:bg-opacity-90 transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting Registration..." : "Submit NGO Registration"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6 text-center">
                <p className="font-opensans text-dark">
                  Already have an NGO account? {' '}
                  <Link href="/ngo/login">
                    <a className="text-primary hover:text-secondary font-medium">Login</a>
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
};

export default NgoRegister;
