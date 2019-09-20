import React, { FunctionComponent, useState } from "react";
import {
  AppBar,
  Button,
  Container,
  Grid,
  Theme,
  Toolbar,
  Typography,
} from "@material-ui/core";
import {
  createStyles,
  makeStyles,
} from "@material-ui/core/styles";
import { Provision } from "./Provision";
import { Register } from "./Register";
import { DatabaseItem } from "../database";

interface AppProps {
  registeredItems: DatabaseItem[];
  filteredItems: DatabaseItem[];
  itemSize: number;
  pageSize: number;
  getItems: (chunkIndex: number) => void;
  createItem: (item: DatabaseItem) => void;
  deleteItems: (ids: string[]) => void;
  filterItems: (id: string) => void;
  clearFilter: () => void;
  signOut: () => void;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  container: {
    marginTop: "5rem",
  },
  item: {
    width: "100%",
  },
  paper: {
    padding: theme.spacing(2),
  },
}));

export const App: FunctionComponent<AppProps> = (props) => {
  const classes = useStyles({});
  const [pageIndex, setPageIndex] = useState(0);
  const changePageIndex = (index: number) => {
    props.getItems(index);
    setPageIndex(index);
  };

  return (
    <Container maxWidth="md">
      <AppBar>
        <Container maxWidth="md">
          <Toolbar>
            <Grid container direction="row" justify="space-between">
              <Grid item>
                <Typography variant="h6">Lilla Livs Garderob - Provision</Typography>
              </Grid>
              <Grid item>
                <Button color="inherit" onClick={props.signOut}>Logga ut</Button>
              </Grid>
            </Grid>
          </Toolbar>
        </Container>
      </AppBar>
      <Grid
        container
        justify="center"
        spacing={2}
        className={classes.container}
      >
        <Grid item sm={6}>
          <Register
            items={props.registeredItems}
            itemSize={props.itemSize}
            pageIndex={pageIndex}
            pageSize={props.pageSize}
            onChangePageIndex={changePageIndex}
            onGet={props.getItems}
            onRegister={props.createItem}
            onDelete={props.deleteItems}
          />
        </Grid>
        <Grid item sm={6}>
          <Provision
            items={props.filteredItems}
            onFilter={props.filterItems}
            clearFilter={props.clearFilter}
          />
        </Grid>
      </Grid>
    </Container>
  );
}
