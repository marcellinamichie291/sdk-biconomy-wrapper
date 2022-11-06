export const METAMASK_POSSIBLE_ERRORS: any = {
  "-32700": {
    standard: "JSON RPC 2.0",
    message:
      "Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text."
  },
  "-32600": {
    standard: "JSON RPC 2.0",
    message: "The JSON sent is not a valid Request object."
  },
  "-32601": {
    standard: "JSON RPC 2.0",
    message: "The method does not exist / is not available."
  },
  "-32602": {
    standard: "JSON RPC 2.0",
    message: "Invalid method parameter(s)."
  },
  "-32000": {
    standard: "EIP-1474",
    message: "Invalid input."
  },
  "-32001": {
    standard: "EIP-1474",
    message: "Resource not found."
  },
  "-32002": {
    standard: "EIP-1474",
    message: "Resource unavailable."
  },
  "-32003": {
    standard: "EIP-1474",
    message: "Transaction rejected."
  },
  "-32004": {
    standard: "EIP-1474",
    message: "Method not supported."
  },
  "-32005": {
    standard: "EIP-1474",
    message: "Request limit exceeded."
  },
  "4001": {
    standard: "EIP-1193",
    message: "User rejected the request."
  },
  ACTION_REJECTED: {
    message: "User rejected the request."
  },
  "4100": {
    standard: "EIP-1193",
    message:
      "The requested account and/or method has not been authorized by the user."
  },
  "4200": {
    standard: "EIP-1193",
    message: "The requested method is not supported by this Ethereum provider."
  },
  "4900": {
    standard: "EIP-1193",
    message: "The provider is disconnected from all chains."
  },
  "4901": {
    standard: "EIP-1193",
    message: "The provider is disconnected from the specified chain."
  }
};

const isJson = (str: string) => {
  try {
    return !!JSON.parse(str);
  } catch (e) {
    return false;
  }
};

export enum InternalErrorTypes {
  // AutID
  AutIDAlreadyExistsForAddress = "AutID: There is AutID already registered for this address.",
  UsernameLengthInvalid = "Username must be max 16 characters",
  UsernameIsTaken = "AutID: Username already taken!",
  NoAutIDForTheAddress = "AutID: There is no AutID registered for this address.",
  InvalidRole = "Role must be between 1 and 3",
  AutIDAlreadyInThisCommunity = "AutID: Already a member",
  UsernameAlreadyTaken = "This username is already taken.",
  UserHasUnjoinedCommunities = "User has unjoined DAOs.",
  GatewayTimedOut = "IPFS: Gateway timed out.",
  UserNotAMemberOfThisDaoMint = "AutID: Not a member!",
  UserNotAMemberOfThisDaoJoin = "not a member of this DAO.",
  UserNotAnAdmin = "Not an admin!",
  NotAMemberOfTheDAO = "AutID: Not a member of this DAO!",
  CommitmentError = "AutID: Commitment should be between 1 and 10",
  CommitmentTooLow = "Commitment lower than the DAOs min commitment",
  MissingDAOExpander = "AutID: Missing DAO Expander",
  // DAO Expander
  IncorrectDAOType = "DAO Type incorrect",
  MissingDAOAddress = "Missing DAO Address",
  InvalidMarket = "Market invalid",
  MissingMetadataURL = "Missing Metadata URL",
  CommitmentInvalid = "Invalid commitment"
}

export default function ParseErrorMessage(error: any) {
  if (!error) {
    return error;
  }

  if (isJson(error)) {
    error = JSON.parse(error);
  }

  const errMessage = Object.values(InternalErrorTypes).find((e) =>
    error?.message?.includes(e)
  );

  if (errMessage) {
    return errMessage;
  }

  const metamaskError = METAMASK_POSSIBLE_ERRORS[error?.code];

  if (metamaskError) {
    return metamaskError.message;
  }

  if (error?.reason) {
    return error.reason?.toString();
  }

  if (error?.message) {
    return error.message?.toString();
  }

  if (error?.data?.message) {
    return error?.data?.message?.toString();
  }

  return "Internal JSON-RPC error.";
}
