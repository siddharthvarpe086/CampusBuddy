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

    // Fetch all college data to provide comprehensive context
    const { data: collegeData, error: dbError } = await supabase
      .from('college_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to fetch college data');
    }

    // Prepare context from all college data
    const context = collegeData?.map((item: CollegeData) => {
      const tags = item.tags ? item.tags.join(', ') : '';
      return `Title: ${item.title}\nCategory: ${item.category}\nContent: ${item.content}\nTags: ${tags}\n---`;
    }).join('\n\n') || '';

    // Get Gemini API key
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Prepare the system prompt for Gemini
    const systemPrompt = `You are a helpful college information assistant. You have access to comprehensive college data including faculty information, contact details, departments, events, timings, and other college-related information.

Your task is to analyze the provided college data and answer student questions accurately and helpfully. Here's what you should do:

1. Always search through ALL the provided college data to find relevant information
2. If you find specific information requested, provide it directly and clearly
3. If you find partial matches, use your intelligence to provide the most relevant information
4. If someone asks for contact info, provide phone numbers, emails, departments, or any available contact details
5. Be conversational and helpful, not robotic
6. If you truly cannot find the requested information in the college data, politely say so and suggest alternatives
7. For faculty queries, search by name variations, department, or subject they teach
8. Provide comprehensive answers when multiple details are available

College Data:
${context}

Remember: Use ALL the information above to provide intelligent, contextual responses. Don't just return search results - analyze and synthesize the information to give helpful answers.`;

    // Call Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemPrompt
              }
            ]
          },
          {
            parts: [
              {
                text: `Student Question: ${message}`
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