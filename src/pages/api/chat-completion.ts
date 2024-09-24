import { Message } from '@/models'
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'

export const config = {
  runtime: 'edge'
}

// Prompts

const initialSystemContent = `Your role is to determine if additional personal information is needed from the user to provide comprehensive finance advice based on their question. Do not attempt to answer the user's question. Instead:

1. If more information is required, respond with TWO specific questions to gather that personal information:
   a. Evaluate if the user's location (country) is crucial for answering their financial query. Only if it is both relevant and unknown, include a question about which country they are based in.
   b. The other question(s) should be directly related to the user's query and help clarify their financial situation.

2. When asking questions, present them in a single paragraph without numbering, like this:
   "What is your current annual income? Are you planning any major life changes in the next five years?"

3. If no additional personal information is needed, respond with only '0'.

Consider the conversation history and the following user information when making your decision:

Remember, your task is only to determine if more information is needed and ask for it if necessary. Do not provide financial advice or answer the user's original question. Always ask TWO questions when more information is needed, but only include the location question if it's truly necessary for providing accurate financial advice in this specific case.`

const classificationSystemContent = `
Your task is to classify finance-related queries based on whether they require recent internet data (within the last 12 months) to provide an accurate and complete answer. Use the following classification system:
3: Requires recent data (last 12 months) from the internet
2: Could benefit from recent data, but a general answer is possible without it
1: Does not require recent data

Guidelines:
- If the query explicitly asks for current or recent financial information, classify as 3.
- If the query is about ongoing economic events, market trends, or frequently changing financial data, classify as 3.
- If the query could be answered with general financial knowledge but recent data would enhance the answer, classify as 2.
- If the query is about historical financial events, general financial concepts, or timeless financial information, classify as 1.

Classify each query with only the number (3, 2, or 1) without additional explanation.`

const financeGPTPrompt = `You are a knowledgeable finance advisor. Provide clear, concise advice on personal finance topics like budgeting, investing, and debt management. Tailor your responses to the user's situation. If more information is needed, ask brief, specific questions. For complex issues, recommend professional consultation. Always aim for clarity and actionable advice.`

const perplexitySystemMessage = {
  role: "system",
  content: `You are a knowledgeable and helpful personal finance and wealth management agent. Your role is to provide comprehensive financial advice, answer questions, and offer recommendations to users based on their specific situations and queries. Use the most up-to-date information available to you.
  Key responsibilities:
  1. Provide clear, actionable financial advice tailored to the user's situation.
  2. Answer questions about various financial topics, including but not limited to: budgeting, saving, investing, retirement planning, taxes, insurance, and debt management.
  3. Offer recommendations for financial products or strategies when appropriate.
  4. Explain complex financial concepts in simple terms.
  5. If you need more information to provide accurate advice, ask the user specific, relevant questions.
  Guidelines:
  - Always consider the user's financial situation, goals, and risk tolerance when providing advice.
  - Be encouraging and supportive, but also realistic and honest about financial matters.
  - If you're unsure about something or if the question is beyond your scope (e.g., specific legal or tax advice), recommend consulting with a qualified professional.
  - Consider the conversation history when responding to ensure continuity and avoid repetition.
  - Provide the most current and up-to-date information available to you.
  Remember, your goal is to empower users to make informed financial decisions and improve their overall financial well-being.`
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { messages } = (await req.json()) as {
      messages: Message[]
    }

    const charLimit = 12000
    let charCount = 0
    let messagesToSend = []

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      if (charCount + message.content.length > charLimit) {
        break
      }
      charCount += message.content.length
      messagesToSend.push(message)
    }

    const useAzureOpenAI =
      process.env.AZURE_OPENAI_API_BASE_URL && process.env.AZURE_OPENAI_API_BASE_URL.length > 0

    let apiUrl: string
    let apiKey: string
    let model: string
    if (useAzureOpenAI) {
      let apiBaseUrl = process.env.AZURE_OPENAI_API_BASE_URL
      const version = '2024-02-01'
      const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || ''
      if (apiBaseUrl && apiBaseUrl.endsWith('/')) {
        apiBaseUrl = apiBaseUrl.slice(0, -1)
      }
      apiUrl = `${apiBaseUrl}/openai/deployments/${deployment}/chat/completions?api-version=${version}`
      apiKey = process.env.AZURE_OPENAI_API_KEY || ''
      model = '' // Azure Open AI always ignores the model and decides based on the deployment name passed through.
    } else {
      let apiBaseUrl = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com'
      if (apiBaseUrl && apiBaseUrl.endsWith('/')) {
        apiBaseUrl = apiBaseUrl.slice(0, -1)
      }
      apiUrl = `${apiBaseUrl}/v1/chat/completions`
      apiKey = process.env.OPENAI_API_KEY || ''
      model = 'gpt-3.5-turbo'
    }

    // First call: Determine if more information is needed
    const initialResponse = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'api-key': `${apiKey}`
      },
      method: 'POST',
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: initialSystemContent },
          ...messagesToSend
        ],
        temperature: 0,
        max_tokens: 150,
      })
    })

    if (initialResponse.status !== 200) {
      throw new Error(`Initial API error: ${initialResponse.statusText}`)
    }

    const initialData = await initialResponse.json()
    const initialResult = initialData.choices[0].message.content.trim()

    if (initialResult === '0') {
      // Second call: Classify the conversation
      const classificationResponse = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'api-key': `${apiKey}`
        },
        method: 'POST',
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: classificationSystemContent },
            ...messagesToSend
          ],
          temperature: 0,
          max_tokens: 1,
        })
      })

      if (classificationResponse.status !== 200) {
        throw new Error(`Classification API error: ${classificationResponse.statusText}`)
      }

      const classificationData = await classificationResponse.json()
      const classification = classificationData.choices[0].message.content.trim()

      if (classification === '1') {
        // Third call: Get finance advice using GPT-4 Turbo
        const financeResponse = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'api-key': `${apiKey}`
          },
          method: 'POST',
          body: JSON.stringify({
            model: 'gpt-4-turbo',
            messages: [
              { role: 'system', content: financeGPTPrompt },
              ...messagesToSend
            ],
            temperature: 0.7,
            max_tokens: 500,
          })
        })
      
        if (financeResponse.status !== 200) {
          throw new Error(`Finance GPT API error: ${financeResponse.statusText}`)
        }
      
        const financeData = await financeResponse.json();
        const financeAdvice = financeData.choices[0].message.content.trim();
        return new Response(financeAdvice);

      } else {
        // Use Perplexity API for classifications '2' and '3'
        const PERP_API_KEY = process.env.PERP_API_KEY;
        const PERP_BASE_URL = "https://api.perplexity.ai/chat/completions";
        
        const perplexityMessages = [
          perplexitySystemMessage,
          ...messagesToSend
        ];
        
        const perplexityOptions = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PERP_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "llama-3.1-sonar-large-128k-online",
            messages: perplexityMessages,
            max_tokens: 4000,
            temperature: 0.2,
            top_p: 0.9
          })
        };
        
        const perplexityResponse = await fetch(PERP_BASE_URL, perplexityOptions);

        if (perplexityResponse.status !== 200) {
          throw new Error(`Perplexity API error: ${perplexityResponse.statusText}`);
        }
        
        const perplexityData = await perplexityResponse.json();
        const perplexityAdvice = perplexityData.choices[0].message.content.trim();
        
        return new Response(perplexityAdvice);
      }
    } else {
      // Return the initial response (question asking for more information)
      return new Response(initialResult)
    }
  } catch (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }
}

export default handler