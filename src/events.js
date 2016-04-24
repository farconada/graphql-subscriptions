import {EventEmitter2} from 'eventemitter2';
import {graphql} from 'graphql';
import schema from './schema';

let subscriptionStorage = {};

export const events = new EventEmitter2({
    wildcard: true,
    maxListeners: 500 // pq si
});

events.on('subscribe', (socket, query) => {
    // apuntarse a la lista de subscritos
    if (!Array.isArray(subscriptionStorage.updatedCount)) {
        subscriptionStorage.updatedCount = [];
    }
    subscriptionStorage.updatedCount.push({client: socket.id, query});

});

events.on('updateCount', () => {
    if (Array.isArray(subscriptionStorage.updatedCount)) {
        subscriptionStorage.updatedCount.forEach(subscription => {
            graphql(schema, subscription.query, {})
                .then(resolved => {
                        console.log(JSON.stringify(resolved, null, 2));
                    }
                );
        });
    }

});
