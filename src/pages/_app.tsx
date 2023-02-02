import type { AppProps } from 'next/app';
import { ChakraProvider, Container } from '@chakra-ui/react';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <ChakraProvider>
            <Container marginTop="24">
                <Component {...pageProps} />
            </Container>
        </ChakraProvider>
    );
}
