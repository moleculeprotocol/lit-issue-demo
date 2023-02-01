This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Install dependencies:

```bash
yarn install
```

Run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

#### Demo purpose

This is a simple demonstration of an issue with litprotocol v2.1.16.
When using `unifiedAccessControlConditions` with the new typescript v2 sdk, an error is returned `The access control conditions you passed in do not match the ones that were set by the condition creator for this encryptedSymmetricKey.`

This was working in the JS-SDK and is working if only using evmContractConditions.
We suspect that it's related to the optional field `conditionType` as it's not getting logged in the "formattedEVMContractConditions".
