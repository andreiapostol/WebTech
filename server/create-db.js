"use strict"

let sql = require("sqlite3");
let db = new sql.Database("./db/data.db", (err) => {
    if (err) {
        console.log('Error:', err);
    } else {
        console.log('Successfully connected to the database');
    }
});

db.serialize(create);

function create() {
    db.run("DROP TABLE IF EXISTS Rankings");

    const rankingsSql = `
        CREATE TABLE Rankings(
            ID INTEGER,
            USERNAME,
            SCORE,
            PRIMARY KEY (ID ASC)
        )`;

    db.run(rankingsSql, callback);

    db.all("SELECT * FROM Rankings", show);
}

function callback(err) {
    if (err) {
        console.log('Error:', err);
    } else {
        console.log("Rankings table created successfully");
    }
}

function show(err, rows) {
    if (err) {
        console.log('Error:', err);
    } else {
        console.log(rows);
    }
}