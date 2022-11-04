# Overview 

The TS/JS SDK package aims to make it easy for frontends/backends to integrate with Aut Smart Contracts. 
The SDK abstracts the smart contract calls and brings the web2 development experience when using the Aut Protocol contracts. 
The SDK consist of two main classes - DAOExpander and AutID. The integrator passes the signer/provider to the SDK so that it can be used with any wallet/provider. 

# Installation 

`npm i @aut-protocol/sdk`

or if you prefer using yarn
`yarn @aut-protocol/sdk`

# Instantiate 
Example using ethers wallet from mnemonic
```
 // create ethers wallet from mnemonic
const senderWalletMnemonic = ethers.Wallet.fromMnemonic(
  process.env.MNEMONIC,
  "m/44'/60'/0'/0/0"
);
  
  // pass provider to the constructor if only making queries
const provider = new   ethers.providers.JsonRpcProvider(process.env.MUMBAI_RPC_PROVIDER);
  
// pass signer if making transactions
const signer = senderWalletMnemonic.connect(provider);

const autID = new AutID(
  process.env.AUT_ID_ADDRESS,
  provider // or signer
);  
const profile = await autID.getAutID({ tokenId: '0' });

``` 

Example using Metamask 
```
// pass provider to the constructor if only making queries
const provider = new ethers.providers.Web3Provider(window.ethereum);
      
// pass signer if making transactions
const signer = provider.getSigner();

const autID = new AutID(
  process.env.AUT_ID_ADDRESS,
  provider // or signer
);

const holderAutID = await autID.getAutID({ tokenId: "0" }); 
```

For more information please visit: https://docs.aut.id/v2/js-sdk/overview