"use client";

import "@/styles/global.css";
import { ChakraProvider } from "@chakra-ui/react";
import customTheme from "@/styles/theme";
import { Provider } from "react-redux";
import PrivateRoute from "./utils/PrivateRoute";

import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path";

setBasePath(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.15.1/cdn/"
);

import store from "@/redux/store";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Versoview</title>
      </head>
      <body>
        <ChakraProvider theme={customTheme}>
          <Provider store={store}>
            <ToastContainer />
            <PrivateRoute>{children}</PrivateRoute>
          </Provider>
        </ChakraProvider>
      </body>
    </html>
  );
}
