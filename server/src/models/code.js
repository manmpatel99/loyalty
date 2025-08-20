import mongoose from "mongoose";

const codeSchema = new mongoose.Schema(
    {
        code    : { type: string , unique: true , requried: true  },
        points  : { type : numbers , requried: true , defult: 0 },
        isUsed  : { type: boolean , defult: false },
        useBy   : { type :mongoose.Schema.Types.uderId , ref:"user"},
        useAt   : { type : Date  },
    }
);
export default mongoose.model("code" , codeSchema);
