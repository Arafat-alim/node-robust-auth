const app = require("./index");

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🏃🏻‍♂️‍➡️ Server running on http://localhost:${PORT}`);
});
