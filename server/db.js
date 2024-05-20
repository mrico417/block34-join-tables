const { v4: uuidv4 } = require('uuid');
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_travel_db');

const createTables = async () => {
    const sql = `

        DROP TABLE IF EXISTS vacation;
        DROP TABLE IF EXISTS traveler;
        DROP TABLE IF EXISTS place;

                
        CREATE TABLE traveler (
            id UUID PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE
        );

        CREATE TABLE place (
            id UUID PRIMARY KEY,
            name VARCHAR(150) NOT NULL UNIQUE
        );

        CREATE TABLE vacation (
            id UUID PRIMARY KEY,
            traveler_id UUID REFERENCES traveler(id) NOT NULL,
            place_id UUID REFERENCES place(id) NOT NULL,
            travel_date DATE NOT NULL
        );
    
    `;

   await client.query(sql);

   return;
}

const createUser = async (name) => {

    const sql = `
        INSERT INTO traveler (id,name) VALUES ($1,$2)
        RETURNING name;`
    ;

    const response = await client.query(sql,[uuidv4(),name]);
    return response.rows[0];

};

const createPlace = async (name) => {

    const sql = `
        INSERT INTO place(id,name) VALUES($1,$2) 
        RETURNING name;`
    ;

    const response = await client.query(sql,[uuidv4(),name]);
    return response.rows[0];
};

const fetchUsers = async()=> {
    const sql = `
        SELECT name FROM traveler;`
    ;

    const response = await client.query(sql);
    return response.rows;
};

const fetchPlaces = async() => {
    const sql = `
        SELECT name from place;`
    ;

    const response = await client.query(sql);
    return response.rows;
};

const createVacation = async({traveler,place,date}) => {
    const sql = `
        INSERT INTO vacation(id,traveler_id,place_id,travel_date) 
        VALUES($1,(SELECT id FROM traveler WHERE name=$2),(SELECT id FROM place WHERE name=$3),$4)
        RETURNING *;`
    ;

    const response = await client.query(sql,[uuidv4(),traveler,place,date]);
    return response.rows[0];

};

const fetchVacations = async ()=> {
    const sql = `
        SELECT  *
        FROM vacation;`
    ;

    const response = await client.query(sql);
    return response.rows;

};

const destroyVacation = async ( {vacation_id,traveler_id}) => {

    const sql = `
        DELETE FROM vacation
        WHERE id=$1 AND traveler_id=$2;`
    ;

    await client.query(sql,[vacation_id,traveler_id]);
    return true
};

module.exports = {
    client,
    createTables,
    createUser,
    createPlace,
    fetchUsers,
    fetchPlaces,
    createVacation,
    fetchVacations,
    destroyVacation
};