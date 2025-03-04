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
    const { prompt, section, continueFrom } = req.body;

    // Create a system message based on the section
    const systemMessage = getSystemMessageForSection(section);
    
    // Create the messages array for the API call
    const messages = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: `Generate content for the "${section}" section of a business plan. ${prompt || ''}` }
    ];

    // If we're continuing from previous content, add it to the context
    if (continueFrom) {
      messages.push({ 
        role: 'assistant', 
        content: continueFrom 
      });
      messages.push({ 
        role: 'user', 
        content: 'Please continue from where you left off.' 
      });
    }

    // Call the OpenAI API with streaming enabled
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using GPT-4o mini model
      messages: messages,
      temperature: 0.7,
      max_tokens: 200, // Limiting to 200 tokens (approximately 150-200 words) to save API fees
      stream: true, // Enable streaming for flow generation
    });

    // Set up streaming response
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    let accumulatedContent = '';

    // Process the streaming response
    for await (const chunk of stream) {
      // Get the content from the chunk
      const content = chunk.choices[0]?.delta?.content || '';
      
      if (content) {
        accumulatedContent += content;
        
        // Send the chunk to the client
        res.write(`data: ${JSON.stringify({ content })}

`);
      }
    }

    // Check if we need to add a citation for this section
    const citation = getCitationForSection(section);
    
    // Send the end of stream message with any citation
    res.write(`data: ${JSON.stringify({ 
      done: true, 
      citation: citation 
    })}

`);
    
    res.end();
  } catch (error) {
    console.error('Error generating content:', error);
    
    // If the response has already started, we need to end it properly
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: error.message })}

`);
      res.end();
    } else {
      return res.status(500).json({ error: 'Failed to generate content' });
    }
  }
}

// Helper function to get the appropriate system message for each section
function getSystemMessageForSection(section) {
  const systemMessages = {
    '项目背景': 'You are an expert business consultant helping to write the Background section of a business plan. Provide comprehensive context about the market situation, problem being solved, and the opportunity. Include relevant historical context and current trends.',
    '市场分析': 'You are a market research analyst. Provide detailed market analysis with specific data points, growth trends, and market size information. Include information about market segments, target customers, and competitive landscape. Always include specific percentages, numbers, and growth rates.',
    '商业模式': 'You are a business model expert. Describe a comprehensive business model including revenue streams, pricing strategy, customer acquisition channels, and value proposition. Be specific about how the business will make money.',
    '财务预测': 'You are a financial analyst. Create realistic financial projections including revenue forecasts, cost structure, break-even analysis, and funding requirements. Use specific numbers and timeframes.',
    '风险分析': 'You are a risk management consultant. Identify potential risks and challenges the business might face, along with mitigation strategies. Consider market risks, operational risks, financial risks, and regulatory risks.',
    '团队介绍': 'You are an HR consultant. Create compelling team descriptions highlighting relevant experience, skills, and achievements of key team members. Emphasize how the team\'s background makes them uniquely qualified for this venture.',
    '发展规划': 'You are a strategic planning expert. Outline a clear roadmap for business growth with specific milestones, timelines, and objectives. Include short-term, medium-term, and long-term goals.'
  };
  
  return systemMessages[section] || 'You are helping to write a professional business plan. Provide detailed, well-structured content.';
}

// Helper function to get citations for sections that need them
function getCitationForSection(section) {
  const citations = {
    '市场分析': {
      text: 'IMF 2024 报告',
      url: 'https://www.imf.org/reports'
    },
    '财务预测': {
      text: 'McKinsey Global Institute Analysis 2024',
      url: 'https://www.mckinsey.com/mgi/overview'
    }
  };
  
  return citations[section] || null;
}
