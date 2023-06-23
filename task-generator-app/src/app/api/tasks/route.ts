import { Pezzo, PezzoOpenAIApi } from "@pezzo/client";
import { NextResponse } from "next/server";
import { Configuration } from "openai";

// Initialize the Pezzo client
const pezzo = new Pezzo({
  serverUrl: process.env.PEZZO_SERVER_URL || "https://api.pezzo.ai",
  apiKey: process.env.PEZZO_API_KEY,
  environment: "Production",
});

// Initialize OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new PezzoOpenAIApi(pezzo, configuration);

export async function POST(request: Request) {
  const body = await request.json();
  const { goal, numTasks } = body;

  let prompt, settings;

  try {
    prompt = await pezzo.getPrompt("GenerateTasks", {
      variables: {
        goal,
        numTasks,
      },
    });
    settings = prompt.getChatCompletionSettings();
  } catch (error) {
    console.log("Could not get prompt", error);
  }

  let result;

  try {
    result = await openai.createChatCompletion(
      { ...settings, max_tokens: 1200 },
      { headers: { "Content-Type": "application/json" } }
    );
    const parsed = JSON.parse(result.data.choices[0].message.content);

    return NextResponse.json(parsed, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("Error parsing response", error);
    let message;

    if (error.response?.errors) {
      // Handle Pezzo Server GraphQL errors
      message = error.response.errors[0].message;
    } else {
      message =
        "Prompt execution failed. Check the Pezzo History tab for more information.";
    }

    return NextResponse.json(
      {
        message,
      },
      {
        status: 500,
      }
    );
  }
}
