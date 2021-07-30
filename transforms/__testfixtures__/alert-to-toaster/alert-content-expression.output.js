import { toaster, Message } from "rsuite";

const message = "This is a test message";

toaster.push(<Message type="info" showIcon closable>{message}</Message>);
