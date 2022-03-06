// Import dependencies
import { Db } from "mongodb";
import {Express, Request, Response} from "express";
import * as bodyParser from "body-parser";
import * as path from 'path';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
// import authMiddleware from './middleware/auth-middleware'; // uncomment when ready to implement api auth

const express = require("express");
dotenv.config(); // load .env file for local dev

// Create new express server
const app: Express = express();

const { API_URL, PORT,
        CUSTOMERS_DB, CUSTOMER_COLLECTION} = process.env; // Get the variables from the .env file
// const client = new MongoClient(API_URL as string); // Create new instance of MongoClient
const client = new MongoClient(API_URL as string);

app.use(express.static(path.join(__dirname, 'client/build'))); // tells express where the files to be served are located
app.use(bodyParser.json()); // parses json object along with post request. Adds body prop to request param... access the json properties by using req.body.jsonProp
// app.use("/", authMiddleware); // uncomment this when ready to implement login! for now we'll expose the endpoints

/**
 * Get a list of all customer information
 * @param name - the name of the project to retrieve
 */
app.get('/api/v1/customers', async (req: Request , res: Response) => {

    await client.connect(); // connect to mongo
    const db = client.db(CUSTOMERS_DB as string);
    const customers = await db.collection(CUSTOMER_COLLECTION as string).findOne( {_firstName: "Allan"} );
    res.status(200).json(customers);
    console.log(`GET successful`);
    await client.close(); // close client


});

app.post('/api/portfolio/:name/upvote', async (req: Request, res: Response) => {

    await withDB( async (db: Db) => {
        const projectName = req.params.name;
        // find the project
        const project: any = await db.collection('Comments').findOne({ projectName: projectName});
        
        // update the project upvotes
        await db.collection('Comments').updateOne({ projectName: projectName},{
            '$set': {
                upvote: project.upvote + 1,
            },
        });

        // find the updated project to send back
        const updatedProject = await db.collection('Comments').findOne({ projectName: projectName });

        res.status(200).json(updatedProject);
    }, res);

});

app.post('/api/portfolio/:name/add-comment', async(req: Request, res: Response) => {
    const projectName = req.params.name; // url param
    const { username, text } = req.body; // request body destructured into the appropriate const

    await withDB( async (db: Db) => {
        // connect to the collection and query the db to find the correct project
        const projectInfo: any = await db.collection('Comments').findOne({ projectName: projectName });

        // update the object
        await db.collection('Comments').updateOne({ projectName: projectName }, {
            '$set': {
                // set comments to concat to the array using the object below
                comments: projectInfo.comments.concat({ username, text }),
            },
        });

        // retrieve the updated object to send back
        const updatedProject = await db.collection('Comments').findOne({ projectName: projectName });

        res.status(200).json(updatedProject);
    }, res);

});

/**
 * Serves the index.html file in the build folder
 */
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "client/build/index.html"));
});

app.listen(PORT, () => console.log(`App is listening on port ${PORT}`));

// Connects to mongodb and uses callback to determine what the function will perform
// CURRENTLY BROKEN :(
const withDB = async (operations: (database: Db) => Promise<void>, res: Response) => {

    try {
        console.dir("connecting to the mongo server...");
        await client.connect(); // connect to mongo
        console.log("connected successfully... connecting to the db...");
        const db = client.db(CUSTOMERS_DB as string);
        console.log("connected to db....");
        await operations(db);
        console.log('got out of the operations function call...')
        await client.close(); // close client

    } catch (err) {
        res.status(500).json({message: 'Error connecting to db!!', err});
    }
}


