'use strict';

import {
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLInt
} from 'graphql';

import {events} from './events';

let count = 0;

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
            count: {
                type: GraphQLInt,
                description: 'The count!',
                resolve: (parent) => {
                    return count;
                }
            }
        }
    }),
    mutation: new GraphQLObjectType({
        name: 'RootMutationType',
        fields: {
            updateCount: {
                type: GraphQLInt,
                description: 'Updates the count',
                resolve: (parent, args) => {
                    count += 1;
                    events.emit('updateCount');
                    return count;
                }
            }
        }
    }),
    subscription: new GraphQLObjectType({
        name: 'RootSubscriptionType',
        fields: {
            updatedCount: {
                type: GraphQLInt,
                description: 'Updates the count',
                resolve: (parent, args, bla, queryAST) => {
                    if (('firedFrom' in parent) && parent.firedFrom === 'client') {
                        events.emit('subscribe', parent.socket, queryAST);
                        return '';
                    }
                    return count;
                }
            }
        }
    })
});

export default schema;
