// pages/_app.js
import { ChakraProvider, extendTheme, ColorModeScript } from '@chakra-ui/react';

const config = {
  initialColorMode: 'dark', // Set default to dark mode
  useSystemColorMode: false,
};

const theme = extendTheme({ config });

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
