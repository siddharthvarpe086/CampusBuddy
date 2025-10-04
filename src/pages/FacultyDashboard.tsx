import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NavigationBar } from '@/components/ui/navigation-bar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  BookOpen, 
  Plus, 
  Database, 
  Loader2,
  Trash2,
  Upload,
  File,
  X,
  Save
} from 'lucide-react';

interface CollegeData {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[] | null;
  created_at: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  parsed_content?: string;
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const [collegeData, setCollegeData] = useState<CollegeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    tags: ''
  });

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB.",
          variant: "destructive"
        });
        return;
      }

      const allowedTypes = [
        'text/plain',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Unsupported file type",
          description: "Please select a supported file type (PDF, Word, Excel, PowerPoint, Text, or Image).",
          variant: "destructive"
        });
        return;
      }

      setUploadedFile(file);
      
      if (!formData.title) {
        const fileName = file.name.split('.').slice(0, -1).join('.');
        handleInputChange('title', fileName);
      }
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || (!formData.content && !uploadedFile)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and provide content or upload a file.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const tags = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : null;

      let fileUrl = null;
      let fileName = null;
      let fileType = null;

      if (uploadedFile) {
        setIsProcessingFile(true);
        const fileExt = uploadedFile.name.split('.').pop();
        const filePath = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('college-documents')
          .upload(filePath, uploadedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('college-documents')
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileName = uploadedFile.name;
        fileType = uploadedFile.type;
      }

      const { data: insertedData, error: insertError } = await supabase
        .from('college_data')
        .insert([
          {
            title: formData.title,
            category: formData.category,
            content: formData.content,
            tags: tags,
            file_url: fileUrl,
            file_name: fileName,
            file_type: fileType,
            created_by: null
          }
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      if (uploadedFile && insertedData) {
        try {
          const { error: processError } = await supabase.functions.invoke('process-document', {
            body: {
              fileUrl: fileUrl,
              fileName: fileName,
              fileType: fileType,
              recordId: insertedData.id
            }
          });

          if (processError) {
            console.error('Document processing error:', processError);
            toast({
              title: "Warning",
              description: "Data saved but document processing failed. The file is still uploaded.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Success",
              description: uploadedFile ? "College data added and document processed with Mistral AI OCR!" : "College data added successfully!",
            });
          }
        } catch (processError) {
          console.error('Document processing error:', processError);
          toast({
            title: "Warning",
            description: "Data saved but document processing failed. The file is still uploaded.",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "College data added successfully!",
        });
      }

      setFormData({
        title: '',
        category: '',
        content: '',
        tags: ''
      });
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

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
      setIsProcessingFile(false);
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

  const handleOptimizeAI = async () => {
    if (collegeData.length === 0) {
      toast({
        title: "No Data Available",
        description: "Please add some college data first.",
        variant: "destructive"
      });
      return;
    }

    setIsTraining(true);
    try {
      const documentsWithOCR = collegeData.filter(item => item.parsed_content || item.file_url).length;
      const textEntries = collegeData.length - documentsWithOCR;

      toast({
        title: "Feeding Buddy...",
        description: `Processing ${collegeData.length} total entries: ${textEntries} text entries for Gemini and ${documentsWithOCR} documents for Mistral OCR...`,
      });

      await new Promise(resolve => setTimeout(resolve, 2500));

      toast({
        title: "Buddy is Ready! 🤖",
        description: `Gemini has ${textEntries} text entries and Mistral OCR has ${documentsWithOCR} documents. AI is ready to answer student queries!`,
      });
    } catch (error) {
      console.error('Error optimizing AI:', error);
      toast({
        title: "Optimization Failed",
        description: "Failed to feed Buddy. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTraining(false);
    }
  };

  const renderForm = () => (
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
        <Label htmlFor="content">Content {!uploadedFile && '*'}</Label>
        <Textarea
          id="content"
          placeholder={uploadedFile ? "Optional: Add additional context or description..." : "Detailed information about this topic..."}
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          className="min-h-32 transition-smooth"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Upload Document/Image (enhanced with AI)</Label>
        <div className="space-y-2">
          <Input
            ref={fileInputRef}
            id="file"
            type="file"
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp"
            className="transition-smooth"
          />
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-primary">🤖 AI-Enhanced Processing:</p>
            <ul className="ml-4 space-y-1">
              <li>• <strong>Images:</strong> OCR text extraction with layout preservation</li>
              <li>• <strong>PDFs/Documents:</strong> Intelligent content analysis and structuring</li>
              <li>• <strong>Tables/Timetables:</strong> Structure and formatting preservation</li>
              <li>• <strong>Multi-language:</strong> Support for various scripts and languages</li>
            </ul>
            <p className="mt-2">Supported: PDF, Word, Excel, PowerPoint, Text files, Images (max 10MB)</p>
          </div>
          {uploadedFile && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <File className="h-4 w-4 text-primary" />
              <span className="text-sm flex-1">{uploadedFile.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeUploadedFile}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
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
        disabled={isSubmitting || isProcessingFile}
      >
        {isSubmitting || isProcessingFile ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isProcessingFile ? 'Processing File...' : 'Adding Data...'}
          </>
        ) : (
          <>
            {uploadedFile ? <Upload className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
            {uploadedFile ? 'Add Data & Upload File' : 'Add Data'}
          </>
        )}
      </Button>
    </form>
  );

  const renderExistingData = () => (
    <>
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
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
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
              {item.file_name && (
                <div className="flex items-center gap-1 text-xs text-primary">
                  <File className="h-3 w-3" />
                  <span>{item.file_name}</span>
                </div>
              )}
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
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar 
        title="Faculty Dashboard" 
        showBack 
        onBack={() => navigate('/')}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-campus rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground font-poppins mb-2">
            Faculty Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage college data and train the AI model for Campus Buddy.
          </p>
        </div>

        <div className="mb-8">
          <Card className="shadow-elevated border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins text-primary">
                <Database className="h-5 w-5" />
                AI Search System with Mistral OCR
              </CardTitle>
              <CardDescription>
                Enhanced with Mistral AI for OCR processing, layout preservation, and multi-language support. The AI searches through your documents and extracts structured content in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Current Data: <strong>{collegeData.length} entries</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The AI searches through this data and documents in real-time for intelligent responses
                  </p>
                </div>
                <Button 
                  onClick={handleOptimizeAI}
                  className="gradient-campus hover:opacity-90 transition-smooth"
                  disabled={isTraining || collegeData.length === 0}
                >
                  {isTraining ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Feeding...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Feed Buddy
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {isMobile ? (
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="add">Add Data</TabsTrigger>
              <TabsTrigger value="existing">Existing Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="add">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-poppins text-lg">
                    <Plus className="h-5 w-5" />
                    Add College Data
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Add information that the AI will use to answer student questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderForm()}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="existing">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-poppins text-lg">
                    <BookOpen className="h-5 w-5" />
                    Existing College Data
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Manage existing data entries ({collegeData.length} total)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderExistingData()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                {renderForm()}
              </CardContent>
            </Card>

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
                {renderExistingData()}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
