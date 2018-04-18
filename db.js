var spicedPg = require("spiced-pg");

if (process.env.DATABASE_URL) {
    var db = spicedPg(process.env.DATABASE_URL);
} else {
    var db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");
}
function setUser(firstname, lastname, email, password) {
    return db.query(
        "INSERT INTO users (firstname, lastname, email, password) VALUES ( $1, $2,$3, $4) RETURNING id",
        [firstname, lastname, email, password]
    );
}
function getUser(user_id) {
    return db.query(
        "SELECT users.firstname AS firstname, users.lastname AS lastname," +
            "users.email AS email,  users.password AS password, user_profiles.age AS age," +
            "user_profiles.city AS city, user_profiles.url AS url " +
            "FROM users JOIN user_profiles " +
            "ON users.id = user_profiles.user_id " +
            "AND users.id = $1",
        [user_id]
    );
}
function getCity(city) {
    return db.query(
        "SELECT users.firstname AS firstname, users.lastname AS lastname," +
            "users.email AS email,  users.password AS password, user_profiles.age AS age," +
            "user_profiles.city AS city, user_profiles.url AS url " +
            "FROM users JOIN user_profiles " +
            "ON users.id = user_profiles.user_id " +
            "AND LOWER(user_profiles.city) = LOWER($1)",
        [city]
    );
}
function setDetailUser(age, city, url, user_id) {
    return db.query(
        "INSERT INTO user_profiles (age, city, url,user_id) VALUES ( $1, $2,$3, $4) RETURNING id",
        [age, city, url, user_id]
    );
}
function updateUserWithPassword(user_id, firstname, lastname, email, password) {
    return db.query(
        "UPDATE users SET firstname = $2, lastname = $3, email = $4, password = $5 FROM user_profiles WHERE users.id = user_profiles.user_id AND users.id = $1",
        [user_id, firstname, lastname, email, password]
    );
    console.log("updateUser 1 : " + password);
}
function updateUser(user_id, firstname, lastname, email) {
    return db.query(
        "UPDATE users SET firstname = $2, lastname = $3, email = $4 FROM user_profiles WHERE users.id = user_profiles.user_id AND users.id = $1",
        [user_id, firstname, lastname, email]
    );
    console.log("updateUser 2 : ");
}
function updateUserProfiles(age, city, url, user_id) {
    return db.query(
        "INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO UPDATE SET age = $1, city = $2, url = $3",
        [age, city, url, user_id]
    );
}
function getSignatures() {
    return db.query(
        "SELECT users.firstname AS firstname, users.lastname AS lastname," +
            "users.email AS email,  users.password AS password, user_profiles.age AS age," +
            "user_profiles.city AS city, user_profiles.url AS url " +
            "FROM users JOIN user_profiles " +
            "ON users.id = user_profiles.user_id JOIN signatures " +
            "ON users.id = signatures.user_id"
    );
}
function getSignatureById(user_id) {
    return db.query(
        "SELECT signature FROM signatures JOIN users ON users.id = signatures.user_id" +
            " AND users.id = $1",
        [user_id]
    );
}
function getPassword(email) {
    return db.query("SELECT password,id FROM users WHERE users.email = $1", [
        email
    ]);
}
function countSignatures() {
    return db.query("SELECT COUNT(*) FROM signatures");
}
function setSignature(signature, user_id) {
    return db.query(
        "INSERT INTO signatures (signature,user_id) VALUES ( $1, $2) RETURNING id",
        [signature, user_id]
    );
}
function deleteSignature(user_id) {
    return db.query("DELETE FROM signatures WHERE user_id =  $1", [user_id]);
}

exports.setUser = setUser;
exports.getUser = getUser;
exports.setDetailUser = setDetailUser;
exports.updateUserWithPassword = updateUserWithPassword;
exports.updateUser = updateUser;
exports.updateUserProfiles = updateUserProfiles;
exports.getSignatures = getSignatures;
exports.getCity = getCity;
exports.getSignatureById = getSignatureById;
exports.getPassword = getPassword;
exports.countSignatures = countSignatures;
exports.setSignature = setSignature;
exports.deleteSignature = deleteSignature;
