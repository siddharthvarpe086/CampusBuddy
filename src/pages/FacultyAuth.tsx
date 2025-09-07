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
      
      <div className="container max-w-2xl mx-auto pt-8 px-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 gradient-campus rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground font-poppins mb-4">
            Faculty Portal
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome to the Campus Buddy Faculty Portal. Train and manage the AI model with college data.
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card className="shadow-elevated">
            <CardHeader className="text-center">
              <div className="w-12 h-12 gradient-campus rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-poppins">AI Model Training</CardTitle>
              <CardDescription>
                Access the faculty dashboard to add college data, train the AI model, and manage campus information that students can query.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="faculty-id">Faculty ID</Label>
                <Input 
                  id="faculty-id"
                  type="text" 
                  placeholder="Enter your faculty ID"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="transition-smooth"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="transition-smooth"
                />
              </div>
              
              <Button 
                onClick={handleFacultyAccess}
                className="w-full gradient-campus hover:opacity-90 transition-smooth text-lg py-6 mt-6"
                disabled={!facultyId.trim() || !password.trim()}
              >
                <Lock className="mr-2 h-5 w-5" />
                Access Faculty Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-poppins">Data Management</CardTitle>
                <CardDescription>
                  Add and manage college information including departments, faculty details, events, and facilities.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-poppins">AI Training</CardTitle>
                <CardDescription>
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