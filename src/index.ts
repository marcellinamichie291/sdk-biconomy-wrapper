import { Contract, ethers } from "ethers";
import {
  BiconomyConfig,
  BiconomyErrorEvent,
  BiconomyEvent,
  EtherSigner,
  ISDKBiconomyWrapper,
} from "./models/IBiconomyWrapper";
import { SDKContractGenericResponse } from "./utils/response";
import {
  TransactionStore,
  DeferredTransaction,
} from "./utils/transaction.store";
import { Biconomy } from "@biconomy/mexa";

export class SDKBiconomyWrapper implements ISDKBiconomyWrapper {
  private _store: TransactionStore;
  private _biconomy: Biconomy;

  private _defaultSigner: EtherSigner;

  public get defaultSigner(): EtherSigner {
    return this._defaultSigner;
  }

  public set defaultSigner(signer) {
    this._defaultSigner = signer;
  }

  constructor(private config: BiconomyConfig) {
    this._store = new TransactionStore();
  }

  public async initializeBiconomy(signerOrProvider: EtherSigner) {
    this.defaultSigner = signerOrProvider;
    if ((this.defaultSigner as ethers.providers.Web3Provider)._isProvider) {
      this.defaultSigner = (this
        .defaultSigner as ethers.providers.Web3Provider)!.getSigner();
    }
    if (!this.config?.contractAddresses.length) {
      throw Error("NontractAddresses was not provided for biconomy");
    }

    if (!this.config?.apiKey) {
      throw Error("ApiKey was not provided for biconomy");
    }

    try {
      if (this._biconomy) {
        this._biconomy.removeAllListeners();
      }
      // @ts-ignore
      const provider = this._defaultSigner.provider?.provider;
      this._biconomy = new Biconomy(provider, {
        apiKey: this.config.apiKey,
        strictMode: true,
        debug: this.config.enableDebugMode,
        contractAddresses: this.config.contractAddresses,
      });
      await this._biconomy.init();
      this._biconomy.on("txMined", (data: BiconomyEvent) => {
        const response = new SDKContractGenericResponse<BiconomyEvent>({
          isSuccess: true,
          eventsEmitted: [],
          data,
          transactionHash: data?.receipt?.transactionHash,
        });
        this._store.resolve<SDKContractGenericResponse<BiconomyEvent>>(
          data.id,
          response
        );
      });

      this._biconomy.on("onError", (data: Partial<BiconomyErrorEvent>) => {
        const response = new SDKContractGenericResponse<BiconomyErrorEvent>({
          isSuccess: false,
          errorMessage: data?.error,
        });
        this._store.reject<SDKContractGenericResponse<BiconomyErrorEvent>>(
          data.transactionId,
          response
        );
      });
    } catch (error) {
      console.error(error);
    }
  }

  public canSendEIP712Transaction(address: string) {
    if (!this._biconomy || !this._biconomy?.contractAddresses) return;
    return this._biconomy.contractAddresses.some((a) => a === address);
  }

  public async sendEIP712Transaction(
    contract: Contract,
    data: string
  ): Promise<SDKContractGenericResponse<BiconomyEvent>> {
    const address = await (
      this.defaultSigner as ethers.providers.JsonRpcSigner
    ).getAddress();
    const txParams = {
      data: data,
      to: contract.address,
      from: address,
      signatureType: "EIP712_SIGN",
    };

    try {
      const provider = this._biconomy
        .provider as unknown as ethers.providers.Web3Provider;
      const { transactionId } = await provider.send("eth_sendTransaction", [
        txParams,
      ]);
      const deferredPromise = new DeferredTransaction<
        SDKContractGenericResponse<BiconomyEvent>
      >();
      this._store.add<SDKContractGenericResponse<BiconomyEvent>>(
        transactionId,
        deferredPromise
      );
      const result = await deferredPromise.promise;
      return result;
    } catch (error) {
      return new SDKContractGenericResponse<null>({
        isSuccess: false,
        error,
      });
    }
  }
}
