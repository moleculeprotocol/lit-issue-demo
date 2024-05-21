"use client";

import {
  checkAndSignAuthMessage,
  decryptToString,
  encryptString,
  LitNodeClient,
  uint8arrayToString,
} from "@lit-protocol/lit-node-client";
import {
  UnifiedAccessControlConditions,
  AccsEVMParams,
} from "@lit-protocol/types";

const chain = "sepolia";

const evmContractConditions: AccsEVMParams[] = [
  {
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
  },
];

const unifiedAccessControlConditions: UnifiedAccessControlConditions =
  evmContractConditions;

export async function encrypt(
  client: LitNodeClient,
  message: string,
  nonce: string
) {
  const authSig = await checkAndSignAuthMessage({
    chain,
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
    nonce,
  });
  const { ciphertext, dataToEncryptHash } = await encryptString(
    {
      chain,
      authSig,
      unifiedAccessControlConditions: unifiedAccessControlConditions,
      dataToEncrypt: message,
    },
    client
  );

  if (!ciphertext) {
    throw new Error("Could not encrypt");
  }

  return {
    ciphertext,
    dataToEncryptHash,
  };
}

export async function decrypt(
  client: LitNodeClient,
  nonce: string,
  encrypted: {
    ciphertext: string;
    dataToEncryptHash: string;
  }
) {
  const authSig = await checkAndSignAuthMessage({ chain, nonce });

  const decryptedString = await decryptToString(
    {
      chain,
      authSig,
      unifiedAccessControlConditions: unifiedAccessControlConditions,
      ...encrypted
    },
    client
  );

  if (!decryptedString) {
    throw new Error("Could not decrypt string");
  }

  return decryptedString;
}
