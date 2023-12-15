const express=require("express");
const cors=require('cors');
const app=express();
const sqlite3=require('sqlite3').verbose();
const db=new sqlite3.Database('NotepadDatabase.db');
let UName="";
app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(cors({
    origin: '*'
  }));
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
        db.all("SELECT * FROM Users WHERE username=?",username,function(err,output){
            if(output[0]!=null)
            {
                db.all("SELECT * FROM Users WHERE username=? AND password=?",username,password,function(err,output){
                    if(output[0]!=null)
                    {
                        responce.send({message:"This account has already been registered!!",color:"gold"});
                    }
                    else
                    {
                        responce.send({message:"This username is already taken!!",color:"red"});
                    }
                });
            }
            else
            {
                db.run("INSERT INTO Users(username,password) VALUES (?,?)",username,password,function(err,result){
                    if(err==null)
                    {
                        db.run("CREATE TABLE ?(key TEXT,value TEXT)",username,function(error,res){
                            if(error==null)
                            {
                                responce.send({message:"User has been registered successfully.",color:"green"});
                            }
                        })
                    }
                })
            }
        })
    }
    else
    {
        responce.send({message:"Confirm Password does not match with the Password!",color:"red"});
    }
})

app.post('/login',function(req,response){
    let username=req.body.username;
    let password=req.body.password;
    db.all("SELECT * FROM Users WHERE username=? AND password=?",username,password,function(error,output){
        if(output[0]!=null)
        {
            UName=username;
            response.send({message:"Username "+username+" has been logged in successfully.",color:"green"});
        }
        else
        {
            response.send({message:"Username and/or Password is incorrect!",color:"red"});
        }
    })
})

const server=app.listen(process.env.PORT,function(){
    console.log("NotepadDatabase is listening..")
});