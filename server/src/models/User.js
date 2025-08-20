import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
    {
        email:{ tyep:string , unique:true, requrie:true},
        passwordHash:{tyep:string , requrie:true},
        point: {type:numbers , defult:0},
    }
)

export default mongoose.model("user", userSchema);
