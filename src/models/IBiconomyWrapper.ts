import { Contract, ethers } from "ethers";
import { SDKContractGenericResponse } from "../utils/response";

export type EtherSigner =
  | ethers.providers.JsonRpcSigner
  | ethers.providers.Web3Provider
  | ethers.Signer;

export interface BiconomyErrorEvent {
  transactionId: string;
  error: string;
}

interface BiconomyReceipt {
  to: string;
  from: string;
  contractAddress: null;
  transactionIndex: number;
  blockNumber: number;
  transactionHash: string;
  logs: {
    transactionIndex: number;
    blockNumber: number;
    transactionHash: string;
    address: string;
    topics: string[];
    data: string;
    logIndex: number;
    blockHash: string;
  }[];
}

export interface BiconomyEvent {
  msg: string;
  id: string;
  hash: string;
  receipt: BiconomyReceipt;
}

export interface BiconomyConfig {
  enableDebugMode?: boolean;
  apiKey: string;
  contractAddresses: string[];
}

export interface ISDKBiconomyWrapper {
  initializeBiconomy(signerOrProvider: EtherSigner): Promise<void>;

  canSendEIP712Transaction(address: string): boolean;

  sendEIP712Transaction(
    contract: Contract,
    data: string
  ): Promise<SDKContractGenericResponse<BiconomyEvent>>;
}
