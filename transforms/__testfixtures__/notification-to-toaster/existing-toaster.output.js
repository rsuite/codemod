import { toaster, Notification } from "rsuite";

toaster.push(
  <Notification type="info" header="info" duration={4500} closable>description</Notification>,
  {
    placement: "topStart"
  }
);
