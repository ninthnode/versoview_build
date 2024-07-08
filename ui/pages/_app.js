import { SessionProvider } from "next-auth/react"
import { useState, useEffect } from "react";
import '../styles/global.css'; // Import your global CSS file
import Head from 'next/head';
import { Fragment } from 'react';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return (
    <Fragment>
    <SessionProvider session={session}>
      <Head>
        <link rel="icon" href="/images/brownlogo.svg" />
        <title>Versoview</title>
        <meta name="description" content="Description of your website" />
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
    </Fragment>
  )
}







