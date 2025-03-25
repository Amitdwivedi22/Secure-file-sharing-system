require("dotenv").config();
const express =  require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// middleware to verify

const verifyToken = (req, res, next) => {
    const token = req.header("authorization");
    if(!token) return res.status(401).json({access: "Access Denied" });
    try{
        const  verified = jwt.verify(token,process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch(err) {
        res.status(400).json({error: "Invalid Token"});
    }
};

//This is Protected route it can only accessed if valid jwt token provided 

app.get("/protected", verifyToken, (req,res) =>{
    res.json({message: "This is protected Route", user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));