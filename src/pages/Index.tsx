import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { CosmicLoader } from '@/components/ui/cosmic-loader';
import { 
  GraduationCap, 
  MessageSquare, 
  Users, 
  Settings,
  Bot,
  BookOpen,
  ArrowRight,
  Sparkles,
  Brain,
  Zap
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
    return <CosmicLoader />;
  }

  const handleGetStarted = () => {
    if (user) {
      if (profile?.user_type === 'faculty') {
        navigate('/faculty-dashboard');
      } else {
        navigate('/chat');
      }
    } else {
      navigate('/user-type-selection');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl animate-bounce animation-duration-3000"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/3 left-1/5 w-2 h-2 bg-blue-400 rounded-full animate-bounce animation-delay-300"></div>
        <div className="absolute top-2/3 left-3/4 w-1 h-1 bg-purple-400 rounded-full animate-bounce animation-delay-700"></div>
        <div className="absolute bottom-1/3 left-2/3 w-3 h-3 bg-cyan-400 rounded-full animate-bounce animation-delay-1000"></div>
      </div>
      
      <main className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-5xl mx-auto mb-20">
          <div className="w-28 h-28 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30">
            <GraduationCap className="h-14 w-14 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-8 leading-tight">
            Campus Buddy
          </h1>
          
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-blue-500/30">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <span className="text-lg text-slate-200 font-medium">AI-Powered Campus Assistant</span>
          </div>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
            Get instant, accurate answers to all your college-related questions. From department locations 
            to faculty contacts, our advanced AI assistant has comprehensive campus information at your fingertips.
          </p>

          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-xl px-12 py-6 rounded-2xl shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
          >
            <MessageSquare className="mr-3 h-6 w-6" />
            {user ? 'Open Chat Bot' : 'Get Started'}
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          <Card className="bg-gradient-to-br from-slate-800/50 to-blue-900/30 border-slate-700/50 backdrop-blur-sm transition-all duration-300 shadow-2xl">
            <CardHeader className="pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-white mb-2">Smart AI Responses</CardTitle>
              <CardDescription className="text-slate-300 leading-relaxed">
                Advanced AI technology with OCR capabilities processes documents, images, and texts to provide accurate, contextual answers.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-purple-900/30 border-slate-700/50 backdrop-blur-sm transition-all duration-300 shadow-2xl">
            <CardHeader className="pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-white mb-2">Comprehensive Knowledge</CardTitle>
              <CardDescription className="text-slate-300 leading-relaxed">
                Complete campus information including departments, faculty, schedules, events, and facilities with multi-language support.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/50 to-green-900/30 border-slate-700/50 backdrop-blur-sm transition-all duration-300 shadow-2xl">
            <CardHeader className="pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-white mb-2">Real-time Updates</CardTitle>
              <CardDescription className="text-slate-300 leading-relaxed">
                Faculty can instantly update information, upload documents with OCR processing for immediate AI integration.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Current User Info */}
        {user && profile && (
          <Card className="max-w-lg mx-auto bg-gradient-to-br from-slate-800/50 to-blue-900/30 border-slate-700/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white mb-2">Welcome back!</CardTitle>
              <CardDescription className="text-slate-300">
                <strong className="text-blue-400">{profile.full_name}</strong>
                <br />
                <span className="inline-flex items-center mt-2">
                  {profile.user_type === 'faculty' ? (
                    <>
                      <Users className="h-4 w-4 text-purple-400 mr-1" />
                      <span className="text-purple-400">Faculty Member</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="h-4 w-4 text-blue-400 mr-1" />
                      <span className="text-blue-400">Student</span>
                    </>
                  )}
                  <span className="text-slate-400 ml-2">• {profile.email}</span>
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => profile.user_type === 'faculty' ? navigate('/faculty-dashboard') : navigate('/chat')} 
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 text-lg shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                {profile.user_type === 'faculty' ? 'Open Faculty Dashboard' : 'Open Chat Bot'}
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Index;
