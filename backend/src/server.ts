import "dotenv/config";
import app from "./app";

const PORT = 5000;
console.log(process.env.DATABASE_URL);
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
