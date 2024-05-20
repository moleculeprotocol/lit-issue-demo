"use client";

import {
  checkAndSignAuthMessage,
  decryptString,
  encryptString,
  LitNodeClient,
  uint8arrayToString,
} from "@lit-protocol/lit-node-client";
import { UnifiedAccessControlConditions,AccsEVMParams } from "@lit-protocol/types";

const chain = "sepolia";

const evmContractConditions: AccsEVMParams[] = [{
    conditionType: "evmContract",
    chain,
    contractAddress: "0xe0D404C22228b03D5b8a715Cb569C4944BC5A27A",
    functionName: "balanceOf",
    functionParams: [":userAddress"],
    functionAbi: {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    returnValueTest: {
      key: "",
      comparator: ">=",
      value: "0",
    },
  }
]

const unifiedAccessControlConditions: UnifiedAccessControlConditions = evmContractConditions;

export async function encrypt(client: LitNodeClient, message: string) {
  const authSig = await checkAndSignAuthMessage({ chain, walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID});
  const { encryptedString, symmetricKey } = await encryptString(message);

  if (!encryptedString) {
    throw new Error("Could not encrypt");
  }

  const encryptedSymmetricKey = await client.saveEncryptionKey({
    //accessControlConditions: unifiedAccessControlConditions,
    unifiedAccessControlConditions: unifiedAccessControlConditions,
    chain,
    authSig,
    symmetricKey,
  });

  return {
    encryptedString,
    encryptedSymmetricKey: uint8arrayToString(encryptedSymmetricKey, "base16"),
  };
}

export async function decrypt(
  client: LitNodeClient,
  encrypted: {
    encryptedString: Blob;
    encryptedSymmetricKey: string;
  }
) {
  const authSig = await checkAndSignAuthMessage({ chain });

  const decryptedSymmetricKey = await client.getEncryptionKey({
    //accessControlConditions: evmContractConditions,
    unifiedAccessControlConditions: unifiedAccessControlConditions,
    chain,
    authSig,
    toDecrypt: encrypted.encryptedSymmetricKey,
  });

  if (!decryptedSymmetricKey) {
    throw new Error("Could not decrypt symmetric key");
  }

  const decryptedString = await decryptString(
    encrypted.encryptedString,
    decryptedSymmetricKey
  );

  if (!decryptedString) {
    throw new Error("Could not decrypt string");
  }

  return {
    decryptedString,
  };
}
