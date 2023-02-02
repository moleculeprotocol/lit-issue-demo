import { LitNodeClient } from '@lit-protocol/lit-node-client';
import * as LitJsSdk from '@lit-protocol/sdk-browser';
import { useState } from 'react';
import {
    RadioGroup,
    Radio,
    Stack,
    Heading,
    Divider,
    Button,
    Text,
    VStack,
    Input,
} from '@chakra-ui/react';
import { decrypt, encrypt } from '@/utils';
import {
    JsonEncryptionRetrieveRequest,
    JsonSaveEncryptionKeyRequest,
} from '@lit-protocol/constants';

export default function Home() {
    const [accMode, setAccMode] = useState('unified');
    const [message, setMessage] = useState('Hello World');
    const [encryptionResult, setEncryptionResult] = useState<{
        encryptedString: Blob;
        encryptedSymmetricKey: string;
        req: JsonSaveEncryptionKeyRequest;
    }>();

    const [decryptionResult, setDecryptionResult] = useState<{
        decryptedString: string;
        req: JsonEncryptionRetrieveRequest;
    }>();
    const [error, setError] = useState('');

    const tsClient = new LitNodeClient({});
    const jsClient = new LitJsSdk.LitNodeClient({});

    const [client, setClient] = useState('js');

    async function handleEncrypt() {
        try {
            const c = client === 'js' ? jsClient : tsClient;
            const u = accMode === 'unified' ? true : false;
            const res = await encrypt(c, u, message);
            setEncryptionResult(res);
        } catch (error: any) {
            setError(error.message);
        }
    }

    async function handleDecrypt() {
        try {
            if (!encryptionResult?.encryptedSymmetricKey)
                throw new Error('No encryptedSymmetricKey');

            const c = client === 'js' ? jsClient : tsClient;
            const u = accMode === 'unified' ? true : false;
            const res = await decrypt(c, u, encryptionResult);
            setDecryptionResult(res);
        } catch (error: any) {
            setError(error.message);
        }
    }

    return (
        <VStack>
            <Heading size="lg" mb="3">
                Demo Lit issue
            </Heading>

            <Heading size="md">Select Lit SDK</Heading>
            <RadioGroup onChange={setClient} value={client}>
                <Stack direction="column">
                    <Radio value="js">JS Client v1.1.242</Radio>
                    <Radio value="ts">TS Client 2.1.16</Radio>
                </Stack>
            </RadioGroup>
            <Divider my="4" />

            <Heading size="md">Select AccessControlConditions</Heading>
            <RadioGroup onChange={setAccMode} value={accMode}>
                <Stack direction="column">
                    <Radio value="unified">
                        UnifiedAccessControlConditions
                    </Radio>
                    <Radio value="evm">EvmContractConditions</Radio>
                </Stack>
            </RadioGroup>
            <Divider my="4" />

            <Heading size="md">Encrypt Message</Heading>
            {encryptionResult?.encryptedSymmetricKey ? (
                <Text color="green">Message encrypted sucessfully</Text>
            ) : (
                <>
                    <Input
                        onChange={(e) => setMessage(e.target.value)}
                        value={message}
                    />
                    <Button colorScheme="green" onClick={handleEncrypt}>
                        Encrypt String
                    </Button>
                </>
            )}
            <Divider my="4" />

            <Heading size="md">Decrypt Message</Heading>
            {decryptionResult ? (
                <Text color="green">{decryptionResult.decryptedString}</Text>
            ) : (
                <Button
                    colorScheme="green"
                    disabled={!encryptionResult?.encryptedSymmetricKey}
                    onClick={handleDecrypt}
                >
                    Decrypt String
                </Button>
            )}
            <Divider my="4" />

            <Button
                colorScheme="red"
                onClick={() => {
                    setEncryptionResult(undefined);
                    setDecryptionResult(undefined);
                    setError('');
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
