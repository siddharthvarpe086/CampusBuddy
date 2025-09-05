import { useState } from 'react';
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

const FACULTY_CREDENTIALS = {
  email: 'TeamFaculty',
  password: '123456'
};

export default function FacultyAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user } = useAuth();
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
    
    // Validate faculty credentials
    if (formData.email !== FACULTY_CREDENTIALS.email || formData.password !== FACULTY_CREDENTIALS.password) {
      setError('Invalid faculty credentials. Please check your login details.');
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(formData.email, formData.password);
    
    if (error) {
      setError(error.message);
    } else {
      toast({
        title: "Faculty Access Granted",
        description: "Welcome to the faculty dashboard.",
      });
      navigate('/faculty-dashboard');
    }
    setIsLoading(false);
  };

  const handleUseFacultyCredentials = () => {
    setFormData({
      email: FACULTY_CREDENTIALS.email,
      password: FACULTY_CREDENTIALS.password
    });
  };

  return (
    <div className="min-h-screen bg-background">
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

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Quick Access</span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full mt-4 transition-smooth"
                onClick={handleUseFacultyCredentials}
              >
                Use Faculty Credentials
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}