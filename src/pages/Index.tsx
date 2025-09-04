import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NavigationBar } from '@/components/ui/navigation-bar';
import { useAuth } from '@/hooks/useAuth';
import { 
  GraduationCap, 
  MessageSquare, 
  Users, 
  Settings,
  Bot,
  BookOpen,
  ArrowRight
} from 'lucide-react';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect authenticated students to chat
    if (!loading && user && profile?.user_type === 'student') {
      navigate('/chat');
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleGetStarted = () => {
    if (user) {
      if (profile?.user_type === 'faculty') {
        // Faculty dashboard - for future implementation
        navigate('/chat');
      } else {
        navigate('/chat');
      }
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar title="Campus Management System" />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="w-20 h-20 gradient-campus rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground font-poppins mb-6">
            AI-Powered Campus Management
          </h1>
          
          <p className="text-xl text-muted-foreground font-poppins mb-4">
            Student Helpdesk Chat Bot
          </p>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Get instant answers to all your college-related questions. From department locations 
            to faculty contacts, our AI-powered chat bot has all the campus information you need.
          </p>

          <Button
            onClick={handleGetStarted}
            size="lg"
            className="gradient-campus hover:opacity-90 transition-smooth text-lg px-8 py-6"
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            {user ? 'Open Chat Bot' : 'Get Started'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          <Card className="shadow-card hover:shadow-elevated transition-all duration-200 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 gradient-campus rounded-lg flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="font-poppins">AI-Powered Responses</CardTitle>
              <CardDescription>
                Get instant, accurate answers powered by advanced AI technology trained on your campus data.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-all duration-200 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 gradient-campus rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="font-poppins">Comprehensive Database</CardTitle>
              <CardDescription>
                Access information about departments, faculty, labs, events, and all campus facilities in one place.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-all duration-200 hover:-translate-y-1">
            <CardHeader>
              <div className="w-12 h-12 gradient-campus rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="font-poppins">Faculty Management</CardTitle>
              <CardDescription>
                Faculty can easily update campus information to keep the knowledge base current and accurate.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Current User Info */}
        {user && profile && (
          <Card className="max-w-md mx-auto shadow-card">
            <CardHeader className="text-center">
              <CardTitle className="font-poppins">Welcome back!</CardTitle>
              <CardDescription>
                <strong>{profile.full_name}</strong>
                <br />
                {profile.user_type === 'faculty' ? 'Faculty Member' : 'Student'} • {profile.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/chat')} 
                className="w-full gradient-campus hover:opacity-90"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Open Chat Bot
              </Button>
            </CardContent>
          </Card>
        )}

        {/* CTA for Non-Authenticated Users */}
        {!user && (
          <Card className="max-w-md mx-auto shadow-card">
            <CardHeader className="text-center">
              <CardTitle className="font-poppins">Ready to get started?</CardTitle>
              <CardDescription>
                Create your account or sign in to access the campus chat bot and get instant answers to your questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full gradient-campus hover:opacity-90"
              >
                Sign In / Sign Up
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Index;
