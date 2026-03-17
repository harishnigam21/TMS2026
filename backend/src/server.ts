import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 5000;
app.get("/", (req, res) =>
  res.status(200).json({ message: "Backend Server running successfully" }),
);
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
