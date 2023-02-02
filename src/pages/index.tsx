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
    AccsEVMParams,
    JsonEncryptionRetrieveRequest,
    JsonSaveEncryptionKeyRequest,
} from '@lit-protocol/constants';

export default function Home() {
    const [unified, setUnified] = useState('unified');
    const [message, setMessage] = useState('Hello World');
    const [encryptionResult, setEncryptionResult] = useState<{
        encryptedString: Blob;
        encryptedSymmetricKey: string;
        req: JsonSaveEncryptionKeyRequest;
    }>();
    const chain = 'goerli';

    const accessControlConditions: AccsEVMParams[] = [
        {
            conditionType: 'evmContract',
            chain: 'goerli',
            contractAddress: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
            functionName: 'balanceOf',
            functionParams: [':userAddress'],
            functionAbi: {
                inputs: [{ name: '', type: 'address' }],
                name: 'balanceOf',
                outputs: [{ name: '', type: 'uint256' }],
                payable: false,
                stateMutability: 'view',
                type: 'function',
            },
            returnValueTest: {
                key: '',
                comparator: '>=',
                value: '0',
            },
        },
    ];

    const [decryptionResult, setDecryptionResult] = useState<{
        decryptedString: string;
        req: JsonEncryptionRetrieveRequest;
    }>();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const tsClient = new LitNodeClient({});
    const jsClient = new LitJsSdk.LitNodeClient({});

    const [client, setClient] = useState('js');

    async function handleEncrypt() {
        try {
            const c = client === 'js' ? jsClient : tsClient;
            const u = unified === 'unified' ? true : false;
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
            const u = unified === 'unified' ? true : false;
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
            <RadioGroup onChange={setUnified} value={unified}>
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
                    <Text color="red">{error}</Text>
                </>
            )}
        </VStack>
    );
}
