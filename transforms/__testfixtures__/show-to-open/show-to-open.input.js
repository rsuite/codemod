import { Modal, Drawer, Whisper } from "rsuite";

function App() {
  return (
    <div>
      <Modal show={true} onShow={() => {}} onHide={() => {}} />
      <Drawer show={true} onShow={() => {}} onHide={() => {}} />
      <Whisper delayHide={1000} delayShow={1000} />
    </div>
  );
}
