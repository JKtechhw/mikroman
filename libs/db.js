const config = require("../libs/configEditor");
const { Pool } = require("pg");
const fs = require("fs");


class DB {
    #config;
    
    constructor() { 
        const ce = new config();
        try {
            this.#config = ce.getConfig();
        }
        
        catch(e) {
            this.#config = {};
        }
    }

    async #connect(user = this.#config.db_user, password = this.#config.db_password, database = this.#config.db_name, host = this.#config.db_host, port = this.#config.db_port || 5432) {
        return new Promise(async (resolve, reject) => {
            const pool = new Pool({
                host: host,
                port: port,
                user: user,
                password: password,
                database: database,

                idleTimeoutMillis: 1,
                max: 10,
                connectionTimeoutMillis: 10000,
            });

            pool.on("error", (err) => {
                reject('Unexpected error on idle client');
            });

            try {
                let client = await pool.connect();
                resolve(client);
            }

            catch(err) {
                reject(err);
            }
        });
    }

    #disconnect(client) {
        return new Promise(async (resolve, reject) => {
            try {
                await client.release();
                resolve();
            }
    
            catch(e) {
                reject(e)
            }
        });
    }

    query(query, values) {
        return new Promise(async (resolve, reject) => {
            let pool;
            try {
                pool = await this.#connect();
            }

            catch(e) {
                reject(e);
                return;
            }

            if(typeof values === "undefined") {
                pool.query(query, (err, res) => {
                    if(err) {
                        reject(err);
                    }
    
                    resolve(res);
                    this.#disconnect(pool);
                });
            }

            else {
                pool.query(query, values, (err, res) => {
                    if(err) {
                        reject(err);
                    }
    
                    resolve(res);
                    this.#disconnect(pool);
                });
            }
        });
    }

    queryCredentials(user, password, database, host, port, query, values) {
        return new Promise(async (resolve, reject) => {
            let pool;
            try {
                pool = await this.#connect(user, password, database, host, port);
            }

            catch(e) {
                reject(e);
                return;
            }

            if(typeof values === "undefined") {
                pool.query(query, (err, res) => {
                    if(err) {
                        reject(err);
                    }
    
                    resolve(res);
                    this.#disconnect(pool);
                });
            }

            else {
                pool.query(query, values, (err, res) => {
                    if(err) {
                        reject(err);
                    }
    
                    resolve(res);
                    this.#disconnect(pool);
                });
            }
        });
    }

    testDatabase(hostname, port, username, password, database) {
        return new Promise(async (resolve, reject) => {
            let pool;

            try {
                pool = await this.#connect(username, password, database, hostname, port);
            }

            catch(e) {
                if(e.code == "ECONNREFUSED") {
                    reject(`Connection to PostgreSQL server ${hostname}:${port || 5432} was refused`);
                }

                else if(e.code == "57P03") {
                    reject(`PostgreSQL is starting up, wait a few moments`);
                }

                else if(e.code == "28P01") {
                    reject(`Authentication for user ${username} failed`);
                }

                else if(e.code == "3D000") {
                    reject(`Database "${database}" does not exist`);
                }

                else if(e.message == "Connection terminated due to connection timeout") {
                    reject("Connection terminated due to connection timeout");
                }

                else {
                    reject(e.message);
                }
            }

            //Test connection
            try {
                await pool.query('SELECT NOW()');
                resolve();
            }

            catch(e) {
                reject(e);
            }
        });
    }

    testStructure(pathToFile) {
        return new Promise((resolve, reject) => {
            if(fs.existsSync(pathToFile) == false) {
                throw new Error("Source file doesn't exists");
            }

            fs.readFile(pathToFile, async (err, data) => {
                if(err) {
                    throw err;
                }

                //Get data from database
                const tables = await this.query("SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND  schemaname != 'information_schema'");

                //Get data from file
                const query = data.toString();
                const tableStructure = query.split("CREATE TABLE");
                tableStructure.shift();

                for(const table of tableStructure) {
                    let tableName = table.split(" ")[1];
                    const exists = tables.rows.findIndex(element => element.tablename == tableName);
                    
                    if(exists < 0) {
                        reject(new Error(`Table ${tableName} doesn't exists`));
                    }
                }

                resolve();
            });
        });
    }
}

module.exports = DB;