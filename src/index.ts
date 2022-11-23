import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { readFileSync, promises } from "fs";
import { Person } from "./ts/types/Person";

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
    persons: async (_, { id, geslacht, functie, fractielabel }) => {
      let users = await getDataInDir("./data/person");

      users = users.filter(
        (user: Person) => user.Id !== null && user.Achternaam !== null
      );

      if (id) {
        users = users.filter((user: Person) => user.Id === id);
      }

      if (geslacht) {
        users = users.filter((user: Person) => user.Geslacht === geslacht);
      }

      if (functie) {
        users = users.filter((user: Person) => user.Functie === functie);
      }

      if (fractielabel) {
        users = users.filter(
          (user: Person) => user.Fractielabel === fractielabel
        );
      }

      return users;
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
