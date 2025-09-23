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

    // Get Mistral API key
    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');
    if (!mistralApiKey) {
      throw new Error('Mistral API key not configured');
    }

    // Process different file types using Mistral AI OCR
    if (fileType.includes('text/') || fileName.endsWith('.txt')) {
      // Plain text files - decode directly
      const decoder = new TextDecoder('utf-8');
      parsedContent = decoder.decode(uint8Array);
      console.log('Processed text file, length:', parsedContent.length);
    } else if (fileName.endsWith('.pdf') || fileType.includes('image/') || 
               fileName.endsWith('.docx') || fileName.endsWith('.doc') ||
               fileName.endsWith('.xlsx') || fileName.endsWith('.xls') ||
               fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
      
      // Use Mistral AI OCR for document content extraction
      try {
        // Convert to base64 for Mistral API
        const base64Data = btoa(String.fromCharCode(...uint8Array));
        const mimeType = fileType || 'application/octet-stream';
        
        console.log('Sending to Mistral AI OCR for processing...');
        
        const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mistralApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'pixtral-large-latest',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Please extract all text content from this document. Preserve the layout, structure, tables, lists, and formatting as much as possible. Extract text in multiple languages if present. Include any important visual elements or diagrams descriptions. Be comprehensive and accurate as students rely on this information for their education.

Document: ${fileName}
Type: ${fileType}

Please provide:
1. Complete text extraction
2. Structured layout preservation
3. Table data in readable format
4. Any important visual elements descriptions
5. Maintain original language and scripts`
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:${mimeType};base64,${base64Data}`
                    }
                  }
                ]
              }
            ],
            max_tokens: 4000,
            temperature: 0.1
          }),
        });

        if (!mistralResponse.ok) {
          console.error('Mistral API error:', await mistralResponse.text());
          throw new Error('Failed to process document with Mistral AI OCR');
        }

        const mistralData = await mistralResponse.json();
        
        if (mistralData.choices && mistralData.choices[0] && mistralData.choices[0].message) {
          parsedContent = `Document: ${fileName}\nType: ${fileType}\n\nExtracted Content (via Mistral AI OCR):\n\n${mistralData.choices[0].message.content}`;
          console.log('Successfully processed with Mistral AI OCR, content length:', parsedContent.length);
        } else {
          throw new Error('Invalid response from Mistral AI OCR');
        }
        
      } catch (mistralError) {
        console.error('Mistral AI processing failed:', mistralError);
        // Fallback to basic description
        parsedContent = `Document: ${fileName}\nType: ${fileType}\nContent: This document has been uploaded but could not be fully processed. The AI can reference this file when answering questions based on the title and category provided.`;
        console.log('Used fallback description due to Mistral AI error');
      }
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