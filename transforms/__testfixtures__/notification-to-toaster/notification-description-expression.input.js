import { Notification } from "rsuite";

Notification.warning({
  title: "服务维护中，请稍后再试",
  description: `${thrown.response.status} ${thrown.response.statusText}`,
  duration: 5000,
});

Notification.error({
  title: `请求错误：${thrown.response.data.message ?? "未知错误"}`,
  description: `${thrown.response.status} ${thrown.response.statusText}`,
});
