import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NavigationBar } from '@/components/ui/navigation-bar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageSquare, 
  Users, 
  Trash2, 
  Send,
  Clock,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import syncspotLogo from '@/assets/syncspot-logo.png';

interface Question {
  id: string;
  question: string;
  user_id: string;
  created_at: string;
  answers: Answer[];
}

interface Answer {
  id: string;
  answer: string;
  user_id: string;
  created_at: string;
}

export default function SyncSpot() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newAnswer, setNewAnswer] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchQuestions();
  }, [user, navigate]);

  const fetchQuestions = async () => {
    try {
      const { data: questionsData, error: questionsError } = await supabase
        .from('syncspot_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (questionsError) throw questionsError;

      const { data: answersData, error: answersError } = await supabase
        .from('syncspot_answers')
        .select('*')
        .order('created_at', { ascending: true });

      if (answersError) throw answersError;

      const questionsWithAnswers = questionsData?.map(question => ({
        ...question,
        answers: answersData?.filter(answer => answer.question_id === question.id) || []
      })) || [];

      setQuestions(questionsWithAnswers);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (questionId: string) => {
    const answerText = newAnswer[questionId]?.trim();
    if (!answerText || !user) return;

    try {
      const { error } = await supabase
        .from('syncspot_answers')
        .insert([{
          question_id: questionId,
          answer: answerText,
          user_id: user.id
        }]);

      if (error) throw error;

      setNewAnswer(prev => ({ ...prev, [questionId]: '' }));
      fetchQuestions();
      
      toast({
        title: "Success",
        description: "Your answer has been submitted!",
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: "Error",
        description: "Failed to submit answer",
        variant: "destructive"
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from('syncspot_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;

      fetchQuestions();
      
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive"
      });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString([], { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!user || !profile) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col page-enter">
      <NavigationBar 
        title="SyncSpot" 
        showBack 
        onBack={() => navigate('/chat')}
      />
      
      <div className="flex-1 max-w-4xl mx-auto w-full p-6">
        {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-full blur-xl"></div>
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 p-1 shadow-lg">
                  <img src={syncspotLogo} alt="SyncSpot" className="w-full h-full rounded-full object-cover" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-foreground font-poppins">
                SyncSpot
              </h1>
            </div>
          <p className="text-lg text-muted-foreground">
            Community Q&A - Students helping students
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Questions that couldn't be answered by Campus Buddy appear here for peer collaboration
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
            <p className="text-muted-foreground">
              Questions that Campus Buddy can't answer will appear here for the community to help with.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {questions.map((question) => (
              <Card key={question.id} className="p-6 shadow-lg">
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Student Question</span>
                      <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                      <span className="text-sm text-muted-foreground">
                        {formatTime(question.created_at)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {question.question}
                    </h3>
                  </div>
                  
                  {user.id === question.user_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Answers */}
                {question.answers.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        Community Answers ({question.answers.length})
                      </span>
                    </div>
                    <div className="space-y-3">
                      {question.answers.map((answer) => (
                        <div key={answer.id} className="bg-muted/30 rounded-lg p-3 border-l-4 border-primary">
                          <p className="text-foreground mb-2">{answer.answer}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(answer.created_at)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Answer Input */}
                <div className="border-t pt-4">
                  <div className="flex gap-3">
                    <Textarea
                      placeholder="Share your answer to help the community..."
                      value={newAnswer[question.id] || ''}
                      onChange={(e) => setNewAnswer(prev => ({ 
                        ...prev, 
                        [question.id]: e.target.value 
                      }))}
                      className="flex-1 min-h-[80px] resize-none"
                    />
                    <Button
                      onClick={() => handleSubmitAnswer(question.id)}
                      disabled={!newAnswer[question.id]?.trim()}
                      className="self-end"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}