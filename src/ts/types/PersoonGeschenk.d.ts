export type PersoonGeschenk = {
  Id: string | null;
  Omschrijving: string | null;
  Datum: string | null;
  Gewicht: number | null;
  GewijzigdOp: string | null;
  ApiGewijzigdOp: string | null;
  Verwijderd: boolean | null;
  Persoon_Id: string | null;
};

export type PersoonGeschenkResponse = {
  ["@odata.context"]: string;
  value: PersoonGeschenk[];
  ["@odata.nextLink"]: string;
};
