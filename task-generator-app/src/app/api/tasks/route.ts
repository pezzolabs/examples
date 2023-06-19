import { Pezzo } from "@pezzo/client";
import { NextResponse } from "next/server";
import { Configuration } from "openai";

// Initialize the Pezzo client
const pezzo = new Pezzo({
  serverUrl: process.env.PEZZO_SERVER_URL || "https://api.pezzo.ai",
  apiKey: process.env.PEZZO_API_KEY,
  environment: "Production",
});

// Initialize OpenAI
const openai = new pezzo.OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

export async function POST(request: Request) {
  const body = await request.json();
  const { goal, numTasks } = body;

  try {
    const prompt = await pezzo.getPrompt("TaskManager", {
      variables: {
        goal,
        numTasks
      }
    });
    
    let result;
    
    try {
      const settings = prompt.getChatCompletionSettings();
      result = await openai.createChatCompletion(settings);
    } catch (error) {
      console.log(error.response.data.message);
    }

    const parsed = JSON.parse(result.data.choices[0].message.content);

    // const execution = await pezzo.reportPromptExecution(
      
    // )
    return NextResponse.json(parsed, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log('error', error);
    let message;

    if (error.response?.errors) {
      // Handle Pezzo Server GraphQL errors
      message = error.response.errors[0].message;
    } else {
      message = "Prompt execution failed. Check the Pezzo History tab for more information.";
    }

    return NextResponse.json(
      {
        message
      },
      {
        status: 500,
      }
    );
  }
}
