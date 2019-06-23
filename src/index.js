const Window = require("./system/window");
const Text = require("./input/text");
Tail = require("tail").Tail;
const http = require("http");
const express = require("express");
const { ApolloServer, gql, PubSub } = require("apollo-server-express");
const config = require('config');

const CHAT_CHANNEL = "messageRecieved";
const pubsub = new PubSub();
const logConfig = config.get('LogLocation')
//logConfig.replace("\", "\\")

options = {
  separator: /[\r]{0,1}\n/,
  fromBeginning: false,
  fsWatchOptions: {},
  follow: true,
  logger: console,
  flushAtEOF: true,
  useWatchFile: true
};
this.tail = new Tail(
    logConfig,
  options
);
this.tail.on("line", function(data) {
  pubsub.publish(CHAT_CHANNEL, { messageRecieved: { text: data } });
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
`;

const resolvers = {
  Mutation: {
    sendMessage: (root, args) => {
      const message = { text: args.message };
      window_controller = new Window();
      text_controller = new Text();

      window_controller.focusWindow();
      text_controller.submitMessage(args.message);
      pubsub.publish(CHAT_CHANNEL, { messageRecieved: { text: args.message } });
      return message;
    }
  },
  Subscription: {
    messageRecieved: {
      subscribe: () => pubsub.asyncIterator([CHAT_CHANNEL])
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const app = express();
server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const PORT = 4000;
// ⚠️ Pay attention to the fact that we are calling `listen` on the http server variable, and not on `app`.
httpServer.listen(PORT, () => {
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${PORT}${
      server.subscriptionsPath
    }`
  );
});
