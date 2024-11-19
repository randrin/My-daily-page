import AppPageMeta from "@crema/components/AppPageMeta";
import AuthRoutes from "@crema/components/AuthRoutes";
import AppContextProvider from "@crema/context/AppContextProvider";
import InfoViewContextProvider from "@crema/context/AppContextProvider/InfoViewContextProvider";
import AppLocaleProvider from "@crema/context/AppLocaleProvider";
import AppThemeProvider from "@crema/context/AppThemeProvider";
import AppAuthProvider from "@crema/core/AppAuthProvider";
import { GlobalStyles } from "@crema/core/theme/GlobalStyle";
import "@crema/mockapi";
import { FloatButton } from "antd";
import "antd/dist/reset.css";
import { AppProps } from "next/app";
import PropTypes from "prop-types";
import { Normalize } from "styled-normalize";
import "../../public/styles/index.css";
import "../../public/styles/scss/index.scss";
import 'react-multi-carousel/lib/styles.css';

// Client-side cache, shared for the whole session of the user in the browser.

export default function MyApp(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <AppContextProvider>
      <AppThemeProvider>
        <AppLocaleProvider>
          <InfoViewContextProvider>
            <AppAuthProvider>
              <AuthRoutes>
                <AppPageMeta />
                <GlobalStyles />
                <Normalize />
                <Component {...pageProps} />
                <FloatButton.BackTop />
              </AuthRoutes>
            </AppAuthProvider>
          </InfoViewContextProvider>
        </AppLocaleProvider>
      </AppThemeProvider>
    </AppContextProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};
