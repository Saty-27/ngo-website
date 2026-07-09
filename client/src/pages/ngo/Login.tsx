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
import { queryClient } from '@/lib/queryClient';

const ngoLoginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Please enter your password' }),
});

type NgoLoginFormValues = z.infer<typeof ngoLoginFormSchema>;

const NgoLogin = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<NgoLoginFormValues>({
    resolver: zodResolver(ngoLoginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: NgoLoginFormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('/api/ngo/login', 'POST', data);
      const resData = await response.json();
      
      // Save token to localStorage
      if (resData.token) {
        localStorage.setItem('ngoToken', resData.token);
      }
      
      toast({
        title: "Login Successful",
        description: "Welcome back to your NGO portal!",
      });
      
      // Invalidate any NGO queries
      queryClient.invalidateQueries({ queryKey: ['/api/ngo/me'] });
      
      setLocation('/ngo/dashboard');
    } catch (error) {
      let errorMessage = "Invalid email or password. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Login Failed",
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
        <title>NGO Login - Gauranitai Foundation</title>
      </Helmet>
      
      <Header />
      
      <main>
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md">
              <h1 className="font-poppins font-bold text-2xl md:text-3xl text-primary mb-6 text-center">
                NGO Login
              </h1>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-dark font-medium">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="Enter your email" 
                            {...field} 
                            className="focus:ring-primary"
                          />
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
                        <FormLabel className="text-dark font-medium">Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password"
                            placeholder="Enter your password" 
                            {...field} 
                            className="focus:ring-primary"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-white font-poppins font-medium py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Logging In..." : "Login"}
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6 text-center">
                <p className="font-opensans text-dark">
                  Don't have an NGO account? {' '}
                  <Link href="/ngo/register">
                    <a className="text-primary hover:text-secondary font-medium">Register Your NGO</a>
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

export default NgoLogin;
