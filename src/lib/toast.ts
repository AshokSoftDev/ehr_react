import { toast as toastify, type ToastOptions } from "react-toastify";

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    toastify.success(message, { ...defaultOptions, ...options });
  },
  error: (message: string, options?: ToastOptions) => {
    toastify.error(message, { ...defaultOptions, ...options });
  },
  info: (message: string, options?: ToastOptions) => {
    toastify.info(message, { ...defaultOptions, ...options });
  },
  warning: (message: string, options?: ToastOptions) => {
    toastify.warning(message, { ...defaultOptions, ...options });
  },
  loading: (message: string, options?: ToastOptions) => {
    return toastify.loading(message, { ...defaultOptions, ...options });
  },
  update: (id: string | number, options: ToastOptions) => {
    toastify.update(id, { ...defaultOptions, ...options });
  },
  dismiss: (id?: string | number) => {
    toastify.dismiss(id);
  },
  // promise: <T = unknown>(
  //   promise: Promise<T>,
  //   {
  //     pending,
  //     success,
  //     error,
  //   }: {
  //     pending: string;
  //     success: string | ((data: T) => string);
  //     error: string | ((err: unknown) => string);
  //   },
  //   options?: ToastOptions
  // ) => {
  //   return toastify.promise(
  //     promise,
  //     { pending, success, error },
  //     { ...defaultOptions, ...options }
  //   );
  // },
};
