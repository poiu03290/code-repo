import { toast, ToastOptions } from "react-toastify";
import ToastCloseButton from "@components/Common/ToastModalCloseButton";
import CloseIcon from "@svg/ic_admin_x-mark.svg?react";

type ToastType = "user" | "admin" | "bottom";

const defaultToastOptions: ToastOptions = {
  position: "top-right",
  autoClose: 2000,
  hideProgressBar: true,
  rtl: false,
  bodyClassName: "flex items-center w-full pl-5",
};

const userToastOptions: ToastOptions = {
  ...defaultToastOptions,
  icon: <img src={Check} loading="lazy" className="min-size-[32px]" />,
  closeButton: (
    <ToastCloseButton onClick={() => toast.dismiss()}>닫기</ToastCloseButton>
  ),
  className: "bg-white flex items-center justify-center py-2",
};

const adminToastOptions: ToastOptions = {
  ...defaultToastOptions,
  position: "top-center",
  icon: false,
  closeButton: (
    <ToastCloseButton onClick={() => toast.dismiss()}>
      <CloseIcon className="stroke-white" />
    </ToastCloseButton>
  ),
};

const bottomToastOptions: ToastOptions & { className: string } = {
  ...defaultToastOptions,
  position: "bottom-center",
  icon: false,
  closeButton: false,
  className: "!bg-black !text-white !opacity-90 text-center",
  bodyClassName: "font-normal w-full",
};

const toastType = {
  user: userToastOptions,
  admin: adminToastOptions,
  bottom: bottomToastOptions,
};

export const showToast = {
  success: (message: string, type: ToastType = "user") => {
    toast.success(message, toastType[type]);
  },
  error: (message: string) => {
    toast.error(message, adminToastOptions);
  },
};
