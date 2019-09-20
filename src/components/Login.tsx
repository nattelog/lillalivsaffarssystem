import React, { FunctionComponent, useState } from "react";
import {
  Container,
  Grid,
  Paper,
  Theme,
  Typography,
} from "@material-ui/core";
import {
  createStyles,
  makeStyles,
} from "@material-ui/core/styles";
import { InputGroup }  from "./InputGroup";

interface LoginProps {
  onLogin: (username: string, password: string) => void;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  container: {
    marginTop: "8rem",
  },
  paper: {
    padding: theme.spacing(2),
    maxWidth: "20rem",
    textAlign: "center",
  }
}));

export const Login: FunctionComponent<LoginProps> = (props) => {
  const classes = useStyles({});
  const [isRetry, setIsRetry] = useState<boolean>(false);
  const verifyInput = ([username]: string[]) => /^[\w\.]+@[\w\.]+$/.test(username)
  const onButtonClick = ([username, password]: string[]) => {
    setIsRetry(true);
    props.onLogin(username, password);
  };

  return (
    <Container maxWidth="md">
        <Grid
          container
          className={classes.container}
          justify="center"
          alignContent="center"
          spacing={2}
        >
          <Grid item>
            <Paper className={classes.paper}>
              <Grid container justify="center" spacing={2}>
                <Grid item>
                  <Typography variant="h5">Lilla Livs Garderob</Typography>
                  <Typography variant="caption">Beräkna provision</Typography>
                </Grid>
                {isRetry && <Grid item>
                  <Typography variant="body2" color="error">Felaktiga användaruppgifter</Typography>
                </Grid>}
                <Grid item>
                  <InputGroup
                    labels={["Användarnamn", "Lösenord"]}
                    buttonLabel="Logga in"
                    warningText="Ogiltigt användarnamn"
                    onButtonClick={onButtonClick}
                    verifyInput={verifyInput}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
    </Container>
  );
};
