# Overview

It a biconomy SDK wrapper library to help with the issues coming from installing with webpack 5 polyfills.

[Biconomy SDK](https://docs.biconomy.io/products/enable-gasless-transactions/sdk-3)

[Biconomy Mexa](https://www.npmjs.com/package/@biconomy/mexa)

## Installation

`npm i @aut-protocol/sdk-biconomy`

or if you prefer using yarn
`yarn @aut-protocol/sdk-biconomy`

## Get started

Example sending EIP712 transaction

```ts
export interface ISDKBiconomyWrapper {
  initializeBiconomy(signerOrProvider: EtherSigner): Promise<void>;

  canSendEIP712Transaction(address: string): boolean;

  sendEIP712Transaction(
    contract: Contract,
    data: string
  ): Promise<SDKContractGenericResponse<BiconomyEvent>>;
}
```

```ts
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const biconomy = new SDKBiconomyWrapper({
      enableDebugMode: true,
      apiKey: process.env.apiKey,
      contractAddresses: [0x...],
});

await biconomy.initializeBiconomy(signer);

const contract = new ethers.Contract(0x, abi, signer);

let { data } = await contract.populateTransaction.method(...args);


const response = await biconomy.sendEIP712Transaction(contract, data);

const {
  isSuccess
  errorMessage,
  data,
  transactionHash,
} = response;
```

## More usage examples

How to use with [AutSDK](https://github.com/Aut-Labs/sdk#using-biconomy-example)
