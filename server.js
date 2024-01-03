const cron = require ('node-cron');
const https = require('https');
const backendUrl = 'https://notepadserver.onrender.com';
const express = require("express");
const cors = require('cors');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('NotepadDatabase.db');
let UName = "";
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cors({
//     origin: '*'
// }));
// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//     next();
// })
cron.schedule('*/14 * * * *', function() {
    console.log ('Restarting server');
https
.get (backendUrl, (res) =>
    {
        if (res.statusCode==200) {
            console.log('Server restarted');
        }
        else {
        console. error (
            `failed to restart server with status code: ${res.statusCode}`
        ) ;
        }
    })
.on('error', (err) => {
console.error('Error during Restart:',err. message);
});
});
db.serialize(function () {
    db.run("DROP TABLE IF EXISTS Users");
    db.run("CREATE TABLE Users(username TEXT,password TEXT)");
})

app.post('/signup', function (req, responce) {
    console.log(req.body);
    let username = req.body.username;
    let password = req.body.password;
    let cpassword = req.body.cpassword;
    console.log("enter signup")
    if (password == cpassword) {
        db.all("SELECT * FROM Users WHERE username=?", username, function (err, output) {
            if (output[0] != null) {
                db.all("SELECT * FROM Users WHERE username=? AND password=?", username, password, function (err, output) {
                    if (output[0] != null) {
                        responce.send({ message: "This account has already been registered!!", color: "gold" });
                    }
                    else {
                        responce.send({ message: "This username is already taken!!", color: "red" });
                    }
                });
            }
            else {
                db.run("INSERT INTO Users(username,password) VALUES (?,?)", username, password, function (err, result) {
                    if (err == null) {
                        const stmt = "CREATE TABLE " + username + "(key TEXT,value TEXT)";
                        const stmt1="DROP TABLE IF EXISTS "+username;
                        db.serialize(function () {
                            db.run(stmt1);
                            db.run(stmt, function (error, res) {
                                if (error == null) {
                                    responce.send({ message: "User has been registered successfully.", color: "green" });
                                }
                            })
                        })
                    }
                })
            }
        })
    }
    else {
        responce.send({ message: "Confirm Password does not match with the Password!", color: "red" });
    }
    responce.set('Access-Control-Allow-Origin', '*');
})

app.post('/login', function (req, response) {
    let username = req.body.username;
    let password = req.body.password;
    db.all("SELECT * FROM Users WHERE username=? AND password=?", username, password, function (error, output) {
        if (output[0] != null) {
            UName = username;
            response.send({ message: "Username " + username + " has been logged in successfully.", color: "green" });
        }
        else {
            response.send({ message: "Username and/or Password is incorrect!", color: "red" });
        }
    })
    response.set('Access-Control-Allow-Origin', '*');
})

app.post('/save', function (req, response) {
    let filename = req.body.filename;
    let content = req.body.content;
    let statement="SELECT * FROM "+UName+" WHERE key="+filename;
    db.all(statement,function(error,output){
        if(output[0]!=null)
        {
            let stmt="UPDATE "+UName+" SET value="+content+" WHERE key="+filename;
            db.all(stmt,function(err,result){
                if(err==null)
                {
                    response.send({message: "File has been saved successfully"});
                }
            })
        }
        else
        {
            let stmt="INSERT INTO "+UName+"(key,value) VALUES (?,?)";
            db.run(stmt, filename, content, function (err, result){
                if(err==null)
                {
                    response.send({message: "New file created successful"});
                }
            })
        }
    })
    response.set('Access-Control-Allow-Origin', '*');
})

app.post('/open',function(req,res){
    let filename=req.body.filename;
    let statement="SELECT value FROM "+UName+" WHERE key="+filename;
    db.all(statement,function(error,result){
        if(result!=null)
        {
            res.set('Access-Control-Allow-Origin', '*');
            res.send(result);
        }
    })
})

app.post('/getFiles', function (req, response) {
    let stmt="SELECT key FROM "+UName;
    db.all(stmt, function (err, result){
        if (result != null) {
            response.set('Access-Control-Allow-Origin', '*');
            response.send(result);
        }
    })
})

const server = app.listen(process.env.PORT, function () {
    console.log("NotepadDatabase is listening..")
});