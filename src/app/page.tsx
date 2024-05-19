"use client"
import { decrypt, encrypt } from "@/utils";
import { Button, Code, Heading, Input, Text, Textarea, VStack } from "@chakra-ui/react";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { useCallback, useEffect, useState } from "react";

export default function Home() {
  const [client, setClient] = useState<LitNodeClient>();
  const [message, setMessage] = useState("Hello World");
  const [error, setError] = useState("");

  const [encryptionResult, setEncryptionResult] = useState<{
    encryptedString: Blob;
    encryptedSymmetricKey: string;
  }>();

  const [decryptionResult, setDecryptionResult] = useState<{
    decryptedString: string;
  }>();

  useEffect(() => {
    const _client = new LitNodeClient({
      litNetwork: "jalapeno",
      debug: true,
    });
    _client.connect().then(() => {
      setClient(_client);
    });
  }, []);

  const handleEncrypt = useCallback(async () => {
    if (!client) throw new Error("No client");
    try {
      const res = await encrypt(client, message);
      setEncryptionResult(res);
    } catch (error: any) {
      setError(error.message);
    }
  }, [client]);

  const handleDecrypt = useCallback(async () => {
    if (!client) throw new Error("No client");
    try {
      if (!encryptionResult?.encryptedSymmetricKey)
        throw new Error("No encryptedSymmetricKey");

      const res = await decrypt(client, encryptionResult);
      setDecryptionResult(res);
    } catch (error: any) {
      setError(error.message);
    }
  }, [client, encryptionResult]);

  return (
    <VStack>
      <Heading size="lg" mb="3">
        Lit Demo
      </Heading>

      <Heading size="md">Encrypt Message</Heading>
      <Input onChange={(e) => setMessage(e.target.value)} value={message} />
      <Button colorScheme="green" onClick={handleEncrypt} isDisabled={!client}>
        Encrypt String
      </Button>

      {encryptionResult?.encryptedSymmetricKey && (
        <>
          <Text color="green">Message encrypted</Text>
          <Textarea defaultValue={encryptionResult.encryptedSymmetricKey} />
        </>
      )}

      <Heading size="md">Decrypt Message</Heading>
      <Button
        colorScheme="green"
        isDisabled={!encryptionResult?.encryptedSymmetricKey}
        onClick={handleDecrypt}
      >
        Decrypt String
      </Button>
      {decryptionResult && (
        <Text color="green">{decryptionResult.decryptedString}</Text>
      )}

      <Button
        colorScheme="red"
        onClick={() => {
          setEncryptionResult(undefined);
          setDecryptionResult(undefined);
          setError("");
        }}
      >
        Reset
      </Button>

      {error && (
        <>
          <Heading size="md">Error</Heading>
          <Text>Please check the console</Text>
          <Text color="red">{error}</Text>
        </>
      )}
    </VStack>
  );
}
