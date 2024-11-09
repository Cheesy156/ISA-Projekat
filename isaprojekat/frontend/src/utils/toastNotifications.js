import { toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const showErrorToast = (message) => {
    toast.error(message, {
        position: "top-center",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
    });
};

export { showErrorToast };