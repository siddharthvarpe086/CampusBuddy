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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-poppins">Loading Campus Buddy...</p>
          <p className="text-sm text-gray-500 mt-2 font-poppins">Please wait while we set up your experience</p>
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
    <div className="min-h-screen bg-white">
      <NavigationBar title="Campus Buddy" />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-poppins mb-6">
            AI-Powered Campus Buddy
          </h1>
          
          <p className="text-xl text-gray-600 font-poppins mb-4">
            Student Helpdesk Chat Bot
          </p>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 font-poppins">
            Get instant answers to all your college-related questions. From department locations 
            to faculty contacts, our AI-powered chat bot has all the campus information you need.
          </p>

          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg px-8 py-6 font-poppins"
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            {user ? 'Open Chat Bot' : 'Get Started'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          <Card className="shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 bg-white">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="font-poppins text-gray-900">AI-Powered Responses</CardTitle>
              <CardDescription className="text-gray-600">
                Get instant, accurate answers powered by advanced AI technology trained on your campus data.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 bg-white">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="font-poppins text-gray-900">Comprehensive Database</CardTitle>
              <CardDescription className="text-gray-600">
                Access information about departments, faculty, labs, events, and all campus facilities in one place.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 bg-white">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="font-poppins text-gray-900">Faculty Management</CardTitle>
              <CardDescription className="text-gray-600">
                Faculty can easily update campus information to keep the knowledge base current and accurate.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Current User Info */}
        {user && profile && (
          <Card className="max-w-md mx-auto shadow-lg bg-white">
            <CardHeader className="text-center">
              <CardTitle className="font-poppins text-gray-900">Welcome back!</CardTitle>
              <CardDescription className="text-gray-600">
                <strong>{profile.full_name}</strong>
                <br />
                {profile.user_type === 'faculty' ? 'Faculty Member' : 'Student'} • {profile.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/chat')} 
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-poppins"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Open Chat Bot
              </Button>
            </CardContent>
          </Card>
        )}

        {/* CTA for Non-Authenticated Users */}
        {!user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="shadow-lg bg-white">
              <CardHeader className="text-center">
                <CardTitle className="font-poppins text-gray-900">For Students</CardTitle>
                <CardDescription className="text-gray-600">
                  Create your account to access the campus chat bot and get instant answers to your questions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-poppins"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Student Access
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg bg-white">
              <CardHeader className="text-center">
                <CardTitle className="font-poppins text-gray-900">For Faculty</CardTitle>
                <CardDescription className="text-gray-600">
                  Secure faculty portal to manage college data and train the AI model.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/faculty-auth')} 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-poppins"
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
