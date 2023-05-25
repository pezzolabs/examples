import { Pezzo } from "@pezzo/client";
import { OpenAIExecutor } from "@pezzo/integrations";
import { NextResponse } from "next/server";

// Initialize the Pezzo client
const pezzo = new Pezzo({
  serverUrl: process.env.PEZZO_SERVER_URL || "https://api.pezzo.ai",
  apiKey: process.env.PEZZO_API_KEY,
  environment: process.env.PEZZO_ENVIRONMENT || "development",
});

// Initialize the OpenAI executor
const openai = new OpenAIExecutor(pezzo, {
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const body = await request.json();
  const { goal, numTasks } = body;

  try {
    const data = await openai.run("GenerateTasks", {
      goal,
      numTasks,
    });

    const parsed = JSON.parse(data.result);
    return NextResponse.json(parsed, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
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
