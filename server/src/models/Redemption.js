import mongoose from "mongoose"

const redemptionSchema = new mongoose.Schema(
    {
        userId : { type:mongoose.Schema.Typpe.ObjectId , ref:"user"},
        codeId : { type:mongoose.Schema.Types.ObjectId , ref:"code"},
        Ponits : { type:numbers , required:true}
    }
);

export default mongoose.model("redemtion" , redemptionSchema);