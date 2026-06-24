import app from "./app.js";

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Saju test API server running on http://localhost:${port}`);
});
