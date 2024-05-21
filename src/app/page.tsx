"use client"
import { decrypt, encrypt } from "@/utils";
import { Button, HStack, Heading, Input, Text, Textarea, VStack } from "@chakra-ui/react";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { useCallback, useEffect, useState } from "react";
import { Radio, RadioGroup } from '@chakra-ui/react'
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";

export default function Home() {
  const [litNetwork, setLitNetwork] = useState<LitNetwork.Cayenne | LitNetwork.Habanero | LitNetwork.Manzano>(LitNetwork.Cayenne);
  const [client, setClient] = useState<LitNodeClient>();
  const [message, setMessage] = useState("Hello World");
  const [nonce, setNonce] = useState(new Date().toISOString());
  const [error, setError] = useState("");

  const [encryptionResult, setEncryptionResult] = useState<{ ciphertext: string, dataToEncryptHash: string }>();
  const [decryptionResult, setDecryptionResult] = useState<string>();

  useEffect(() => {
    (async() => {
      setClient(undefined)
      const _client = new LitNodeClient({
        litNetwork,
        debug: true,
      });
      //https://developer.litprotocol.com/v3/sdk/installation#sdk-installed-for-client-side-usage
      await _client.disconnect();
      await _client.connect()
      setClient(_client);
      const nonce = await _client.getLatestBlockhash();
        setNonce(nonce)
    })();
  }, [litNetwork]);

  const handleEncrypt = useCallback(async () => {
    if (!client) throw new Error("No client");
    try {
      const res = await encrypt(client, message, nonce);
      setEncryptionResult(res);
    } catch (error: any) {
      setError(error.message);
    }
  }, [client, message, nonce]);

  const handleDecrypt = useCallback(async () => {
    if (!client) throw new Error("No client");
    try {
      if (!encryptionResult?.ciphertext)
        throw new Error("No encrypted data");

      const decryptedString = await decrypt(client, nonce, encryptionResult);
      setDecryptionResult(decryptedString);
    } catch (error: any) {
      setError(error.message);
    }
  }, [client, encryptionResult, nonce]);

  return (
    <VStack>
      <Heading size="lg" mb="3">
        Lit Demo
      </Heading>

      <Heading size="md">Encrypt Message</Heading>
      <RadioGroup onChange={(v) => setLitNetwork(v as typeof litNetwork)} value={litNetwork}>
      <HStack >
        <Radio value='cayenne'>Cayenne</Radio>
        <Radio value='manzano'>Manzano</Radio>
        <Radio value='habanero'>Habenero</Radio>
      </HStack>
    </RadioGroup>

      <Input onChange={(e) => setMessage(e.target.value)} value={message} />
      <Button colorScheme="green" onClick={handleEncrypt} isDisabled={!client}>
        Encrypt String
      </Button>

      {encryptionResult?.ciphertext && (
        <>
          <Text color="green">Message encrypted</Text>
          <Input isDisabled value={encryptionResult.dataToEncryptHash} />
          <Textarea defaultValue={encryptionResult.ciphertext} />
        </>
      )}

      <Heading size="md">Decrypt Message</Heading>
      <Button
        colorScheme="green"
        isDisabled={!encryptionResult?.ciphertext}
        onClick={handleDecrypt}
      >
        Decrypt String
      </Button>
      {decryptionResult && (
        <Text color="green">{decryptionResult}</Text>
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
