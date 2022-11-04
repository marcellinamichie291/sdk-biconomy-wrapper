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
  private _biconomyInitialized: Promise<unknown>;
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
      // @ts-ignore
      const provider = this._defaultSigner.provider?.provider;
      this._biconomy = new Biconomy(provider, {
        apiKey: this.config.apiKey,
        strictMode: true,
        debug: true,
        contractAddresses: this.config.contractAddresses,
      });
    } catch (error) {}

    this._biconomyInitialized = this._biconomy.init();

    this._biconomy.on("txMined", (data: BiconomyEvent) => {
      const response = new SDKContractGenericResponse<string>({
        isSuccess: true,
        eventsEmitted: [],
        data: this._getEventData(data),
        transactionHash: data?.receipt?.transactionHash,
      });
      this._store.resolve<SDKContractGenericResponse<string>>(
        data.id,
        response
      );
    });

    this._biconomy.on("onError", (data: Partial<BiconomyErrorEvent>) => {
      const response = new SDKContractGenericResponse<null>({
        isSuccess: false,
        errorMessage: data?.error,
      });
      this._store.reject<SDKContractGenericResponse<null>>(
        data.transactionId,
        response
      );
    });
  }

  public canSendEIP712Transaction(address: string) {
    if (!this._biconomy || !this._biconomy?.contractAddresses) return;
    return this._biconomy.contractAddresses.some((a) => a === address);
  }

  public async sendEIP712Transaction(
    contract: Contract,
    data: string
  ): Promise<SDKContractGenericResponse<string>> {
    await this._switchToBiconomyProvider(contract);
    const address = await (
      this.defaultSigner as ethers.providers.JsonRpcSigner
    ).getAddress();

    console.log("selectedAddress: ", address);
    const txParams = {
      data: data,
      to: contract.address,
      from: address,
      signatureType: "EIP712_SIGN",
    };

    try {
      const { transactionId } = await (
        this._biconomy.provider as unknown as ethers.providers.Web3Provider
      ).send("eth_sendTransaction", [txParams]);
      const deferredPromise = new DeferredTransaction<
        SDKContractGenericResponse<string>
      >();
      this._store.add<SDKContractGenericResponse<string>>(
        transactionId,
        deferredPromise
      );
      const result = await deferredPromise.promise;
      await this._switchToDefaultProvider(contract);
      console.log(result, deferredPromise, this, "transactionId");
      return result;
    } catch (error) {
      await this._switchToDefaultProvider(contract);
      return new SDKContractGenericResponse<null>({
        isSuccess: false,
        error,
      });
    }
  }

  /*
    in order to use biconomy we need to switch to biconomy singer
  */
  private async _switchToBiconomyProvider(contract: Contract) {
    await this._biconomyInitialized;
    contract = contract.connect(this._biconomy.ethersProvider.getSigner());
  }

  /*
    after we are done with biconomy transaction 
    change contract signer to the default
  */
  private async _switchToDefaultProvider(contract: Contract) {
    contract = contract.connect(this.defaultSigner);
  }

  private _getEventData(event: BiconomyEvent): string {
    const log = event?.receipt?.logs?.find((l) =>
      l.data.includes("000000000000000000000000")
    );
    return log?.data?.replace("000000000000000000000000", "");
  }
}
