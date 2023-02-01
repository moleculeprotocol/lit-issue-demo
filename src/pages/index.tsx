import {
    AccsEVMParams,
    EvmContractConditions,
    JsonEncryptionRetrieveRequest,
    JsonSaveEncryptionKeyRequest,
    UnifiedAccessControlConditions,
} from '@lit-protocol/constants';
import {
    checkAndSignAuthMessage,
    decryptString,
    encryptString,
    uint8arrayToString,
    LitNodeClient,
} from '@lit-protocol/lit-node-client';
import * as LitJsSdk from '@lit-protocol/sdk-browser';
import { useState } from 'react';

export default function Home() {
    const [toggleUnified, setToggleUnified] = useState(false);
    const [encryptionResult, setEncryptionResult] = useState<{
        encryptedString: Blob;
        encryptedSymmetricKey: any;
    }>();
    const [decryptionResult, setDecryptionResult] = useState('');

    const tsClient = new LitNodeClient({});
    const jsClient = new LitJsSdk.LitNodeClient({});

    const [client, setClient] = useState<LitNodeClient>(jsClient);
    const [clientToggle, setClientToggle] = useState<string>('jsClient');

    const testString = 'Hello World';
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

    async function encrypt() {
        if (!client) throw new Error('no client');
        if (!client.ready) {
            await client.connect();
        }
        const authSig = await checkAndSignAuthMessage({ chain });

        const result = await encryptString(testString);

        if (!result) {
            throw new Error('Could not encrypt');
        }

        const req: JsonSaveEncryptionKeyRequest = toggleUnified
            ? {
                  unifiedAccessControlConditions: accessControlConditions,
                  symmetricKey: result?.symmetricKey,
                  authSig,
                  chain,
              }
            : {
                  evmContractConditions: accessControlConditions,
                  symmetricKey: result?.symmetricKey,
                  authSig,
                  chain,
              };

        console.log('JsonSaveEncryptionKeyRequest', req);
        const encryptedSymmetricKey = await client.saveEncryptionKey(req);

        setEncryptionResult(() => {
            return {
                encryptedString: result.encryptedString,
                encryptedSymmetricKey: uint8arrayToString(
                    encryptedSymmetricKey,
                    'base16'
                ),
            };
        });
    }

    async function decrypt() {
        if (!client) throw new Error('no client');
        if (!encryptionResult?.encryptedSymmetricKey)
            throw new Error('nothing to decrypt');
        if (!client.ready) {
            await client.connect();
        }

        const authSig = await checkAndSignAuthMessage({ chain });

        const req: JsonEncryptionRetrieveRequest = toggleUnified
            ? {
                  unifiedAccessControlConditions: accessControlConditions,
                  toDecrypt: encryptionResult.encryptedSymmetricKey,
                  authSig,
                  chain,
              }
            : {
                  evmContractConditions: accessControlConditions,
                  toDecrypt: encryptionResult.encryptedSymmetricKey,
                  authSig,
                  chain,
              };

        console.log('JsonEncryptionRetrieveRequest', req);
        const decryptedSymmetricKey = await client.getEncryptionKey(req);

        if (!decryptedSymmetricKey) {
            throw new Error('Could not decrypt symmetric key');
        }

        const decryptedString = await decryptString(
            encryptionResult.encryptedString,
            decryptedSymmetricKey
        );

        if (!decryptedString) {
            throw new Error('Could not decrypt string');
        }

        setDecryptionResult(decryptedString);
    }
    return (
        <>
            <div>
                <button
                    style={{
                        backgroundColor:
                            clientToggle === 'jsClient' ? 'green' : 'orange',
                        width: '10rem',
                        height: '5rem',
                    }}
                    onClick={() => {
                        setClient(jsClient);
                        setClientToggle('jsClient');
                    }}
                >
                    Use Js Client
                </button>
                <button
                    style={{
                        backgroundColor:
                            clientToggle === 'tsClient' ? 'green' : 'orange',
                        width: '10rem',
                        height: '5rem',
                    }}
                    onClick={() => {
                        setClient(tsClient);
                        setClientToggle('tsClient');
                    }}
                >
                    Use Ts Client
                </button>
            </div>
            <div></div>
            <div>
                <div
                    style={{
                        display: 'flex',
                    }}
                >
                    <h3 style={{ marginRight: '1rem' }}>
                        {toggleUnified
                            ? 'unifiedAccessControlConditions'
                            : 'evmContractConditions'}
                    </h3>
                    <button
                        onClick={() => setToggleUnified((old) => !old)}
                        style={{
                            backgroundColor: toggleUnified ? 'blue' : 'purple',
                        }}
                    >
                        Switch
                    </button>
                </div>
                <p>Teststring: {testString}</p>

                <div
                    style={{
                        display: 'flex',
                    }}
                >
                    <button
                        style={{
                            backgroundColor: encryptionResult ? 'red' : 'green',
                            width: '10rem',
                            height: '3rem',
                            marginRight: '2rem',
                        }}
                        onClick={encrypt}
                    >
                        Encrypt
                    </button>
                    <button
                        style={{
                            backgroundColor: decryptionResult ? 'red' : 'green',
                            width: '10rem',
                            height: '3rem',
                            marginRight: '2rem',
                        }}
                        onClick={decrypt}
                    >
                        Decrypt
                    </button>
                    <button
                        style={{
                            backgroundColor: 'blue',
                            width: '10rem',
                            height: '3rem',
                        }}
                        onClick={() => {
                            setEncryptionResult(undefined);
                            setDecryptionResult('');
                        }}
                    >
                        Reset
                    </button>
                </div>
                <p>
                    EncryptedSymmetricKey:
                    {encryptionResult?.encryptedSymmetricKey}
                </p>
                <p>DecryptedString: {decryptionResult}</p>
            </div>
        </>
    );
}
