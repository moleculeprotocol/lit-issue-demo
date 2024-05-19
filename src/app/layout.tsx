import { Container } from "@chakra-ui/react";
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Container mt={24}>
          <Providers>{children}</Providers>
        </Container>
      </body>
    </html>
  );
}
