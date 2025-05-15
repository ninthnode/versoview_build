"use client";

import "@/styles/global.css";
import "@/styles/fonts.css";
import { ChakraProvider } from "@chakra-ui/react";
import customTheme from "@/styles/theme";
import { Provider } from "react-redux";

import store from "@/redux/store";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Versoview</title>
        <link rel="icon" href="/assets/fav.png" />
        <link rel="apple-touch-icon" href="/assets/fav.png" />
      </head>
      <body>
        <ChakraProvider theme={customTheme}>
          <Provider store={store}>
            <ToastContainer />
            {children}
          </Provider>
        </ChakraProvider>
      </body>
    </html>
  );
}
