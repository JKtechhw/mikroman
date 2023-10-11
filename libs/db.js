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
                const tables = await this.query(`
                    SELECT pg_tables.tablename, json_agg(json_build_object(
                        'column_name', columns.column_name, 
                        'data_type', columns.data_type
                    )) AS columns
                    FROM pg_catalog.pg_tables 
                    LEFT JOIN information_schema.columns ON table_name = tablename
                    WHERE schemaname != 'pg_catalog' AND  schemaname != 'information_schema'
                    GROUP BY tablename
                `);

                const databaseStructure = tables.rows;

                //Get data from file
                const query = data.toString();
                const fileTableStructure = query.replaceAll("\n", "").replaceAll("  ", "").split(";");
                //Remove last empty item
                fileTableStructure.pop();

                let fileStructure = {};

                for(let fileTable of fileTableStructure) {
                    //Remove whitespaces on start and end
                    fileTable = fileTable.trim();

                    if(fileTable.startsWith("CREATE TABLE") == false) {
                        reject(new Error(`Source sql file is not valid CREATE TABLE query: "${fileTable}"`));
                    }

                    //Get tablename
                    let fileTableName = fileTable.split(" ")[2];

                    if(fileTableName.toLowerCase() == "if") {
                        fileTableName = fileTable.split(" ")[5];
                    }

                    //Real comparison
                    
                    //Find table from database structure
                    const databaseMatch = databaseStructure.find(databaseTable => databaseTable.tablename === fileTableName);
                    if(databaseMatch == undefined) {
                        reject(new Error(`Table ${fileTableName} doesn't exists!`));
                    }

                    else {
                        //Check columns

                        //Get table columns
                        const columnString = fileTable.substring(fileTable.indexOf("(") + 1).split(")")[0];
                        const columns = columnString.split(",");

                        for(const fileColumn of columns) {
                            const fileColumnName = fileColumn.split(" ")[0];

                            const columnExists = databaseMatch.columns.find(databaseColumn => databaseColumn.column_name === fileColumnName);
                            if(columnExists == undefined) {
                                reject(new Error(`Column ${fileColumnName} in table ${fileTableName} doesn't exists`));
                            }

                            //Validate data type
                            let fileColumnDataType = fileColumn.split(" ")[1];
                            fileColumnDataType = (fileColumnDataType == "SERIAL" ? "integer" : fileColumnDataType);

                            if(columnExists.data_type != fileColumnDataType) {
                                reject(new Error(`Column ${columnExists.column_name} has different datatype "${columnExists.data_type}" but expected "${fileColumnDataType}"`));
                            }
                        }
                    }

                }
                resolve();
            });
        });
    }
}

module.exports = DB;