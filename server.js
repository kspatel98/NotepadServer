const express=require("express");
const app=express();
const sqlite3=require('sqlite3').verbose();
const db=new sqlite3.Database('NotepadDatabase.db');
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
  })
db.serialize(function(){
    db.run("DROP TABLE IF EXISTS Users");
    db.run("CREATE TABLE Users(username TEXT,password TEXT)");
})

app.post('/signup',function(req,responce){
    console.log(req.body);
    let username=req.body.username;
    let password=req.body.password;
    let cpassword=req.body.cpassword;
    console.log("enter signup")
    if(password==cpassword)
    {
        console.log("password match")
        db.all("SELECT * FROM Users WHERE username=?",username,function(err,output){
            console.log(output)
            if(output[0]!=null)
            {
                console.log("username exist")
                responce.send({message:"This username is already taken!!",color:"red"});
            }
            else
            {
                db.run("INSERT INTO Users(username,password) VALUES (?,?)",username,password,function(err,result){
                    if(err==null)
                    {
                        responce.send({message:"User has been registered successfully.",color:"green"});
                    }
                })
            }
        })
    }
    else
    {
        console.log("password not match")
        responce.send({message:"Confirm Password does not match with the Password!",color:"red"});
    }
})

const server=app.listen(process.env.PORT,function(){
    console.log("NotepadDatabase is listening..")
});