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
  ArrowRight,
  Globe
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
      <NavigationBar title="Campus Buddy" />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20 mt-16">
          <div className="w-24 h-24 gradient-campus rounded-full flex items-center justify-center mx-auto mb-8 shadow-glow">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground font-poppins mb-6 leading-tight">
            Your Smart Campus Assistant.
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Get instant answers, faculty details, and all your college info — powered by AI.
          </p>

          <Button
            onClick={handleGetStarted}
            size="lg"
            className="gradient-campus hover:opacity-90 transition-smooth text-lg px-10 py-7 rounded-full shadow-elegant"
          >
            {user ? 'Open Chat' : 'Get Started'}
          </Button>
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
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate('/chat')} 
                  className="flex-1 gradient-campus hover:opacity-90"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat Bot
                </Button>
                <Button 
                  onClick={() => navigate('/syncspot')} 
                  variant="outline"
                  className="flex-1"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  SyncSpot
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA for Non-Authenticated Users */}
        {!user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="shadow-card">
              <CardHeader className="text-center">
                <CardTitle className="font-poppins">For Students</CardTitle>
                <CardDescription>
                  Create your account to access the campus chat bot and get instant answers to your questions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="w-full gradient-campus hover:opacity-90"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Student Access
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="text-center">
                <CardTitle className="font-poppins">For Faculty</CardTitle>
                <CardDescription>
                  Secure faculty portal to manage college data and train the AI model.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/faculty-auth')} 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Faculty Portal
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
