const express = require('express');
const app = express();

app.use(express.json());
app.use(require('morgan')('dev'));

const { client, 
    createTables, 
    createUser, 
    createPlace,
    fetchUsers, 
    fetchPlaces, 
    createVacation,
    fetchVacations,
    destroyVacation 

} = require('./db');


// routes
app.get('/api/travelers', async (req, res, next)=>{
    res.send(await fetchUsers());
});
app.get('/api/places', async (req, res, next)=>{
    res.send(await fetchPlaces());
});
app.get('/api/vacations', async (req, res, next)=>{
    res.send(await fetchVacations());
});

app.delete('/api/travelers/:traveler_id/vacations/:vacation_id', async(req,res,next)=>{
    await destroyVacation({
        vacation_id: req.params.vacation_id,
        traveler_id: req.params.traveler_id
        
    })

    res.send(204);
});

app.post('/api/travelers/:traveler/vacations', async(req,res,next)=>{
    res.send(await createVacation({
        traveler: req.params.traveler,
        place: req.body.place,
        date: req.body.date
    }));    

    return;
})

const init = async() => {

    await client.connect();
    

    await createTables();
    console.log(`Tables created...`)
    const [mario,rico,suave,smooth,rich] = await Promise.all([
        createUser('mario'),
        createUser('rico'),
        createUser('suave'),
        createUser('smooth'),
        createUser('rich'),
    ])
    console.log(`Created users objects:`,mario,rico,suave,smooth,rich);


    const [jamaica, paris, malibu, costaRica,spain] = await Promise.all([
        createPlace('Jamaica'),
        createPlace('Paris'),
        createPlace('Malibu'),
        createPlace('CostaRica'),
        createPlace('Spain')
    ])
    console.log(`Created places objects:`,jamaica,paris,malibu,costaRica,spain);


    const fetchedUsers = await fetchUsers();
    console.log(`Fetched all users:`,fetchedUsers);


    const fetchedPlaces = await fetchPlaces();
    console.log(`Fetched all places:`, fetchedPlaces);

    const createdVacation = await createVacation({
        traveler: mario.name,
        place: jamaica.name,
        date:'02/14/2025'
    });

    console.log(`Created a vacation:`, createdVacation);

    const [vac1,vac2] = await Promise.all([
        createVacation({
            traveler: rico.name,
            place: spain.name,
            date: '03/14/2025'
        }),
        createVacation({
            traveler: smooth.name,
            place: paris.name,
            date: '08/07/2024'
        })
    ])
    console.log(`Created vac1 and vac2:`, vac1,vac2);


    const fetchedVacations = await fetchVacations();
    console.log(`Fetched all vacations:`, fetchedVacations);
    
    
    await destroyVacation(fetchedVacations[1].id,fetchedVacations[1].traveler_id);
    console.log(`Destroyed vacation:`,fetchedVacations[1].id,fetchedVacations[1].traveler_id);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT,()=>{console.log(`Listening on port ${PORT}`);});

};

init();