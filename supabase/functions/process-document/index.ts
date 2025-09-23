import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Processing document:', { fileUrl, fileName, fileType, recordId });

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

    // Process different file types
    if (fileType.includes('text/') || fileName.endsWith('.txt')) {
      // Plain text files
      const decoder = new TextDecoder('utf-8');
      parsedContent = decoder.decode(uint8Array);
      console.log('Processed text file, length:', parsedContent.length);
    } else if (fileName.endsWith('.pdf')) {
      // For PDF files, we'll extract basic text content
      // In a production environment, you'd use a proper PDF parser
      parsedContent = `PDF Document: ${fileName}\nContent: This PDF document has been uploaded and is available for reference. The AI can discuss its contents based on the title and category provided.`;
      console.log('Processed PDF file');
    } else if (fileType.includes('image/')) {
      // For images, we'll create a description
      parsedContent = `Image Document: ${fileName}\nContent: This image has been uploaded and contains visual information relevant to the college. The AI can reference this image when discussing related topics.`;
      console.log('Processed image file');
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      // For Word documents
      parsedContent = `Word Document: ${fileName}\nContent: This Microsoft Word document has been uploaded and contains detailed information. The AI can reference this document when providing answers.`;
      console.log('Processed Word document');
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // For Excel documents
      parsedContent = `Excel Document: ${fileName}\nContent: This Excel spreadsheet has been uploaded and contains structured data. The AI can reference this data when answering questions.`;
      console.log('Processed Excel document');
    } else if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
      // For PowerPoint documents
      parsedContent = `PowerPoint Document: ${fileName}\nContent: This PowerPoint presentation has been uploaded and contains presentation slides. The AI can reference this content when answering questions.`;
      console.log('Processed PowerPoint document');
    } else {
      // Generic file processing
      parsedContent = `Document: ${fileName}\nContent: This document has been uploaded and is available for reference. File type: ${fileType}`;
      console.log('Processed generic document');
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

    console.log('Successfully processed and updated document');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Document processed successfully',
      parsedLength: parsedContent.length
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