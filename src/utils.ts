import {
    AccsEVMParams,
    JsonEncryptionRetrieveRequest,
    JsonSaveEncryptionKeyRequest,
} from '@lit-protocol/constants';
import {
    checkAndSignAuthMessage,
    decryptString,
    encryptString,
    LitNodeClient,
    uint8arrayToString,
} from '@lit-protocol/lit-node-client';

const chain = 'goerli';
export const accessControlConditions: AccsEVMParams[] = [
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

export async function encrypt(
    client: LitNodeClient,
    unified: boolean,
    message: string
) {
    if (!client) throw new Error('no client');
    if (!client.ready) {
        await client.connect();
    }
    const authSig = await checkAndSignAuthMessage({ chain });

    const result = await encryptString(message);

    if (!result) {
        throw new Error('Could not encrypt');
    }

    const req: JsonSaveEncryptionKeyRequest = unified
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

    return {
        encryptedString: result.encryptedString,
        encryptedSymmetricKey: uint8arrayToString(
            encryptedSymmetricKey,
            'base16'
        ),
        req,
    };
}

export async function decrypt(
    client: LitNodeClient,
    unified: boolean,
    encryptionResult: { encryptedString: Blob; encryptedSymmetricKey: string }
) {
    if (!client) throw new Error('no client');
    if (!encryptionResult?.encryptedSymmetricKey)
        throw new Error('nothing to decrypt');
    if (!client.ready) {
        await client.connect();
    }

    const authSig = await checkAndSignAuthMessage({ chain });

    const req: JsonEncryptionRetrieveRequest = unified
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

    return {
        decryptedString,
        req,
    };
}
