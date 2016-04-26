import {EventEmitter2} from 'eventemitter2';
import {graphql} from 'graphql';
import schema from './schema';

let subscriptionStorage = {};

export const events = new EventEmitter2({
    wildcard: true,
    maxListeners: 500 // pq si
});

events.on('graphql:subscribe', (socketId, query) => {
    if (!(query.fieldName in subscriptionStorage)) {
        subscriptionStorage[query.fieldName] = {};
    }
    subscriptionStorage[query.fieldName][socketId] = query.operation.loc.source.body;
});

events.on('graphql:unsubscribe', (socket, query) => {
    delete subscriptionStorage[query.fieldName][socketId];
});

events.on('updatedCount', () => {
    if (subscriptionStorage.updatedCount) {
        Object.keys(subscriptionStorage.updatedCount).forEach(subscription => {
            graphql(schema, subscriptionStorage.updatedCount[subscription], {})
                .then(resolved => {
                        console.log(JSON.stringify(resolved, null, 2));
                    }
                );
        });
    }

});
