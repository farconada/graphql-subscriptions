'use strict';

import {
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLInt,
    GraphQLString,
    GraphQLList
} from 'graphql';
import {promisify} from 'bluebird';
import {events} from './events';

let count = 0;

const StoryType = new GraphQLObjectType({
    name: 'StoryType',
    fields: {
        id: {
            type: GraphQLInt
        },
        text: {
            type: GraphQLString
        }
    }
});

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
            cuenta: {
                type: GraphQLInt,
                description: 'The count!',
                resolve: (parent) => {
                    const db = parent.db;
                    db.all = promisify(db.all);
                    return db.all('SELECT count(*) as cuenta FROM Story')
                        .then((data) => {
                                return data[0].cuenta;
                        }
                    );
                }
            },
            stories: {
                type: new GraphQLList(StoryType),
                description: 'Listado de historias',
                resolve: (parent) => {
                    const db = parent.db;
                    db.all = promisify(db.all);
                    return db.all('SELECT id, text FROM Story')
                        .then((data) => {
                                return data;
                            }
                        );
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
