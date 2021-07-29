import { Icon, IconButton } from "rsuite";

function App() {
  return <IconButton icon={<Icon icon={condition ? "eye" : "eye-slash"} />} />;
}
