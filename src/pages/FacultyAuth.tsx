import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NavigationBar } from '@/components/ui/navigation-bar';
import { Shield, BookOpen, Bot, ArrowRight, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function FacultyAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [facultyId, setFacultyId] = useState('');
  const [password, setPassword] = useState('');

  const handleFacultyAccess = () => {
    // Hardcoded credentials check
    if (facultyId === 'Neuron' && password === 'Neuron') {
      navigate('/faculty-dashboard');
    } else {
      toast({
        title: "Authentication Failed",
        description: "Invalid faculty ID or password. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background page-enter">
      <NavigationBar title="Faculty Portal" showBack onBack={() => navigate('/')} />
      
      <div className="container max-w-2xl mx-auto pt-4 sm:pt-8 px-4">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 gradient-campus rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-poppins mb-3 sm:mb-4">
            Faculty Portal
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground px-2">
            Welcome to the Campus Buddy Faculty Portal. Train and manage the AI model with college data.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="shadow-elevated">
            <CardHeader className="text-center px-4 sm:px-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-campus rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-poppins">AI Model Training</CardTitle>
              <CardDescription className="text-sm">
                Access the faculty dashboard to add college data, train the AI model, and manage campus information that students can query.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              <div className="space-y-2">
                <Label htmlFor="faculty-id" className="text-sm sm:text-base">Faculty ID</Label>
                <Input 
                  id="faculty-id"
                  type="text" 
                  placeholder="Enter your faculty ID"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="transition-smooth h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="transition-smooth h-10 sm:h-11 text-sm sm:text-base"
                />
              </div>
              
              <Button 
                onClick={handleFacultyAccess}
                className="w-full gradient-campus hover:opacity-90 transition-smooth text-base sm:text-lg py-5 sm:py-6 mt-4 sm:mt-6"
                disabled={!facultyId.trim() || !password.trim()}
              >
                <Lock className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Access Faculty Dashboard
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <Card className="shadow-card">
              <CardHeader className="px-4 sm:px-6 py-4">
                <CardTitle className="text-base sm:text-lg font-poppins">Data Management</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Add and manage college information including departments, faculty details, events, and facilities.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="shadow-card">
              <CardHeader className="px-4 sm:px-6 py-4">
                <CardTitle className="text-base sm:text-lg font-poppins">AI Training</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Train the Campus Buddy AI with updated information to help students get accurate responses.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}