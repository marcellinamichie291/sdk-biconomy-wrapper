import { Event } from "ethers";
import ParseErrorMessage from "../utils/errorParser";
export class SDKContractGenericResponse<T> {
  isSuccess: boolean;
  errorMessage: string;
  eventsEmitted: string[];
  data: T;
  transactionHash: string;

  constructor({
    isSuccess,
    eventsEmitted,
    data,
    event,
    error,
    errorMessage,
    transactionHash
  }: Partial<SDKContractGenericResponse<T> & { error: Error; event: Event }>) {
    this.data = data;
    this.isSuccess = isSuccess || ((!!event || !!transactionHash) && !error);
    if (error || errorMessage) {
      this.errorMessage = errorMessage || ParseErrorMessage(error);
    } else {
      this.transactionHash = event?.transactionHash || transactionHash;
      this.eventsEmitted = eventsEmitted;
    }
  }
}
