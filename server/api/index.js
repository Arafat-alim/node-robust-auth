import app from "../src/index.js";

export default async (req, res) => {
  try {
    return app(req, res);
  } catch (error) {
    console.error("API handler error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
