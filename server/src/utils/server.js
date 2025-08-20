import {express} from "express";
import {mongoose} from "mongoose";
import {dotenv} from "dotenv";
import {cros} from "cros";
import authRouthers from "../routes/auth.routes.js";
import codeRouthers from "../routes/code.routes.js";
import userRouter from "./routes/user.routes.js";

dotenv.config();

const app= epress();
app.user(express.json());
app.user(cros());
app.user(morgan("dev"));


app.use("./api/auth",authRouthers);

const main = async() => ( mnogoose.connect (process.env.MNOGO_URL));
  app.listen (process.env.PORT, () => {
    console.log("server started on port ${process.env.port")
  });
    
main();