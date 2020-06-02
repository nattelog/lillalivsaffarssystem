import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  CssBaseline,
  Grid,
  Theme,
} from "@material-ui/core";
import {
  createStyles,
  makeStyles,
} from "@material-ui/core/styles";
import * as firebase from "firebase/app";
import "firebase/auth"
import "firebase/database"
import { DatabaseStub, FirebaseDatabase, DatabaseItem } from "../database";
import { AuthStub, FirebaseAuth } from "../auth";
import { App } from "./App";
import { Login } from "./Login";

type ViewType = "Init" | "Idle" | "Authenticate" | "Login" | "Loading" | "App";

const useStyles = makeStyles((theme: Theme) => createStyles({
  container: {
    height: "100vh",
  },
}));

const firebaseConfig = {
  apiKey: "AIzaSyCwIU6hcmdaEwygrMnVPnzX6qxiuw-eJS0",
  authDomain: "lilla-livs-garderob-6d3f8.firebaseapp.com",
  databaseURL: "https://lilla-livs-garderob-6d3f8.firebaseio.com",
  projectId: "lilla-livs-garderob-6d3f8",
  storageBucket: "",
  messagingSenderId: "976277384127",
  appId: "1:976277384127:web:52c23f5683b66288d10f0a"
};

firebase.initializeApp(firebaseConfig);

// const database = DatabaseStub.fromGeneratedData(1);
const database = new FirebaseDatabase(firebase.database(), "products");
// const auth = new AuthStub();
const auth = new FirebaseAuth(firebase.auth());
const Loading = () => (
  <Grid className={useStyles({}).container} container justify="center" alignContent="center">
    <Grid item>
      <CircularProgress />
    </Grid>
  </Grid>
);

export const Router = () => {
  const [view, setView] = useState<ViewType>("Init");
  const [registeredItems, setRegisteredItems] = useState<DatabaseItem[] | undefined>(undefined);
  const [filteredItems, setFilteredItems] = useState<DatabaseItem[]>([]);
  const [itemSize, setItemSize] = useState<number>(0);
  const pageSize = 10;

  const onLogin = (username: string, password: string) => {
    setView("Idle");

    auth.authenticate(username, password).then(ok => {
      if (ok) {
        setView("Loading");
      } else {
        setView("Login");
      }
    });
  };
  const signOut = () => {
    setView("Idle");
    auth.signOut().then(() => setView("Init"));
  };

  const getItems = (chunkIndex: number) => database.get(pageSize, chunkIndex)
    .then(items => setRegisteredItems(items))
    .then(() => database.size())
    .then(size => setItemSize(size));
  const createItem = (item: DatabaseItem) => database.create(item).then(() => getItems(0));
  const deleteItems = (ids: string[]) => database.delete(ids).then(() => {
    getItems(0);
    setFilteredItems([]);
  });
  const filterItems = (id: string) => database.filterBy("submission", parseInt(id))
    .then(items => setFilteredItems(items));
  const clearFilter = () => setFilteredItems([]);

  useEffect(() => {
    if (view === "Init") {
      auth.isAuthenticated().then(ok => {
        if (ok) {
          setView("Loading");
        } else {
          setView("Login");
        }
      });
    }

    if (view === "Loading") {
      getItems(0).then(() => setView("App"));
    }
  }, [view]);

  return (
    <React.Fragment>
      <CssBaseline />
      {["Init", "Idle", "Authenticate", "Loading"].includes(view) && <Loading />}
      {view === "Login" && <Login
                             onLogin={onLogin}
                           />}
      {view === "App" && <App
                           registeredItems={registeredItems}
                           filteredItems={filteredItems}
                           itemSize={itemSize}
                           pageSize={pageSize}
                           createItem={createItem}
                           deleteItems={deleteItems}
                           getItems={getItems}
                           filterItems={filterItems}
                           clearFilter={clearFilter}
                           signOut={signOut}
                         />}
    </React.Fragment>
  );
};
