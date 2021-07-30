import { toaster, Message } from "rsuite";

toaster.push(<Message type="info" showIcon closable>description</Message>);

toaster.push(<Message type="success" showIcon closable>description</Message>);

toaster.push(<Message type="warning" showIcon closable>description</Message>);

toaster.push(<Message type="error" showIcon closable>description</Message>);
