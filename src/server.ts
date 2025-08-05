import app from "./app";
import { connectDB } from "./config/database";
import indexRouter from "./routes/index.route";
const PORT: string | number = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `The server is running at the PORT: http://localhost:${PORT}`
      );
    });
  })
  .catch((err: any) => {
    console.log(`Error while connecting : ${err}`);
  });

app.use(indexRouter);
