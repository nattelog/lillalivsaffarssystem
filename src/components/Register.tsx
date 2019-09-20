import React, { FunctionComponent, useState, useEffect } from "react";
import {
  Grid,
  Paper,
  TextField,
  Theme,
  Typography,
  Button,
  TablePagination,
} from "@material-ui/core";
import {
  createStyles,
  makeStyles,
} from "@material-ui/core/styles";
import { DatabaseItem, buildDatabaseItem } from "../database";
import { SelectableTable, AlignType, KeyType } from "./SelectableTable";
import { InputGroup } from "./InputGroup";

interface RegisterProps {
  items: DatabaseItem[];
  itemSize: number;
  pageSize: number;
  pageIndex: number;
  onChangePageIndex: (index: number) => void;
  onGet: (chunkIndex: number) => void;
  onRegister: (item: DatabaseItem) => void;
  onDelete: (ids: string[]) => void;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  paper: {
    padding: theme.spacing(2),
  },
}));
const headerConfig = {
  order: ["submission", "price"],
  config: {
    submission: {
      text: "Inlämningsnummer",
      align: "right" as AlignType,
    },
    price: {
      text: "Pris (kr)",
      align: "right" as AlignType,
    },
  },
};

export const Register: FunctionComponent<RegisterProps> = (props) => {
  const [selectedKeys, setSelectedKeys] = useState<KeyType[]>([])
  const paginationLabelDisplayedRows = ({ from, to, count }: { from: number, to: number, count: number }) =>
    `${from}-${to} av ${count}`
  const classes = useStyles({});
  const verifyInput = (input: string[]) => input.every(val => /^\d*$/.test(val));
  const onRegisterInput = (input: string[]) => props.onRegister(buildDatabaseItem(parseInt(input[0]),
                                                                                  parseInt(input[1])));

  useEffect(() => {
    setSelectedKeys([]);
  }, [props.items]);

  return (
    <Paper className={classes.paper}>
      <Grid container spacing={2} direction="row">
        <Grid item xs={12}>
          <Typography variant="h5">Registrera såld vara</Typography>
        </Grid>
        <Grid item xs={12}>
          <InputGroup
            labels={["Inlämningsnummer", "Pris"]}
            buttonLabel="Registrera"
            verifyInput={verifyInput}
            onButtonClick={onRegisterInput}
          />
        </Grid>
        <Grid item xs={12}>
          <Grid
            container
            spacing={2}
            justify="space-between"
          >
            <Grid item>
              <Typography variant="h5">Senast registrerade varor</Typography>
            </Grid>
            <Grid item>
              <Button
                disabled={selectedKeys.length === 0}
                onClick={() => props.onDelete(selectedKeys)}
              >
                Ta bort
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <SelectableTable
            headers={headerConfig}
            body={props.items}
            selectable={true}
            onSelect={setSelectedKeys}
          />
        </Grid>
        <Grid item xs={12}>
          <TablePagination
            component="div"
            labelDisplayedRows={paginationLabelDisplayedRows}
            rowsPerPageOptions={[]}
            count={props.itemSize}
            onChangePage={(event, index) => props.onChangePageIndex(index)}
            page={props.pageIndex}
            rowsPerPage={props.pageSize}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
