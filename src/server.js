'use strict';
import {graphql} from 'graphql';
import bodyParser from 'body-parser';
import express from 'express';
import schema from './schema';

const app = express();

const PORT = 3000;

const server = app.listen(PORT, function() {
    const host = server.address().address;
    const port = server.address().port;

    console.log('GraphQL listening at http://%s:%s', host, port);
});
const io = require('socket.io')(server);

app.get('/client', (req, res) => {
    return res.sendFile(__dirname + '/client/index.html');
});

// parse POST body as text
app.use(bodyParser.text({type: 'application/graphql'}));

app.post('/graphql', (req, res) => {
    // execute GraphQL!
    return graphql(schema, req.body)
        .then(resolved => {
            return res.send(JSON.stringify(resolved, null, 2));
        }
    );
});


io.on('connection', socket => {
    socket.on('graphql:subscribe', data => {
        graphql(schema, data, {socket, operation: 'subscribe', query: data})
            .then(resolved => {
                    return JSON.stringify(resolved, null, 2);
                }
            );
    });

    socket.on('graphql:unsubscribe', data => {
        graphql(schema, data, {socket, operation: 'unsubscribe', query: data})
            .then(resolved => {
                    return JSON.stringify(resolved, null, 2);
                }
            );
    });
});
