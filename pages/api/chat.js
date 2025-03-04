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
    const { message, history = [] } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Format the conversation history for the API call
    const formattedHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Create the messages array with system prompt and history
    const messages = [
      {
        role: 'system',
        content: `You are an AI writing assistant helping with a business plan. 
        Provide helpful, concise, and actionable advice. 
        If the user asks for improvements or suggestions for specific sections, 
        provide detailed guidance tailored to that section.
        Always maintain a professional tone and focus on business value.`
      },
      ...formattedHistory,
      { role: 'user', content: message }
    ];

    // Call the OpenAI API with GPT-4o mini
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using GPT-4o mini model
      messages: [
        {
          role: 'system',
          content: `You are an AI writing assistant helping with a business plan. 
          Provide helpful, concise, and actionable advice. Keep responses under 200 words.
          If the user asks for improvements or suggestions for specific sections, 
          provide brief guidance tailored to that section.
          Always maintain a professional tone and focus on business value.`
        },
        ...formattedHistory,
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 200 // Limiting to 200 tokens (approximately 150-200 words) to save API fees
    });

    // Extract the response content
    const responseContent = completion.choices[0]?.message?.content || '';

    return res.status(200).json({ 
      message: responseContent,
      sender: 'ai'
    });
  } catch (error) {
    console.error('Error in chat:', error);
    return res.status(500).json({ error: 'Failed to process chat message' });
  }
}
