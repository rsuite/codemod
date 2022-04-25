import { Modal, Drawer, Whisper } from "rsuite";

function App() {
  return (
    <div>
      <Modal open={true} onOpen={() => {}} onClose={() => {}} />
      <Drawer open={true} onOpen={() => {}} onClose={() => {}} />
      <Whisper delayClose={1000} delayOpen={1000} />
    </div>
  );
}
