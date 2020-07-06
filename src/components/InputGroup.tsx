import React, { FunctionComponent, useState } from "react";
import {
  Button,
  Grid,
  TextField,
  Typography,
  Theme,
} from "@material-ui/core";
import {
  createStyles,
  makeStyles,
} from "@material-ui/core/styles";

interface InputGroupProps {
  labels: string[];
  buttonLabel: string;
  warningText?: string;
  verifyInput: (input: string[]) => boolean;
  onInputChange?: (input: string[], refs: any[]) => void;
  onButtonClick: (input: string[]) => void;
}

interface StyleProps {
  displayErrorText: boolean;
}

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) => createStyles({
  inputErrorDisplay: {
    display: (props) => props.displayErrorText ? "inherit" : "none",
  },
}));

export const InputGroup: FunctionComponent<InputGroupProps> = (props) => {
  const warningText = props.warningText || "Endast siffror är tillåtna värden.";
  const defaultInputs = props.labels.map(() => "");
  const refs = props.labels.map(() => React.useRef());
  const [inputs, setInputs] = useState<string[]>(defaultInputs);
  const validInput = props.verifyInput(inputs);
  const emptyInput = inputs.some(value => value.length === 0);
  const updateInput = (index: number, value: string) => {
    inputs[index] = value;
    setInputs([...inputs]);
  };
  const buttonDisabled = () => !validInput || emptyInput;
  const onButtonClick = () => {
    props.onButtonClick(inputs);
    setInputs(defaultInputs);
  };
  const classes = useStyles({ displayErrorText: !validInput && !emptyInput});

  React.useEffect(() => {
    props.onInputChange && props.onInputChange(inputs, refs as any[]);
  }, [inputs, ...refs])

  return (
    <Grid container spacing={2} direction="row">
      {props.labels.map((label, index) => (
        <Grid key={label} item xs={12}>
          <TextField
            inputRef={refs[index]}
            label={label}
            type={label === "Lösenord" ? "password" : "text"}
            value={inputs[index]}
            onChange={(event) => updateInput(index, event.target.value)}
            onKeyDown={(event) => event.key === "Enter" &&
              !buttonDisabled() &&
              onButtonClick()}
          />
        </Grid>
      ))}
      <Grid item xs={12}>
        <Typography className={classes.inputErrorDisplay} variant="body2" color="error">
          {warningText}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Button
          disabled={buttonDisabled()}
          variant="contained"
          color="primary"
          onClick={onButtonClick}
        >
          {props.buttonLabel}
        </Button>
      </Grid>
    </Grid>
  );
};
