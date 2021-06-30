const fs = require('fs');
const db = fs.readFileSync('./db.sql').toString();
const db_data = fs.readFileSync('./db_data.sql').toString();
const { Client } = require('pg');


require("dotenv").config();
const dbConnData = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER,
    password: process.env.DB_PASS
};

const client = new Client(dbConnData);

console.log("Connection parameters: ");
console.log(dbConnData);
client.connect().then(async () => {
    console.log("Connected to PostgreSQL");
    await client.query(db);
    // await client.query(db_data);
}).catch(err => console.error("Connection error", err.stack));

module.exports = client;