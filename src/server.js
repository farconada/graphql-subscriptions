'use strict';
import {graphql} from 'graphql';
import bodyParser from 'body-parser';
import express from 'express';
import sqlite3 from 'sqlite3';
import schema from './schema';

const app = express();

const PORT = 3000;
const db = new sqlite3.Database(__dirname + '/../database.db');

const server = app.listen(PORT, function() {
    const host = server.address().address;
    const port = server.address().port;

    console.log('GraphQL listening at http://%s:%s', host, port);
});
const io = require('socket.io')(server);

// parse POST body as text
app.use(bodyParser.text({type: 'application/graphql'}));

app.post('/graphql', (req, res) => {
    // execute GraphQL!
    return graphql(schema, req.body, {db, io})
        .then(resolved => {
            return res.send(JSON.stringify(resolved, null, 2));
        }
    );
});

app.get('/client', (req, res) => {
    return res.sendFile(__dirname + '/client/index.html');
});


io.on('connection', socket => {
    socket.on('graphql', data => {
        /**
         * cuando hay un mensaje desde el cliente al server en el canal de socket.io: es una subscripcion
         * hay que determinar a qué te subscribes
         */
        graphql(schema, data, {socket, firedFrom: 'client', query: data})
            .then(resolved => {
                    return JSON.stringify(resolved, null, 2);
                }
            );
    });
});
