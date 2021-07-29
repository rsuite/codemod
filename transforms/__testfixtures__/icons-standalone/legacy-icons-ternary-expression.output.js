import { IconButton } from "rsuite";
import LegacyEyeIcon from "@rsuite/icons/legacy/Eye";
import LegacyEyeSlashIcon from "@rsuite/icons/legacy/EyeSlash";

function App() {
  return <IconButton icon={condition ? <LegacyEyeIcon /> : <LegacyEyeSlashIcon />} />;
}
