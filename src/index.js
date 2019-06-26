const Window = require("./system/window");
const Text = require("./input/text");
Tail = require("tail").Tail;
const http = require("http");
const express = require("express");
const { ApolloServer, gql, PubSub } = require("apollo-server-express");
const config = require("config");

const CHAT_CHANNEL = "messageRecieved";
const pubsub = new PubSub();
const logConfig = config.get("LogLocation");

options = {
  separator: /[\r]{0,1}\n/,
  fromBeginning: false,
  fsWatchOptions: {},
  follow: true,
  logger: console,
  flushAtEOF: true,
  useWatchFile: true
};

this.tail = new Tail(logConfig, options);
this.tail.on("line", function(data) {
  // Generate the unique ID from base64 string encode.
  let buff = Buffer.from(data);
  let base64id = buff.toString("base64");

  let dateRegex = /^\d+\/\d+\/\d+\s\d+:\d+:\d+/;
  let createdDate = data.match(dateRegex)[0];
  let userRegex = /(\[INFO.*\])(.)(.*)(:)/;
  let userName = data.match(userRegex)[3];
  let user = { name: userName };

  let textRegex = /([^;].*:)(.*)/;
  let messagetext = data.match(textRegex)[2];
  if (!userName.includes("GeorginaSoros")) {
    pubsub.publish(CHAT_CHANNEL, {
      messageRecieved: {
        id: base64id,
        text: messagetext,
        createdAt: createdDate,
        user: user
      }
    });
  }
  console.log(data);
});

const typeDefs = gql`
  type Query {
    messages: [Message]
  }

  type Mutation {
    sendMessage(
      id: String!
      text: String!
      createdAt: String!
      user: UserInput!
    ): Message
  }

  type Message {
    id: String!
    text: String!
    createdAt: String!
    user: User!
  }

  input UserInput {
    name: String
  }
  type User {
    name: String!
  }

  type Subscription {
    messageRecieved: Message
  }
`;

const resolvers = {
  Mutation: {
    sendMessage: (root, args) => {
      const message = {
        id: args.id,
        text: args.text,
        createdAt: args.createdAt,
        user: args.user
      };
      window_controller = new Window();
      text_controller = new Text();

      window_controller.focusWindow();
      text_controller.submitMessage(args.text);
      console.log(message);
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
