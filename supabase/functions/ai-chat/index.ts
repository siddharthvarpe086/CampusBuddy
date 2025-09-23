import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all college data including parsed document content
    const { data: collegeData, error: dbError } = await supabase
      .from('college_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to fetch college data');
    }

    // Fetch SyncSpot answers for additional context
    const { data: syncSpotData, error: syncSpotError } = await supabase
      .from('syncspot_questions')
      .select(`
        *,
        syncspot_answers (*)
      `)
      .order('created_at', { ascending: false });

    if (syncSpotError) {
      console.error('SyncSpot data error:', syncSpotError);
    }

    // Prepare context from all college data including documents
    const context = collegeData?.map((item: CollegeData) => {
      const tags = item.tags ? item.tags.join(', ') : '';
      let contextStr = `Title: ${item.title}\nCategory: ${item.category}\nContent: ${item.content}\nTags: ${tags}`;
      
      // Add parsed document content if available
      if (item.parsed_content) {
        contextStr += `\nDocument Content: ${item.parsed_content}`;
      }
      
      // Add file information if available
      if (item.file_name) {
        contextStr += `\nAttached File: ${item.file_name} (${item.file_type || 'unknown type'})`;
      }
      
      return contextStr + '\n---';
    }).join('\n\n') || '';

    // Add SyncSpot community answers to context
    const syncSpotContext = syncSpotData?.map((question: any) => {
      if (question.syncspot_answers && question.syncspot_answers.length > 0) {
        const answers = question.syncspot_answers.map((answer: any) => 
          `Answer: ${answer.answer}`
        ).join('\n');
        return `Community Q&A:\nQuestion: ${question.question}\n${answers}\n---`;
      }
      return '';
    }).filter(Boolean).join('\n\n') || '';

    const fullContext = [context, syncSpotContext].filter(Boolean).join('\n\n');

    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Prepare the prompt with college data context
    const prompt = `You are a helpful college information assistant with real-time access to comprehensive college data including faculty information, contact details, departments, events, timings, uploaded documents, and community-generated answers from students.

IMPORTANT: You do NOT store or remember this information. Instead, you search through the provided data in real-time for each question to find the most relevant and up-to-date answers.

Your task is to intelligently search and analyze the provided college data to answer student questions accurately:

1. SEARCH COMPREHENSIVELY: Look through ALL provided college data, including document content and community answers, to find relevant information
2. PRIORITIZE ACCURACY: If you find specific information requested, provide it directly and clearly
3. USE INTELLIGENCE: For partial matches, use your reasoning to provide the most relevant information
4. PROVIDE COMPLETE ANSWERS: Include contact info, phone numbers, emails, departments, and any available details when relevant
5. BE CONVERSATIONAL: Sound helpful and natural, not robotic
6. HANDLE DOCUMENTS: When referencing uploaded documents (PDFs, Word docs, images, etc.), mention that the information comes from official college documents
7. USE COMMUNITY KNOWLEDGE: When referencing community answers, acknowledge that the information comes from student community
8. ADMIT LIMITATIONS: If you cannot find the requested information in the current data, respond with exactly: "NO_INFO_AVAILABLE: [original question]"
9. SEARCH VARIATIONS: For faculty queries, search by name variations, department, subjects taught, or related keywords
10. SYNTHESIZE INFORMATION: Provide comprehensive answers by combining related information from multiple sources

College Data, Documents, and Community Answers:
${fullContext}

Remember: You are searching through this data in REAL-TIME for each question. You don't remember previous conversations or data - you search fresh each time to ensure accuracy and up-to-date responses.

Student Question: ${message}`;

    // Call Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    
    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
      console.error('Invalid Gemini response structure:', geminiData);
      throw new Error('Invalid response from Gemini API');
    }

    const aiResponse = geminiData.candidates[0].content.parts[0].text;

    // Check if AI couldn't find information and should redirect to SyncSpot
    if (aiResponse.startsWith('NO_INFO_AVAILABLE:')) {
      const question = aiResponse.replace('NO_INFO_AVAILABLE:', '').trim();
      return new Response(JSON.stringify({ noAnswer: true, question: question || message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "I'm sorry, I'm having trouble accessing my knowledge base right now. Please try again later or contact the college administration directly for assistance."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});