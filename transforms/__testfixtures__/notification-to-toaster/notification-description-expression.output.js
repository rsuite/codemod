import { toaster, Notification } from "rsuite";

toaster.push(
  <Notification type="warning" header="服务维护中，请稍后再试" duration={5000} closable>{`${thrown.response.status} ${thrown.response.statusText}`}</Notification>
);

toaster.push(<Notification
  type="error"
  header={`请求错误：${thrown.response.data.message ?? "未知错误"}`}
  closable>{`${thrown.response.status} ${thrown.response.statusText}`}</Notification>);
