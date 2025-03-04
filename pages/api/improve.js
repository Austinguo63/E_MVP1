import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Get API key from environment variable
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Call the OpenAI API to improve the text
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using GPT-4o mini model
      messages: [
        {
          role: 'system',
          content: `You are an expert editor and writing improvement assistant. 
          Your task is to improve the given text to make it more professional, clear, and impactful.
          Keep your response brief, no more than 200 words total.
          Provide the improved version of the text along with 1-2 brief suggestions for further improvements.
          Your response should be in JSON format with the following structure:
          {
            "improved": "The improved text goes here",
            "suggestions": ["Suggestion 1", "Suggestion 2"]
          }`
        },
        {
          role: 'user',
          content: `Please improve the following text (keep it brief):\n\n${text}`
        }
      ],
      temperature: 0.7,
      max_tokens: 200, // Limiting to 200 tokens (approximately 150-200 words) to save API fees
      response_format: { type: 'json_object' }
    });

    // Extract the content from the response
    const content = completion.choices[0]?.message?.content || '';
    
    // Parse the JSON response
    let responseData;
    try {
      responseData = JSON.parse(content);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      // Fallback in case the response is not valid JSON
      responseData = {
        improved: content,
        suggestions: ['考虑添加更多具体数据支持您的观点', '可以进一步阐述实施细节', '建议增加一个实际案例来说明']
      };
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error improving text:', error);
    return res.status(500).json({ error: 'Failed to improve text' });
  }
}
