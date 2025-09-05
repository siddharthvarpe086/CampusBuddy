import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NavigationBar } from '@/components/ui/navigation-bar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Plus, 
  Database, 
  Users, 
  Building, 
  Calendar,
  MapPin,
  Phone,
  Save,
  Loader2,
  Trash2
} from 'lucide-react';

interface CollegeData {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[] | null;
  created_at: string;
}

const CATEGORIES = [
  'Departments',
  'Faculty',
  'Labs',
  'Events',
  'Facilities',
  'Contact Information',
  'Academic Programs',
  'Library',
  'Other'
];

export default function FacultyDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [collegeData, setCollegeData] = useState<CollegeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    tags: ''
  });

  // Redirect if not authenticated or not faculty
  useEffect(() => {
    if (!user) {
      navigate('/faculty-auth');
      return;
    }
    if (profile && profile.user_type !== 'faculty') {
      navigate('/');
      return;
    }
  }, [user, profile, navigate]);

  // Fetch existing college data
  useEffect(() => {
    fetchCollegeData();
  }, []);

  const fetchCollegeData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('college_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollegeData(data || []);
    } catch (error) {
      console.error('Error fetching college data:', error);
      toast({
        title: "Error",
        description: "Failed to load college data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : null;

      const { error } = await supabase
        .from('college_data')
        .insert([
          {
            title: formData.title,
            category: formData.category,
            content: formData.content,
            tags: tags,
            created_by: user?.id
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "College data added successfully!",
      });

      // Reset form
      setFormData({
        title: '',
        category: '',
        content: '',
        tags: ''
      });

      // Refresh data
      fetchCollegeData();
    } catch (error) {
      console.error('Error adding college data:', error);
      toast({
        title: "Error",
        description: "Failed to add college data.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('college_data')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Data deleted successfully!",
      });

      fetchCollegeData();
    } catch (error) {
      console.error('Error deleting data:', error);
      toast({
        title: "Error",
        description: "Failed to delete data.",
        variant: "destructive"
      });
    }
  };


  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar 
        title="Faculty Dashboard" 
        showBack 
      />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-campus rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground font-poppins mb-2">
            Faculty Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome, <strong>{profile.full_name}</strong>. Manage college data to train the AI model.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add New Data Form */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins">
                <Plus className="h-5 w-5" />
                Add College Data
              </CardTitle>
              <CardDescription>
                Add information that the AI will use to answer student questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Computer Lab Location"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="transition-smooth"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Detailed information about this topic..."
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    className="min-h-32 transition-smooth"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (optional)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., lab, computer, second floor (comma-separated)"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="transition-smooth"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full gradient-campus hover:opacity-90 transition-smooth"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Data...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Add Data
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Data List */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins">
                <BookOpen className="h-5 w-5" />
                Existing College Data
              </CardTitle>
              <CardDescription>
                Manage existing data entries ({collegeData.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading data...</p>
                </div>
              ) : collegeData.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No college data added yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your first entry to get started!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {collegeData.map((item) => (
                    <div key={item.id} className="border border-border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <Button
                          onClick={() => handleDelete(item.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.content}
                      </p>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
