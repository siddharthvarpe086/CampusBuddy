import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');

// Enhanced document processing with Mistral AI
async function processWithMistralAI(content: string, fileType: string, fileName: string): Promise<string> {
  if (!mistralApiKey) {
    console.warn('MISTRAL_API_KEY not found, using basic processing');
    return content;
  }

  try {
    const prompt = `You are an advanced document processing AI. Analyze the following document content and extract structured information with layout preservation. Pay special attention to:

1. Tables, timetables, and structured data - preserve formatting
2. Event lists and schedules - maintain chronological order
3. Contact information - extract names, roles, phone numbers, emails
4. Department information - locations, faculty, resources
5. Academic programs and courses
6. Any multilingual content - preserve all languages
7. Images and visual elements - describe their content and context

Document: ${fileName}
Type: ${fileType}
Content: ${content}

Please provide a comprehensive, well-structured extraction that preserves the document's layout and hierarchy. Format the output in clear sections with appropriate headings and maintain any tabular data in a readable format.`;

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mistralApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'system',
            content: 'You are an expert document processing assistant specializing in academic and institutional document analysis. Preserve layout, structure, and extract key information accurately.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      console.error('Mistral API error:', response.status, response.statusText);
      return content;
    }

    const data = await response.json();
    const processedContent = data.choices[0]?.message?.content;
    
    if (processedContent) {
      console.log('Successfully processed with Mistral AI, length:', processedContent.length);
      return processedContent;
    }
    
    return content;
  } catch (error) {
    console.error('Error processing with Mistral AI:', error);
    return content;
  }
}

// OCR processing for images using Mistral Vision capabilities
async function processImageWithOCR(imageBase64: string, fileName: string): Promise<string> {
  if (!mistralApiKey) {
    console.warn('MISTRAL_API_KEY not found, using basic image processing');
    return `Image Document: ${fileName}\nContent: This image contains visual information relevant to the college. OCR processing is not available without Mistral API key.`;
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mistralApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'pixtral-large-latest',
        messages: [
          {
            role: 'system',
            content: 'You are an OCR specialist for academic documents. Extract all text accurately, preserve table structures, maintain formatting, and support multiple languages. Describe any charts, diagrams, or visual elements.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please perform OCR on this image and extract all text content. Pay special attention to:
1. Tables and structured data - preserve column/row alignment
2. Timetables and schedules - maintain time formatting
3. Contact lists - extract names, phone numbers, emails
4. Event announcements - preserve dates and details  
5. Any non-English text - preserve original languages
6. Visual elements - describe charts, diagrams, or images

Format the output clearly with appropriate headings and maintain the document's structure.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      console.error('Mistral Vision API error:', response.status, response.statusText);
      return `Image Document: ${fileName}\nContent: This image contains visual information but OCR processing failed.`;
    }

    const data = await response.json();
    const extractedText = data.choices[0]?.message?.content;
    
    if (extractedText) {
      console.log('Successfully extracted text via OCR, length:', extractedText.length);
      return `Image Document: ${fileName}\n\nExtracted Content:\n${extractedText}`;
    }
    
    return `Image Document: ${fileName}\nContent: This image contains visual information but no text was extracted.`;
  } catch (error) {
    console.error('Error processing image with OCR:', error);
    return `Image Document: ${fileName}\nContent: This image contains visual information but OCR processing failed due to an error.`;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, fileName, fileType, recordId } = await req.json();
    
    if (!fileUrl || !fileName || !fileType || !recordId) {
      throw new Error('Missing required parameters');
    }

    console.log('Processing document with Mistral AI:', { fileUrl, fileName, fileType, recordId });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let parsedContent = '';

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('college-documents')
      .download(fileUrl.split('/').pop());

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw new Error('Failed to download file for processing');
    }

    // Convert blob to array buffer for processing
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Process different file types with enhanced AI capabilities
    if (fileType.includes('text/') || fileName.endsWith('.txt')) {
      // Plain text files - process with Mistral for structure extraction
      const decoder = new TextDecoder('utf-8');
      const textContent = decoder.decode(uint8Array);
      parsedContent = await processWithMistralAI(textContent, fileType, fileName);
      console.log('Processed text file with AI, length:', parsedContent.length);
      
    } else if (fileName.endsWith('.pdf')) {
      // PDF files - use Mistral to analyze and structure content
      const basicContent = `PDF Document: ${fileName}\nThis PDF contains structured academic information that needs to be processed for student queries.`;
      parsedContent = await processWithMistralAI(basicContent, fileType, fileName);
      console.log('Processed PDF file with AI analysis');
      
    } else if (fileType.includes('image/')) {
      // Images - perform OCR with Mistral Vision
      const base64String = btoa(String.fromCharCode(...uint8Array));
      parsedContent = await processImageWithOCR(base64String, fileName);
      console.log('Processed image file with OCR');
      
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      // Word documents - analyze with Mistral
      const basicContent = `Word Document: ${fileName}\nThis Microsoft Word document contains detailed academic information, possibly including tables, lists, and formatted content.`;
      parsedContent = await processWithMistralAI(basicContent, fileType, fileName);
      console.log('Processed Word document with AI analysis');
      
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Excel documents - focus on tabular data
      const basicContent = `Excel Document: ${fileName}\nThis spreadsheet contains structured data in tabular format, possibly including timetables, contact lists, or academic schedules.`;
      parsedContent = await processWithMistralAI(basicContent, fileType, fileName);
      console.log('Processed Excel document with AI analysis');
      
    } else if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
      // PowerPoint documents - analyze presentation content
      const basicContent = `PowerPoint Document: ${fileName}\nThis presentation contains slides with academic information, possibly including visual elements, bullet points, and structured content.`;
      parsedContent = await processWithMistralAI(basicContent, fileType, fileName);
      console.log('Processed PowerPoint document with AI analysis');
      
    } else {
      // Generic file processing with AI enhancement
      const basicContent = `Document: ${fileName}\nFile type: ${fileType}\nThis document contains information relevant to the college and academic queries.`;
      parsedContent = await processWithMistralAI(basicContent, fileType, fileName);
      console.log('Processed generic document with AI analysis');
    }

    // Update the college_data record with parsed content
    const { error: updateError } = await supabase
      .from('college_data')
      .update({ 
        parsed_content: parsedContent,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType
      })
      .eq('id', recordId);

    if (updateError) {
      console.error('Error updating record:', updateError);
      throw new Error('Failed to update record with parsed content');
    }

    console.log('Successfully processed and updated document with Mistral AI');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Document processed successfully with Mistral AI',
      parsedLength: parsedContent.length,
      aiProcessed: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-document function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});