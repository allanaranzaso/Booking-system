// import express from 'express';
// import bodyParser from 'body-parser';
// import path from 'path';
import { Request, Response} from "express";
import { Db } from "mongodb";

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const { API_URL, PORT } = process.env;
const client = new MongoClient(API_URL);
console.log(__dirname)
app.use(express.static(path.join(__dirname, 'client/build'))); // tells express where the files to be served are located
app.use(bodyParser.json()); // parses json object along with post request. Adds body prop to request param... access the json properties by using req.body.jsonProp

/**
 * Get a projects information
 * @param name - the name of the project to retrieve
 */
app.get('/api/portfolio/:name', async (req: Request, res: Response) => {

    await withDB(async (db: Db) => {
        const projectName = req.params.name;
        const project = await db.collection('Comments').findOne({projectName: projectName});

        res.status(200).json(project);
    }, res);

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
const withDB = async (operations: any, res: Response) => {
    try{
        await client.connect(); // connect to mongo

        const db = client.db("Projects");

        await operations(db);

        await client.close(); // close client
    } catch (err) {
        res.status(500).json({ message: 'Error connecting to db', err });
    }
}
