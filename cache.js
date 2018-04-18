var redis = require("redis");
var client = redis.createClient({
    host: "localhost",
    port: 6379
});

client.on("error", function(err) {
    console.log(err);
});

client.setex("city", 60, "berlin", function(err, data) {
    if (err) {
        return console.log(err);
    }
    console.log('the "city" key was successfully set');

    client.get("city", function(err, data) {
        if (err) {
            return console.log(err);
        }
        console.log('The value of the "city" key is ' + data);
    });
});

client.set("day", "thursday", function(err, data) {
    console.log(err, data);
});
client.setex("month", 30, "april", function(err, data) {
    console.log(err, data);
});
client.setex("day", function(err, data) {
    console.log(err, data);
});
exports.get = function(key) {
    return new Promise(function(resolve, reject) {
        client.get(key, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};
exports.setex = function(key, expiry, val) {
    return new Promise(function(resolve, reject) {
        client.get(key, expiry, val, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};
// exports.del = function(key, expiry, val) {
//     return new Promise(function(resolve, reject) {
//         client.get(key, function(err, data) {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(err);
//             }
//         });
//     });
// };

cache
    .get("signers")
    .then(function(signers) {
        if (signers) {
            res.render("signers", {
                signers: JSON.parse(signers)
            });
        } else {
            return db.getSigners();
        }
    })
    .then(function(results) {
        cache.setex("signers", 300, JSON.stringify(results.rows[0]));
        res.render("signers", { signers: results.rows[0] });
    });
