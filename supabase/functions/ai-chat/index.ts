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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Received message:', message);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all college data including parsed content from documents
    const { data: collegeData, error: dbError } = await supabase
      .from('college_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to fetch college data');
    }

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

    // Build comprehensive context from all college data
    const context = collegeData?.map((item: CollegeData) => {
      const tags = item.tags ? item.tags.join(', ') : '';
      let contextStr = `Title: ${item.title}\nCategory: ${item.category}\nContent: ${item.content}\nTags: ${tags}`;
      
      if (item.parsed_content) {
        contextStr += `\nDocument Content: ${item.parsed_content}`;
      }
      
      if (item.file_name) {
        contextStr += `\nAttached File: ${item.file_name} (${item.file_type || 'unknown type'})`;
      }
      
      return contextStr + '\n---';
    }).join('\n\n') || '';

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

    // System prompt for Gemini
    const systemPrompt = `You are CampusBuddy, a professional campus assistant for college students. Your role is to help students by answering their questions based ONLY on the college database provided.

CRITICAL RULES:
1. ONLY answer questions related to college, academics, campus events, facilities, and college-related activities
2. If a question is NOT related to college, politely refuse and say: "I can only help with college-related questions. Please ask me about academics, campus events, facilities, or college activities."
3. Do NOT redirect non-college questions to SyncSpot
4. If a question IS college-related but you cannot find the answer in the database, respond with: "I don't have this information in my database. This question will be posted to SyncSpot where the community can help answer it."
5. Use simple, clear, professional English
6. Format important information in **bold** (use double asterisks, not single asterisks)
7. Keep answers concise and specific (2-4 sentences)
8. NEVER use single asterisks (*) in your output - always use double asterisks (**) for bold formatting
9. Answer in a friendly, helpful tone like a senior helping a junior

Database Content:
${fullContext || 'No college data available yet.'}`;

    console.log('Calling Gemini API with google/gemini-2.0-flash-exp model...');

    try {
      // Primary: Try Gemini first
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${systemPrompt}\n\nStudent Question: ${message}`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            }
          })
        }
      );

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error('Gemini API error:', geminiResponse.status, errorText);
        throw new Error('Gemini API failed');
      }

      const geminiData = await geminiResponse.json();
      console.log('Gemini response received:', geminiData);

      if (geminiData.candidates && geminiData.candidates[0]?.content?.parts?.[0]?.text) {
        let responseText = geminiData.candidates[0].content.parts[0].text;
        
        // Remove any remaining single asterisks and fix formatting
        responseText = responseText.replace(/(?<!\*)\*(?!\*)/g, '');
        
        // Check if Gemini indicates it doesn't have the answer
        const noAnswerPhrases = [
          "don't have this information",
          "cannot find",
          "not available in",
          "no information about",
          "syncspot"
        ];
        
        const isCollegeRelated = !responseText.toLowerCase().includes("only help with college-related");
        const hasNoAnswer = noAnswerPhrases.some(phrase => 
          responseText.toLowerCase().includes(phrase.toLowerCase())
        );

        if (isCollegeRelated && hasNoAnswer) {
          // College-related question but no answer found - redirect to SyncSpot
          return new Response(JSON.stringify({ 
            response: "I don't have information about this in my database. Let me redirect this question to **SyncSpot** where the community can help answer it.",
            redirect: 'syncspot'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          response: responseText,
          source: 'gemini'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error('Invalid response from Gemini');

    } catch (geminiError) {
      console.error('Gemini failed, trying Mistral as fallback:', geminiError);
      
      // Fallback: Try Mistral if Gemini fails
      if (mistralApiKey) {
        try {
          const mistralResponse = await fetch(
            'https://api.mistral.ai/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mistralApiKey}`
              },
              body: JSON.stringify({
                model: 'mistral-large-latest',
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 500
              })
            }
          );

          if (!mistralResponse.ok) {
            throw new Error('Mistral API also failed');
          }

          const mistralData = await mistralResponse.json();
          let responseText = mistralData.choices?.[0]?.message?.content || 'No response generated';
          
          // Remove single asterisks
          responseText = responseText.replace(/(?<!\*)\*(?!\*)/g, '');

          const isCollegeRelated = !responseText.toLowerCase().includes("only help with college-related");
          const hasNoAnswer = ['don\'t have', 'cannot find', 'syncspot'].some(phrase => 
            responseText.toLowerCase().includes(phrase)
          );

          if (isCollegeRelated && hasNoAnswer) {
            return new Response(JSON.stringify({ 
              response: "I don't have information about this in my database. Let me redirect this question to **SyncSpot** where the community can help answer it.",
              redirect: 'syncspot',
              source: 'mistral'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify({ 
            response: responseText,
            source: 'mistral'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });

        } catch (mistralError) {
          console.error('Both Gemini and Mistral failed:', mistralError);
          throw new Error('All AI services are currently unavailable');
        }
      }

      throw geminiError;
    }

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      response: "I'm having trouble accessing my knowledge base right now. Please try again later."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
