require("dotenv").config();
const express =  require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");
const upload = require("./upload.js"); 

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("upload")); //Server upload the file if needed

// middleware to verify

const verifyToken = (req, res, next) => {
    const token = req.header("authorization")?.split(' ')[1];
    if(!token) return res.status(401).json({access: "Access Denied" });
    try{
        const  verified = jwt.verify(token,process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch(err) {
        res.status(400).json({error: "Invalid Token"});
    }
};

//upload Route

app.post("/upload", upload.single("file"),(req,res) => {
    if(!req.file){
        return res.status(400).json({message:"No file uploaded"})
    }
    res.json({
        message:"File upload successfully",
        filePath:`/upload/${req.file.filename}`
    });

});

//This is Protected route it can only accessed if valid jwt token provided 

app.get("/protected", verifyToken, (req,res) =>{
    res.json({message: "This is protected Route", user: req.user });
});

const users = [];
if(!username || !password) 
    return res.status(400).json({error:"Username and password are required"});

//user signup

app.post("/signup", async (req, res) => {
    const {username, password} = req.body;

    //check whether the user exist
    const existinguser = users.find(user => user.username === username);
    if(existinguser) return res.status(400).json({error:"user already exist"});

    //Hashed Password

    const hashedpassword = await bcrypt.hash(password, 10);
    users.push({username,password: hashedpassword});

    res.json({message:" User Registered successfully"});

});

//user login

app.post("/login", async (req, res) => {
    const { username, password} = req.body;

    const user = users.find(user => user.username === username);
    if(!user) return res.status(400).json({error:"User not found"});

    //verify password

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({error:"Invalid Credential"});

    //Generate jwt token

    const token = jwt.sign({username}, process.env.JWT_SECRET,{ expiresIn: "1h" })
    res.status(200).json({message:"Login Successfully", token});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));

