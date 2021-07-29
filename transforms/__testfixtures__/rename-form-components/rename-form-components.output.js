import { Form } from "rsuite";

function App() {
  return (
    <Form.Group>
      <Form.ControlLabel>Name</Form.ControlLabel>
      <Form.Control type="text" name="name" />
      <Form.ErrorMessage>Error</Form.ErrorMessage>
      <Form.HelpText>Help</Form.HelpText>
    </Form.Group>
  );
}
