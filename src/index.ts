import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { readFileSync, promises } from "fs";
import { Persoon } from "./ts/types/Persoon";
import { PersoonGeschenk } from "./ts/types/PersoonGeschenk";
import { PersoonNevenFunctie } from "./ts/types/PersoonNevenFunctie";
import { PersoonNevenFunctieInkomsten } from "./ts/types/PersoonNevenFunctieInkomsten";
import { PersoonReis } from "./ts/types/PersoonReis";
import { FractieZetelPersoon } from "./ts/types/FractieZetelPersoon";
import { FractieZetel } from "./ts/types/FractieZetel";
import { Fractie } from "./ts/types/Fractie";

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

  const getPersoonReizen = async () => {
    let persoonReizen: PersoonReis[] = [];
    persoonReizen = await getDataInDir("./data/persoonReis");

    persoonReizen = persoonReizen.filter(
      (persoonReis: PersoonReis) =>
        persoonReis.Id !== null && persoonReis.Persoon_Id !== null
    );

    return persoonReizen;
  };

  const getPersoonNevenFunctie = async () => {
    let persoonNevenFuncties: PersoonNevenFunctie[] = [];
    persoonNevenFuncties = await getDataInDir("./data/nevenFunctie");

    persoonNevenFuncties = persoonNevenFuncties.filter(
      (persoonNevenFunctie: PersoonNevenFunctie) =>
        persoonNevenFunctie.Id !== null
    );

    return persoonNevenFuncties;
  };

  const getPersoonNevenFunctieInkomsten = async () => {
    let persoonNevenFunctiesInkomsten: PersoonNevenFunctieInkomsten[] = [];
    persoonNevenFunctiesInkomsten = await getDataInDir(
      "./data/nevenFunctieInkomsten"
    );

    persoonNevenFunctiesInkomsten = persoonNevenFunctiesInkomsten.filter(
      (persoonNevenFunctieInkomsten: PersoonNevenFunctieInkomsten) =>
        persoonNevenFunctieInkomsten.Id !== null &&
        persoonNevenFunctieInkomsten.Nevenfunctie_Id !== null
    );

    return persoonNevenFunctiesInkomsten;
  };

  const getFractieZetelPersonen = async () => {
    let fractieZetelPersonen: FractieZetelPersoon[] = [];
    fractieZetelPersonen = await getDataInDir("./data/fractieZetelPersoon");

    fractieZetelPersonen = fractieZetelPersonen.filter(
      (fractieZetelPersoon: FractieZetelPersoon) =>
        fractieZetelPersoon.Id !== null &&
        fractieZetelPersoon.Persoon_Id !== null &&
        fractieZetelPersoon.FractieZetel_Id !== null
    );

    return fractieZetelPersonen;
  };

  const getFractieZetels = async () => {
    let fractieZetel: FractieZetel[] = [];
    fractieZetel = await getDataInDir("./data/fractieZetel");

    fractieZetel = fractieZetel.filter(
      (fractieZetel: FractieZetel) =>
        fractieZetel.Id !== null && fractieZetel.Fractie_Id !== null
    );

    return fractieZetel;
  };

  const getFracties = async () => {
    let fractie: Fractie[] = [];
    fractie = await getDataInDir("./data/fractie");

    fractie = fractie.filter(
      (fractie: Fractie) =>
        fractie.Id !== null &&
        fractie.NaamNL !== null &&
        fractie.Afkorting !== null
    );

    return fractie;
  };

  const personen = await getPersonen();
  const persoonGeschenken = await getPersoonGeschenken();
  const persoonReizen = await getPersoonReizen();
  const persoonNevenFuncties = await getPersoonNevenFunctie();
  const persoonNevenFunctieInkomsten = await getPersoonNevenFunctieInkomsten();
  const fracties = await getFracties();
  const fractieZetels = await getFractieZetels();
  const fractieZetelPersonen = await getFractieZetelPersonen();

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
      PersoonReizen(persoon: Persoon) {
        return persoonReizen
          .filter(
            (persoonReis: PersoonReis) => persoonReis.Persoon_Id === persoon.Id
          )
          .sort((a, b) => {
            return new Date(b.Van).getTime() - new Date(a.Van).getTime();
          });
      },
      PersoonNevenFuncties(persoon: Persoon) {
        return persoonNevenFuncties.filter(
          (persoonNevenFunctie: PersoonNevenFunctie) =>
            persoonNevenFunctie.PersoonId === persoon.Id
        );
      },
      FractieZetelsPersoon(persoon: Persoon) {
        return fractieZetelPersonen.filter(
          (fractieZetelPersoon: FractieZetelPersoon) =>
            fractieZetelPersoon.Persoon_Id === persoon.Id
        );
      },
    },
    PersoonGeschenk: {
      Persoon(persoonGeschenk: PersoonGeschenk) {
        return personen.find((persoon: Persoon) => {
          return persoon.Id === persoonGeschenk.Persoon_Id;
        });
      },
    },
    PersoonReis: {
      Persoon(persoonReis: PersoonReis) {
        return personen.find((persoon: Persoon) => {
          return persoon.Id === persoonReis.Persoon_Id;
        });
      },
    },
    PersoonNevenFunctie: {
      Persoon(persoonNevenFunctie: PersoonNevenFunctie) {
        return personen.find((persoon: Persoon) => {
          return persoon.Id === persoonNevenFunctie.PersoonId;
        });
      },
      PersoonNevenFunctieInkomsten(persoonNevenFunctie: PersoonNevenFunctie) {
        return persoonNevenFunctieInkomsten.filter(
          (a: PersoonNevenFunctieInkomsten) =>
            a.Nevenfunctie_Id === persoonNevenFunctie.Id
        );
      },
    },
    PersoonNevenFunctieInkomsten: {
      PersoonNevenFunctie(
        persoonNevenFunctieInkomsten: PersoonNevenFunctieInkomsten
      ) {
        return persoonNevenFuncties.find(
          (nevenFunctie: PersoonNevenFunctie) => {
            return (
              nevenFunctie.Id === persoonNevenFunctieInkomsten.Nevenfunctie_Id
            );
          }
        );
      },
    },
    FractieZetelPersoon: {
      FractieZetel(fractieZetelPersoon: FractieZetelPersoon) {
        return fractieZetels.find((fractieZetel: FractieZetel) => {
          return fractieZetel.Id === fractieZetelPersoon.FractieZetel_Id;
        });
      },
    },
    FractieZetel: {
      Fractie(fractieZetel: FractieZetel) {
        return fracties.find((fractie: Fractie) => {
          return fractie.Id === fractieZetel.Fractie_Id;
        });
      },
    },
    Query: {
      personen: (_, { id, geslacht, functie }) => {
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

        return users;
      },
      persoonGeschenken: () => {
        return persoonGeschenken;
      },
      persoonReizen: () => {
        return persoonReizen;
      },
      persoonNevenFuncties: () => {
        return persoonNevenFuncties;
      },
      persoonNevenFunctieInkomsten: () => {
        return persoonNevenFunctieInkomsten;
      },
      fracties: () => {
        return fracties;
      },
      fractieZetels: () => {
        return fractieZetels;
      },
      fractieZetelPersonen: () => {
        return fractieZetelPersonen;
      },
    },
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀  Server ready at: ${url}`);
};

init();
