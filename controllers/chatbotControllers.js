import AsyncHandler from '../utils/AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
const getInfo = AsyncHandler(async(req,res)=>{
    const { query } = req.body;

    if (!query) {
      throw new ApiError(400, "query is required")
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Step 1: Classify query (disease or medicine)
    const classificationPrompt = `
      Classify the following query as either "disease" or "medicine".
      Query: ${query}
      Respond with only one word: "disease" or "medicine".
    `;

    const classifyModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const classificationResult = await classifyModel.generateContent(classificationPrompt);
    const classification = classificationResult.response.text().trim().toLowerCase();


    // Validate classification
    const type = (classification === 'disease' || classification === 'medicine') ? classification : 'unknown';

    // Step 2: Generate structured info based on type
    const infoPrompt = `
      You are a medical information assistant.
      Provide general information about the ${type} mentioned in the query.
      Do not provide medical advice, diagnosis, or treatment.
      Always include the disclaimer: "This is for informational purposes only, not medical advice."

      Query: ${query}

      Respond in JSON format:
      ${
        type === 'disease'
          ? `{
              "type": "disease",
              "name": "<disease name>",
              "description": "<short description>",
              "common_symptoms": ["symptom1", "symptom2"],
              "possible_causes": ["cause1", "cause2"],
              "disclaimer": "This is for informational purposes only, not medical advice."
            }`
          : `{
              "type": "medicine",
              "name": "<medicine name>",
              "usage": "<what it is generally used for>",
              "common_side_effects": ["effect1", "effect2"],
              "precautions": ["precaution1", "precaution2"],
              "disclaimer": "This is for informational purposes only, not medical advice."
            }`
      }
    `;

    const infoModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const infoResult = await infoModel.generateContent(infoPrompt);
    const infoText = infoResult.response.text();

    // Parse JSON safely
    let responseData;
    try {
      const cleanedText = infoText
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  responseData = JSON.parse(cleanedText);
    } catch (err) {
      responseData = { raw_response: infoText, disclaimer: "Parsing failed. Please format correctly." };
    }
    return res
    .status(201)
    .json(new ApiResponse(201,responseData,"Chat Generated"))
})

export {getInfo};