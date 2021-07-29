import {
  FormGroup,
  FormControl,
  ControlLabel,
  ErrorMessage,
  HelpBlock,
} from "rsuite";

function App() {
  return (
    <FormGroup>
      <ControlLabel>Name</ControlLabel>
      <FormControl type="text" name="name" />
      <ErrorMessage>Error</ErrorMessage>
      <HelpBlock>Help</HelpBlock>
    </FormGroup>
  );
}
