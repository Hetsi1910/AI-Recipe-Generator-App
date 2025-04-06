const express = require("express");
const cors = require("cors");
const { Groq } = require("groq-sdk");


const app = express();
const PORT = 3001;

app.use(cors());

app.get("/recipeStream", (req, res) => {
    const ingredients = req.query.ingredients;
    const mealType = req.query.mealType;
    const cuisine = req.query.cuisine;
    const cookingTime = req.query.cookingTime;
    const complexity = req.query.complexity;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const sendEvent = (chunk) => {
        let chunkResponse;

        if (chunk.choices[0].finish_reason === "stop") {
            res.write(`data: ${JSON.stringify({ action: "close" })}\n\n`);
        } else {
            if (
                chunk.choices[0].delta.role &&
                chunk.choices[0].delta.role === "assistant"
            ) {
                chunkResponse = {
                    action: "start",
                };
            } else {
                chunkResponse = {
                    action: "chunk",
                    chunk: chunk.choices[0].delta.content,
                };
            }

            res.write(`data: ${JSON.stringify(chunkResponse)}\n\n`);
        }
    };

    const prompt = [];
    prompt.push("Generate a recipe that incorporates the following details:");
    prompt.push(`[Ingredients: ${ingredients}]`);
    prompt.push(`[MealType: ${mealType}]`);
    prompt.push(`[Cuisine: ${cuisine}]`);
    prompt.push(`[CookingTime: ${cookingTime}]`);
    prompt.push(`[Complexity: ${complexity}]`);
    prompt.push("Please provide a detailed recipe, including steps for preparation and cooking. Only use the ingredients.");
    prompt.push("The recipe should highlight the fresh and vibrant flavours of the ingredients.");
    prompt.push("Also give the recipe a suitable name in its local language based on cuisine preferences.");

    const messages = [
        {
            role: "system",
            content: prompt.join(" "),
        },
    ];

    fetchGroqCompletionsStream(messages, sendEvent);

    req.on("close", () => {
        res.destroy();
    });
});

async function fetchGroqCompletionsStream(messages, callback) {
    const Groq_API_KEY = "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";   //apikey
    const groq = new Groq({ apiKey: Groq_API_KEY });
    const aiModel = "mistral-saba-24b";   //model

    try {
        const completion = await groq.chat.completions.create({
            model: aiModel,
            messages: messages,
            stream: true,
        });

        for await (const chunk of completion) {
            callback(chunk);
        }
    } catch (error) {
        console.error("Error fetching completion stream:", error);
    }
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
