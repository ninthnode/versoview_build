"use client";

import { ChakraProvider } from "@chakra-ui/react";
import customTheme from "@/styles/theme";
import { Provider } from "react-redux";
import store from "@/redux/store";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children }) {
  return (
    <ChakraProvider theme={customTheme}>
      <Provider store={store}>
        <ToastContainer />
        {children}
      </Provider>
    </ChakraProvider>
  );
}