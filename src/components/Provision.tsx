import React, { FunctionComponent, useState } from "react";
import {
  Grid,
  Paper,
  TextField,
  Theme,
  Typography,
  Button,
} from "@material-ui/core";
import {
  createStyles,
  makeStyles,
} from "@material-ui/core/styles";
import { AlignType, SelectableTable } from "./SelectableTable";
import { DatabaseItem } from "../database";
import { InputGroup } from "./InputGroup";

interface ProvisionProps {
  items: DatabaseItem[];
  onFilter: (id: string) => void;
  clearFilter: () => void;
}

interface ProvisionInformationProps {
  items: DatabaseItem[];
  clearFilter: () => void;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  paper: {
    padding: theme.spacing(2),
  },
}));
const sumTableHeaderConfig = {
  order: ["description", "value"],
  config: {
    description: {
      text: "Beskrivning",
      align: "left" as AlignType,
    },
    value: {
      text: "Värde",
      align: "left" as AlignType,
    },
  },
};
const productTableHeaderConfig = {
  order: ["price", "sharePercent", "shareResult"],
  config: {
    price: {
      text: "Pris (kr)",
      align: "right" as AlignType,
    },
    sharePercent: {
      text: "Andel provision (%)",
      align: "right" as AlignType,
    },
    shareResult: {
      text: "Andel provision (kr)",
      align: "right" as AlignType,
    },
  },
};

const ProvisionInformation: FunctionComponent<ProvisionInformationProps> = (props) => {
  const itemsBody = props.items.map(item => {
    const sharePercent = item.price >= 300 ? 0.5 : 0.4;
    const shareResult = item.price * sharePercent;

    return {
      id: item.id,
      price: item.price,
      sharePercent: sharePercent * 100,
      shareResult,
    };
  });
  const sumTotal = props.items.reduce((s, item) => s + item.price, 0);
  const sumProvision = itemsBody.reduce((s, item) => s + item.shareResult, 0);
  const sumTable = [
    {
      id: "0",
      description: "Inlämningsnummer",
      value: props.items[0].submission,
    },
    {
      id: "1",
      description: "Antal varor",
      value: props.items.length,
    },
    {
      id: "2",
      description: "Summa total",
      value: `${sumTotal} kr`,
    },
    {
      id: "3",
      description: "Summa provision",
      value: `${sumProvision} kr`,
    },
  ];

  return (
    <React.Fragment>
      <Grid item xs={12}>
        <Grid
          container
          spacing={2}
          justify="space-between"
        >
          <Grid item>
            <Typography variant="h5">Beräknad provision</Typography>
          </Grid>
          <Grid item>
            <Button onClick={props.clearFilter}>Rensa</Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <SelectableTable
          headers={sumTableHeaderConfig}
          showHeaders={false}
          body={sumTable}
          selectable={false}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h5">Sålda varor</Typography>
      </Grid>
      <Grid item>
        <SelectableTable
          headers={productTableHeaderConfig}
          body={itemsBody}
          selectable={false}
        />
      </Grid>
    </React.Fragment>
  );
};

const NoProvisionInformation = () => (
  <Grid item>
    <Typography variant="body2">Inga varor hittade</Typography>
  </Grid>
);

export const Provision: FunctionComponent<ProvisionProps> = (props) => {
  const classes = useStyles({});
  const [searchInitiated, setSearchInitiated] = useState<boolean>(false);
  const verifyInput = (input: string[]) => input.every(val => /^\d*$/.test(val));
  const onCalculateProvision = (input: string[]) => {
    setSearchInitiated(true);
    props.onFilter(input[0]);
  };
  const onClearClick = () => {
    setSearchInitiated(false);
    props.clearFilter();
  };
  let provisionInformation: any;

  if (props.items.length === 0) {
    if (searchInitiated) {
      provisionInformation = <NoProvisionInformation />;
    } else {
      provisionInformation = null;
    }
  } else {
    provisionInformation = <ProvisionInformation items={props.items} clearFilter={onClearClick} />
  }

  return (
    <Paper className={classes.paper}>
      <Grid container spacing={2} direction="column">
        <Grid item>
          <Typography variant="h5">Beräkna provision</Typography>
        </Grid>
        <Grid item>
          <InputGroup
            labels={["Inlämningsnummer"]}
            buttonLabel="Beräkna"
            verifyInput={verifyInput}
            onButtonClick={onCalculateProvision}
          />
        </Grid>
        {provisionInformation}
      </Grid>
    </Paper>
  );
};
