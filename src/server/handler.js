const predictClassification = require("../services/inferenceService");
const crypto = require("crypto");
const storeData = require("../services/storeData");

async function postPredictHandler(request, h) {
  try {
    const { image } = request.payload;
    const { model } = request.server.app;

    const { confidenceScore, label, explanation, suggestion } =
      await predictClassification(model, image);
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const data = {
      id: id,
      result: label,
      explanation: explanation,
      suggestion: suggestion,
      confidenceScore: confidenceScore,
      createdAt: createdAt,
    };

    // Coba menyimpan data ke Firestore
    await storeData(id, data);

    const response = h.response({
      status: "success",
      message:
        confidenceScore > 99
          ? "Model is predicted successfully."
          : "Model is predicted successfully but under threshold. Please use the correct picture",
      data,
    });
    response.code(201);
    return response;
  } catch (error) {
    console.error("Error storing data:", error); // Log error untuk debugging
    const response = h.response({
      status: "fail",
      message: "Internal Server Error",
    });
    response.code(500);
    return response;
  }
}

module.exports = postPredictHandler;
