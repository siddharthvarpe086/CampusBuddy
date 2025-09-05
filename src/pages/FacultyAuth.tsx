import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { NavigationBar } from '@/components/ui/navigation-bar';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Shield, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const FACULTY_CREDENTIALS = {
  email: 'faculty@college.in',
  password: '12345678'
};

export default function FacultyAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  if (user) {
    navigate('/faculty-dashboard');
    return null;
  }

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleFacultySignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate faculty credentials match expected values
    if (formData.email !== FACULTY_CREDENTIALS.email || formData.password !== FACULTY_CREDENTIALS.password) {
      setError('Invalid faculty credentials. Please check your login details.');
      return;
    }

    setIsLoading(true);
    console.log('Faculty login attempt with credentials:', formData.email, formData.password);
    
    // Try to sign in first
    const { error: signInError } = await signIn(formData.email, formData.password);
    
    if (signInError && signInError.message === 'Invalid login credentials') {
      // If credentials don't exist, create the faculty account
      console.log('Faculty account not found, creating...');
      const { error: signUpError } = await signUp(
        FACULTY_CREDENTIALS.email, 
        FACULTY_CREDENTIALS.password, 
        'Faculty Admin',
        'faculty'
      );
      
      if (signUpError) {
        console.error('Faculty signup error:', signUpError);
        setError('Failed to create faculty account: ' + signUpError.message);
        setIsLoading(false);
        return;
      }

      // After successful signup, try to sign in again
      const { error: secondSignInError } = await signIn(formData.email, formData.password);
      
      if (secondSignInError) {
        console.error('Faculty login after signup error:', secondSignInError);
        setError('Faculty account created but login failed: ' + secondSignInError.message);
        setIsLoading(false);
        return;
      }
    } else if (signInError) {
      console.error('Faculty login error:', signInError);
      setError('Faculty authentication failed: ' + signInError.message);
      setIsLoading(false);
      return;
    }
    
    toast({
      title: "Faculty Access Granted",
      description: "Welcome to the faculty dashboard.",
    });
    navigate('/faculty-dashboard');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background page-enter">
      <NavigationBar title="Faculty Authentication" showBack />
      
      <div className="container max-w-md mx-auto pt-8 px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-campus rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-poppins">
            Faculty Portal
          </h1>
          <p className="text-muted-foreground mt-2">
            Secure access for faculty members to manage college data
          </p>
        </div>

        <Card className="shadow-elevated">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-poppins flex items-center justify-center gap-2">
              <BookOpen className="h-5 w-5" />
              Faculty Sign In
            </CardTitle>
            <CardDescription>
              Enter your faculty credentials to access the data management system
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleFacultySignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="faculty-email">Faculty ID</Label>
                <Input
                  id="faculty-email"
                  type="text"
                  placeholder="Enter faculty ID"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="transition-smooth focus:ring-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="faculty-password">Password</Label>
                <Input
                  id="faculty-password"
                  type="password"
                  placeholder="Enter faculty password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="transition-smooth focus:ring-primary"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full gradient-campus hover:opacity-90 transition-smooth"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Sign In as Faculty
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}