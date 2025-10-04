import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, fileName, fileType, recordId } = await req.json();
    
    if (!fileUrl || !fileName || !fileType || !recordId) {
      throw new Error('Missing required parameters');
    }

    console.log('Processing document:', { fileName, fileType, recordId });

    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');
    
    if (!mistralApiKey) {
      console.log('Mistral API key not configured, skipping OCR processing');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Document uploaded successfully. OCR processing not configured.',
        parsedLength: 0,
        aiProcessed: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client at the start
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Only process image and PDF files
    const processableTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    
    if (!processableTypes.includes(fileType)) {
      console.log('File type not processable for OCR:', fileType);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Document uploaded successfully. File type does not require OCR.',
        parsedLength: 0,
        aiProcessed: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      console.log('Fetching file from storage:', fileUrl);
      
      // Extract the path from the full URL
      const urlParts = fileUrl.split('/storage/v1/object/public/college-documents/');
      if (urlParts.length !== 2) {
        throw new Error('Invalid file URL format');
      }
      const filePath = urlParts[1];
      
      // Use Supabase client to download the file with proper authentication
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from('college-documents')
        .download(filePath);
      
      if (downloadError || !fileData) {
        console.error('Download error:', downloadError);
        throw new Error('Failed to download file from storage');
      }

      console.log('File downloaded successfully, size:', fileData.size);
      const base64Data = await blobToBase64(fileData);

      console.log('Calling Mistral Pixtral for OCR...');
      
      // Use Mistral Pixtral for OCR and document understanding
      const mistralResponse = await fetch(
        'https://api.mistral.ai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mistralApiKey}`
          },
          body: JSON.stringify({
            model: 'pixtral-12b-2409',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'You are an expert OCR system. Extract ALL text, data, and information from this document with maximum accuracy. Requirements:\n\n1. Extract EVERY word, number, and detail visible\n2. Preserve exact structure: tables, lists, headings, sections\n3. For timetables/schedules: maintain exact time slots, subjects, rooms, faculty names\n4. For forms/documents: extract all fields, labels, and values\n5. For images with text: perform OCR on all visible text\n6. Organize the output in a clear, structured format\n7. Use markdown formatting for better readability (headings with #, tables with |, lists with -)\n\nBe thorough and precise - extract everything you can see.'
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: base64Data
                    }
                  }
                ]
              }
            ],
            max_tokens: 2000
          })
        }
      );

      if (!mistralResponse.ok) {
        const errorText = await mistralResponse.text();
        console.error('Mistral OCR error:', mistralResponse.status, errorText);
        throw new Error('Mistral OCR processing failed');
      }

      const mistralData = await mistralResponse.json();
      const extractedText = mistralData.choices?.[0]?.message?.content || '';

      console.log('OCR extraction completed, length:', extractedText.length);

      // Update the database with parsed content (reuse supabase client)
      const { error: updateError } = await supabase
        .from('college_data')
        .update({ parsed_content: extractedText })
        .eq('id', recordId);

      if (updateError) {
        console.error('Failed to update parsed content:', updateError);
        throw new Error('Failed to save OCR results');
      }

      console.log('Successfully saved OCR results to database');

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Document processed successfully with OCR.',
        parsedLength: extractedText.length,
        aiProcessed: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (ocrError) {
      console.error('OCR processing error:', ocrError);
      const errorMessage = ocrError instanceof Error ? ocrError.message : 'OCR processing failed';
      
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Document uploaded but OCR processing failed.',
        error: errorMessage,
        aiProcessed: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in process-document function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to convert blob to base64 data URL
async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(arrayBuffer)
      .reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  return `data:${blob.type};base64,${base64}`;
}
