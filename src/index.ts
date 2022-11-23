import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { readFileSync, promises } from "fs";

const typeDefs = readFileSync("./schema.graphql", { encoding: "utf-8" });

const getDataInDir = async (dirname) => {
  let array = [];
  const filenames = await promises.readdir(dirname);

  for (const filename of filenames) {
    const fileContent = await promises.readFile(
      `${dirname}/${filename}`,
      "utf-8"
    );

    array = array.concat(Object.values(JSON.parse(fileContent)));
  }

  return array;
};

const resolvers = {
  Query: {
    persons: async () => {
      return await getDataInDir("./data/person");
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
