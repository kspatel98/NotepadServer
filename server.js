const cron = require('node-cron');
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
app.use(cors());
app.options('*', cors())
// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, PATCH, DELETE, OPTIONS");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization,X-Requested-With");
//     next();
// })
cron.schedule('*/14 * * * *', function () {
    console.log('Restarting server');
    https
        .get(backendUrl, (res) => {
            if (res.statusCode == 200) {
                console.log('Server restarted');
            }
            else {
                console.error(
                    `failed to restart server with status code: ${res.statusCode}`
                );
            }
        })
        .on('error', (err) => {
            console.error('Error during Restart:', err.message);
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
                        responce.set('Access-Control-Allow-Origin', '*');
                        responce.send({ message: "This account has already been registered!!", color: "gold" });
                    }
                    else {
                        responce.set('Access-Control-Allow-Origin', '*');
                        responce.send({ message: "This username is already taken!!", color: "red" });
                    }
                });
            }
            else {
                db.run("INSERT INTO Users(username,password) VALUES (?,?)", username, password, function (err, result) {
                    if (err == null) {
                        const stmt = "CREATE TABLE " + username + "(key TEXT,value TEXT)";
                        const stmt1 = "DROP TABLE IF EXISTS " + username;
                        db.serialize(function () {
                            db.run(stmt1);
                            db.run(stmt, function (error, res) {
                                if (error == null) {
                                    responce.set('Access-Control-Allow-Origin', '*');
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
        responce.set('Access-Control-Allow-Origin', '*');
        responce.send({ message: "Confirm Password does not match with the Password!", color: "red" });
    }
})

app.post('/login', function (req, response) {
    let username = req.body.username;
    let password = req.body.password;
    db.all("SELECT * FROM Users WHERE username=? AND password=?", username, password, function (error, output) {
        if (output[0] != null) {
            UName = username;
            response.set('Access-Control-Allow-Origin', '*');
            response.send({ message: "Username " + username + " has been logged in successfully.", color: "green" });
        }
        else {
            response.set('Access-Control-Allow-Origin', '*');
            response.send({ message: "Username and/or Password is incorrect!", color: "red" });
        }
    })
})

app.post('/save', function (req, response) {
    let filename = req.body.filename;
    let content = req.body.content;
    let user = req.body.user;
    let stmt = "INSERT INTO " + user + "(key,value) VALUES (?,?)";
    db.run(stmt, filename, content, function (err, result) {
        if (err == null) {
            response.set('Access-Control-Allow-Origin', '*');
            response.send({ message: "New file created successful" });
        }
    })
})
app.post('/update', function (req, response) {
    let filename = req.body.filename;
    let content = req.body.content;
    let user = req.body.user;
    console.log("filename:"+filename+" Content:"+content+" user:"+user);
    let stmt = "UPDATE " + user + " SET value=? WHERE key='" + filename+"'";
    db.run(stmt,content, function (err, result) {
        console.log("Got into db.run statement for update..");
        if (err == null) {
            console.log("Update reached...");
            response.set('Access-Control-Allow-Origin', '*');
            response.send({ message: "File has been saved successfully" });
        }
    })

})

app.post('/delete',function(req,response){
    let filename = req.body.filename;
    let user = req.body.user;
    let stmt="DELETE FROM "+user+" WHERE key="+filename;
    db.run(stmt,function(err,result){
        if(err==null)
        {
            response.set('Access-Control-Allow-Origin', '*');
            response.send({ message: "File has been deleted successfully" });
        }
    })
})

app.post('/open', function (req, res) {
    console.log("open...");
    let filename = req.body.filename;
    let user = req.body.user;
    console.log(filename);
    console.log(user);
    let stmt = "SELECT value FROM " + user + " WHERE key='" + filename + "'";
    db.all(stmt, function (error, result) {
        console.log(result);
        if (result != null) {
            res.set('Access-Control-Allow-Origin', '*');
            res.send(result);
        }
    })
})

app.post('/getFiles', function (req, response) {
    let stmt = "SELECT key FROM " + UName;
    db.all(stmt, function (err, result) {
        if (result != null) {
            response.set('Access-Control-Allow-Origin', '*');
            response.send(result);
        }
    })
})

const server = app.listen(process.env.PORT, function () {
    console.log("NotepadDatabase is listening..")
});