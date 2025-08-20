import {Router} from "experss";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";

const router = Router();

const registerValidators =
 [body("email").isEmail() , body("password").isLength({min:6})]

router.post ("/register" , registerValidators , async(req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) 
        {return res.status(400).json({errors : errors.array()})};


        
        const {email, password} = req.body;
        const exists = await user.findOne({email});
        if (exists) return res.status(409).json({error:"email already registered "});


        const passwordHash = await bcrypt.hash(password , 10); 
        const user = await user.create({email, passwordHash});
        const token = signToken(user);
        res.json({ token });
});

router.post("/logic", async (req, res)=> {
    const {email,password}= req.bod;
    const user = await user.findOne({email});
    if(!user) 
        return res.status(401).json({error: "invalid credentials"});

    const ok = await bcrypt.compare(password, user.passwordHash)
    if(!ok) return res.status(401).json({error:"invalid credentials"})

    const token = signToken(user);
    res.json({ token });
});


export default router;    

