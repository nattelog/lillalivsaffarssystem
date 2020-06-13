import Chance from "chance";
import uuidv4 from "uuid/v4";

export interface DatabaseItem {
  id: string;
  submission: number;
  price: number;
}

export function buildDatabaseItem(submission: number, price: number): DatabaseItem {
  return {
    id: uuidv4(),
    submission,
    price,
  } as DatabaseItem;
}

export interface Database {
  create: (item: DatabaseItem) => Promise<void>;
  get: (chunkSize: number, chunkIndex: number) => Promise<DatabaseItem[]>;
  filterBy: (key: string, value: any) => Promise<DatabaseItem[]>;
  delete: (ids: string[]) => Promise<void>;
  size: () => Promise<number>;
}

interface DatabaseStubInternalDataType {
  [id: string]: DatabaseItem;
}

export class DatabaseStub implements Database {
  public static fromGeneratedData(seed: number) {
    const data: DatabaseStubInternalDataType = {};
    const chance = new Chance(seed);
    const noSubmissions = chance.integer({ min: 1, max: 10 });

    for (const submissionIndex of Array.from(Array(noSubmissions).keys())) {
      const submissionId = chance.integer({ min: 1000, max: 9999 });
      const noProducts = chance.integer({ min: 1, max: 10 });

      for (const productIndex of Array.from(Array(noProducts).keys())) {
        const price = chance.integer({ min: 5, max: 150 });
        const databaseItem = buildDatabaseItem(submissionId, price);

        data[databaseItem.id] = databaseItem;
      }
    }

    return new DatabaseStub(data);
  }

  private data: DatabaseStubInternalDataType;

  constructor(data: DatabaseStubInternalDataType) {
    this.data = data;
  }

  public async create(item: DatabaseItem) {
    this.data = {
      [item.id]: item,
      ...this.data,
    };
  }

  public async get(chunkSize: number, chunkIndex: number) {
    const start = chunkSize * chunkIndex;
    return Object.values(this.data).slice(start, start + chunkSize);
  }

  public async filterBy(key: string, value: any) {
    return Object.values(this.data).filter((data: any) => data[key] == value);
  }

  public async delete(ids: string[]) {
    for (const id of ids) {
      delete this.data[id];
    }
  }

  public async size() {
    return Object.keys(this.data).length;
  }
}

export class FirebaseDatabase implements Database {
  private readonly database: firebase.database.Database;
  private readonly ref: firebase.database.Reference;
  private items: DatabaseItem[];

  constructor(database: firebase.database.Database, path: string) {
    this.database = database;
    this.ref = database.ref(path);
    this.items = [];

    this.ref.on("child_added", (data: any) => {
      this.items.unshift(data.val());
    });

    this.ref.on("child_removed", (data: any) => {
      this.items = this.items.filter((item) => item.id !== data.key);
    });
  }

  public async create(item: DatabaseItem) {
    await this.ref.child(item.id).set(item);
  }

  public async get(chunkSize: number, chunkIndex: number) {
    const start = chunkSize * chunkIndex;

    if (this.items.length == 0) {
      const fetchedData = (await this.ref.orderByKey().once("value"));
      this.items = Object.values(fetchedData.val()).reverse() as DatabaseItem[];
    }

    return this.items.slice(start, start + chunkSize);
  }

  public async filterBy(key: string, value: any) {
    return this.items.filter((item: any) => item[key] == value);
  }

  public async delete(ids: string[]) {
    for (const id of ids) {
      await this.ref.child(id).remove();
    }
  }

  public size() {
    return Promise.resolve(this.items.length);
  }
}
