import app from "./index.js";

const PORT = process.env.PORT || 500;
app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});

