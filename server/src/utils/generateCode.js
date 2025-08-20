export const generateCode = (len = 10) =>{
    const chars  = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

return Array,from({
    length:len}, () => chars[Math.floor(Math,random()*chars.length)]).join("")
};

