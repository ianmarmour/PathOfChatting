const Window = require('./system/window')
const Text = require('./input/text')
const LogParser = require('./system/logging')
const { HttpLink} = require('apollo-link-http')
const { WebSocketLink } = require('apollo-link-ws')
const { ApolloServer, gql, PubSub } = require('apollo-server');

const CHAT_CHANNEL = 'messageRecieved';
const pubsub = new PubSub();

options = {separator: /[\r]{0,1}\n/, fromBeginning: false, fsWatchOptions: {}, follow: true, logger: console, flushAtEOF: true, useWatchFile: true}
this.tail = new Tail("C:\\Program Files (x86)\\Steam\\steamapps\\common\\Path of Exile\\logs\\Client.txt", options);
this.tail.on("line", function(data) {
    pubsub.publish(CHAT_CHANNEL, { messageRecieved: { text: data }});
    console.log(data);
});

const typeDefs = gql`
    type Query {
        messages: [Message]
    }

    type Mutation {
        sendMessage(message: String!): Message
    }

    type Message {
        text: String!
    }

    type Subscription {
        messageRecieved: Message
    }
`

const resolvers = {
    Mutation: {
        sendMessage: (root, args) => {
            const message = { text: args.message }
            window_controller = new Window()
            text_controller = new Text()

            window_controller.focusWindow()
            text_controller.submitMessage(args.message)
            pubsub.publish(CHAT_CHANNEL, { messageRecieved: { text: args.message }});
            return message;
        }
    },
    Subscription: {
        messageRecieved: {
            subscribe: () => pubsub.asyncIterator([CHAT_CHANNEL])
        }
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });