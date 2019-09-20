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
  filter: (predicate: (item: DatabaseItem) => boolean) => Promise<DatabaseItem[]>;
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

  public async filter(predicate: (item: DatabaseItem) => boolean) {
    return Object.values(this.data).filter(predicate);
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

  constructor(database: firebase.database.Database) {
    this.database = database;
    this.ref = database.ref("products");
  }

  public async create(item: DatabaseItem) {
    await this.ref.push(item)
  }

  public async get(chunkSize: number, chunkIndex: number) {
    const data = (await this.getSnapshot()).val() || {};
    const start = chunkSize * chunkIndex;
    return Object.values(data).slice(start, start + chunkSize) as DatabaseItem[];
  }

  public async filter(predicate: (item: DatabaseItem) => boolean) {
    const data = (await this.getSnapshot()).val() || {};

    return Object.values(data).filter(predicate) as DatabaseItem[];
  }

  public async delete(ids: string[]) {
    const data = (await this.getSnapshot()).val() || {};
    const firebaseIds = Object.keys(data).filter(key => ids.includes(data[key].id));

    for (const realId of firebaseIds) {
      await this.database.ref(`products/${realId}`).remove();
    }
  }

  public async size() {
    const snapshot = await this.getSnapshot();

    return snapshot.numChildren();
  }

  private async getSnapshot() {
    return this.ref.once("value");
  }
}
