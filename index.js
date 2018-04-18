const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const hb = require("express-handlebars");
const db = require("./db");
const bcrypt = require("bcryptjs");
const validUrl = require("valid-url");
const csurf = require("csurf");
const cache = require("./cache");
const leo = {
    age: "43",
    name: "leonardo",
    oscars: "1"
};
cache
    .setex("leo", 25, JSON.stringify(leo))
    .then(function() {
        return cache.get("leo");
    })
    .then(function(val) {
        console.log(JSON.parse(val));
    });

app.disable("powered-by");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(require("cookie-parser")());
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);
app.use(express.static(__dirname + "/public"));
var cookieSession = require("cookie-session");
app.use(
    cookieSession({
        secret: "taher",
        maxAge: 1000 * 60 * 60 * 24 * 14,
        htttpOnly: true
    })
);
app.use(csurf());

function hashPassword(plainTextPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
}
function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(
            textEnteredInLoginForm,
            hashedPasswordFromDatabase,
            function(err, doesMatch) {
                if (err) {
                    reject(err);
                } else {
                    resolve(doesMatch);
                }
            }
        );
    });
}
app.use(function(req, res, next) {
    res.setHeader("X-Frame-Options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.get("/", function(req, res, next) {
    res.redirect("register");
});
app.get("/register", function(req, res, next) {
    res.render("register");
});
app.post("/register", function(req, res, next) {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    hashPassword(req.body.password).then(function(hash) {
        if (firstname != "" && lastname != "" && email != "" && hash != "") {
            db.setUser(firstname, lastname, email, hash).then(response => {
                req.session.signatureId = response.rows[0].id;
                res.redirect("/userdetail");
            });
        }
    });
});
app.get("/userdetail", function(req, res, next) {
    res.render("userdetail");
});
app.post("/userdetail", function(req, res, next) {
    var errorURL = false;
    const age = req.body.age;
    const city = req.body.city;
    const url = req.body.url;
    const user_id = req.session.signatureId;
    if (!validUrl.isUri(url)) {
        errorURL = true;
    }
    if (!errorURL) {
        if (age != "" && city != "")
            db.setDetailUser(age, city, url, user_id).then(response => {
                res.redirect("/petition");
            });
        //empty redis
    } else {
        res.render("userdetail");
    }
});
app.get("/login", function(req, res, next) {
    res.render("login");
});
app.post("/login", function(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    db.getPassword(email).then(response => {
        if (response.rows[0]) {
            checkPassword(password, response.rows[0].password)
                .then(function(doesMatch) {
                    if (doesMatch) {
                        req.session.signatureId = response.rows[0].id;
                        res.redirect("/thankyou");
                    } else {
                        res.render("login", { error: true });
                    }
                })
                .catch(() => console.log());
        }
    });
});
app.get("/petition", function(req, res, next) {
    db
        .getSignatureById(req.session.signatureId)
        .then(response => {
            if (response.rows[0]) {
                res.render("petition", {
                    signature: response.rows[0].signature
                });
            } else {
                res.render("petition", {
                    nosign: true
                });
            }
        })
        .catch(() => console.log());
});
app.post("/petition", function(req, res, next) {
    const datasignature = req.body.datasignature;
    const user_id = req.session.signatureId;
    db
        .setSignature(datasignature, user_id)
        .then(response => {
            //empty redis
            res.redirect("/thankyou");
        })
        .catch(() => console.log());
});
app.get("/thankyou", function(req, res, next) {
    var count = 0;
    if (!req.session.signatureId) {
        res.redirect("/register");
    }
    db.countSignatures().then(response => {
        count = response.rows[0].count;
    });
    db
        .getSignatureById(req.session.signatureId)
        .then(response => {
            res.render("thankyou", {
                count: count,
                signature: response.rows[0].signature
            });
        })
        .catch(() => console.log());
});
app.get("/signers", function(req, res, next) {
    if (!req.session.signatureId) {
        res.redirect("/register");
    }
    db
        .countSignatures()
        .then(response => {
            count = response.rows[0].count;
        })
        .catch(() => console.log());
    //redis or database
    //
    db
        .getSignatures()
        .then(response => {
            res.render("signers", {
                signersList: response.rows
            });
        })
        .catch(() => console.log());
});
app.get("/signers/city", function(req, res, next) {
    const city = req.query.city;
    db
        .getCity(city)
        .then(response => {
            res.render("city", {
                signersListCity: response.rows
            });
        })
        .catch(() => console.log());
});
app.get("/user/edit", function(req, res, next) {
    const user_id = req.session.signatureId;
    db
        .getUser(user_id)
        .then(response => {
            res.render("user", {
                firstname: response.rows[0].firstname,
                lastname: response.rows[0].lastname,
                email: response.rows[0].email,
                password: response.rows[0].password,
                age: response.rows[0].age,
                city: response.rows[0].city,
                url: response.rows[0].url
            });
        })
        .catch(() => console.log());
});
app.post("/user/edit", function(req, res, next) {
    var errorURL = false;
    const user_id = req.session.signatureId;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const age = req.body.age;
    const city = req.body.city;
    const url = req.body.url;
    if (!validUrl.isUri(url)) {
        errorURL = true;
    }
    if (req.body.password != "") {
        hashPassword(req.body.password).then(function(hash) {
            db
                .updateUserWithPassword(
                    user_id,
                    firstname,
                    lastname,
                    email,
                    hash
                )
                .then(response => {
                    if (!errorURL) {
                        db
                            .updateUserProfiles(age, city, url, user_id)
                            .then(response => {
                                res.redirect("/thankyou");
                            });
                    } else {
                        db.getUser(user_id).then(response => {
                            res.render("user", {
                                firstname: response.rows[0].firstname,
                                lastname: response.rows[0].lastname,
                                email: response.rows[0].email,
                                password: response.rows[0].password,
                                age: response.rows[0].age,
                                city: response.rows[0].city,
                                url: response.rows[0].url,
                                errorURL: errorURL
                            });
                        });
                    }
                });
        });
    } else {
        db.updateUser(user_id, firstname, lastname, email).then(response => {
            if (!errorURL) {
                db
                    .updateUserProfiles(age, city, url, user_id)
                    .then(response => {
                        res.redirect("/thankyou");
                    });
            } else {
                db.getUser(user_id).then(response => {
                    res.render("user", {
                        firstname: response.rows[0].firstname,
                        lastname: response.rows[0].lastname,
                        email: response.rows[0].email,
                        password: response.rows[0].password,
                        age: response.rows[0].age,
                        city: response.rows[0].city,
                        url: response.rows[0].url,
                        errorURL: errorURL
                    });
                });
            }
        });
    }
});
app.get("/thankyou/confirmdelete", function(req, res, next) {
    const user_id = req.session.signatureId;
    req.session.signatureId = user_id;
    res.render("confirmdelete");
});
app.get("/thankyou/delete", function(req, res, next) {
    const user_id = req.session.signatureId;
    db
        .deleteSignature(user_id)
        .then(response => {
            res.redirect("/petition");
        })
        .catch(() => console.log());
});
app.get("/thankyou/logout", function(req, res, next) {
    req.session = null;
    res.redirect("/register");
});
// app.listen(process.env.PORT || 8080, () => console.log(`I'm listening.`));
app.listen(process.env.PORT || 8080, () => {
    console.log(`I'm listening.`);
});
