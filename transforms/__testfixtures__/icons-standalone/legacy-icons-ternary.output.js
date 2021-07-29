import LegacyEyeIcon from "@rsuite/icons/legacy/Eye";
import LegacyEyeSlashIcon from "@rsuite/icons/legacy/EyeSlash";

function App() {
  return (
    <div>
      {condition ? <LegacyEyeIcon /> : <LegacyEyeSlashIcon />}
    </div>
  );
}
