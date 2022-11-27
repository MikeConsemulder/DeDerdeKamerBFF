import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { readFileSync, promises } from "fs";
import { Persoon } from "./ts/types/Persoon";
import { PersoonGeschenk } from "./ts/types/PersoonGeschenk";

const init = async () => {
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

  const getPersoonGeschenken = async () => {
    let persoonGeschenken: PersoonGeschenk[] = [];
    persoonGeschenken = await getDataInDir("./data/persoonGeschenk");

    persoonGeschenken = persoonGeschenken.filter(
      (persoonGeschenk: PersoonGeschenk) =>
        persoonGeschenk.Id !== null && persoonGeschenk.Persoon_Id !== null
    );

    return persoonGeschenken;
  };

  const getPersonen = async () => {
    let personen: Persoon[] = [];

    personen = await getDataInDir("./data/persoon");

    personen = personen.filter(
      (user: Persoon) => user.Id !== null && user.Achternaam !== null
    );

    return personen;
  };

  const personen = await getPersonen();
  const persoonGeschenken = await getPersoonGeschenken();

  const resolvers = {
    Persoon: {
      PersoonGeschenken(persoon: Persoon) {
        return persoonGeschenken
          .filter(
            (persoonGeschenk: PersoonGeschenk) =>
              persoonGeschenk.Persoon_Id === persoon.Id
          )
          .sort((a, b) => {
            return new Date(b.Datum).getTime() - new Date(a.Datum).getTime();
          });
      },
    },
    PersoonGeschenk: {
      Persoon(persoonGeschenk: PersoonGeschenk) {
        return personen.find((persoon: Persoon) => {
          return persoon.Id === persoonGeschenk.Persoon_Id;
        });
      },
    },
    Query: {
      personen: (_, { id, geslacht, functie, fractielabel }) => {
        let users = personen;

        if (id) {
          users = users.filter((user: Persoon) => user.Id === id);
        }

        if (geslacht) {
          users = users.filter((user: Persoon) => user.Geslacht === geslacht);
        }

        if (functie) {
          users = users.filter((user: Persoon) => user.Functie === functie);
        }

        if (fractielabel) {
          users = users.filter(
            (user: Persoon) => user.Fractielabel === fractielabel
          );
        }

        return users;
      },
      persoonGeschenken: () => {
        return persoonGeschenken;
      },
    },
  };

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
};

init();
