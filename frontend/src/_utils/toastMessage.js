import { toast } from "react-toastify";
export const successType = "success";

export const toastMessage = (msg, type) => {
  if (type === successType) {
    toast.dismiss();
    toast.success(msg);
  } else {
    toast.dismiss();
    toast.error(msg);
  }
};
