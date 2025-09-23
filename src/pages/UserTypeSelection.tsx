import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  GraduationCap, 
  Users, 
  MessageSquare,
  Settings,
  BookOpen,
  Database
} from 'lucide-react';

const UserTypeSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl animate-bounce animation-duration-3000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30">
            <GraduationCap className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-6">
            Welcome to Campus Buddy
          </h1>
          
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Your AI-powered campus assistant for instant answers and comprehensive information
          </p>
          
          <div className="mt-8">
            <p className="text-lg text-slate-400">Choose your access type to continue</p>
          </div>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Student Portal Card */}
          <Card className="bg-gradient-to-br from-slate-800/50 to-blue-900/30 border-slate-700/50 backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/20">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-2">Student Portal</CardTitle>
              <CardDescription className="text-slate-300 text-base leading-relaxed">
                Get instant answers to your campus questions with our AI-powered chat assistant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-slate-300">
                  <BookOpen className="h-5 w-5 text-blue-400 mr-3" />
                  <span>Access comprehensive campus information</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <MessageSquare className="h-5 w-5 text-cyan-400 mr-3" />
                  <span>AI-powered instant responses</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <GraduationCap className="h-5 w-5 text-purple-400 mr-3" />
                  <span>Faculty contacts and departments</span>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/auth')} 
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-6 text-lg shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Enter Student Portal
              </Button>
            </CardContent>
          </Card>

          {/* Faculty Portal Card */}
          <Card className="bg-gradient-to-br from-slate-800/50 to-purple-900/30 border-slate-700/50 backdrop-blur-sm hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/20">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-2">Faculty Portal</CardTitle>
              <CardDescription className="text-slate-300 text-base leading-relaxed">
                Secure access to manage campus data and enhance the AI knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-slate-300">
                  <Database className="h-5 w-5 text-purple-400 mr-3" />
                  <span>Manage college information database</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <Settings className="h-5 w-5 text-pink-400 mr-3" />
                  <span>Upload and organize documents</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <Users className="h-5 w-5 text-indigo-400 mr-3" />
                  <span>Advanced content management</span>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/faculty-auth')} 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 text-lg shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
              >
                <Settings className="mr-2 h-5 w-5" />
                Access Faculty Portal
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom decorative elements */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-slate-400">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Powered by Advanced AI Technology</span>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;