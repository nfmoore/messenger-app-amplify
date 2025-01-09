import type { PreSignUpTriggerHandler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";

export const handler: PreSignUpTriggerHandler = async (event) => {
  const cognitoClient = new CognitoIdentityProviderClient({});

  const lowercaseUsername =
    event.request.userAttributes["preferred_username"].toLowerCase();

  const params: ListUsersCommandInput = {
    UserPoolId: event.userPoolId,
  };

  const command = new ListUsersCommand(params);
  const response = await cognitoClient.send(command);

  const matchingUser = response.Users?.find((user) => {
    const preferredUsername = user.Attributes?.find(
      (attr) => attr.Name === "preferred_username"
    )?.Value;

    return preferredUsername?.toLowerCase() === lowercaseUsername;
  });

  if (matchingUser) {
    throw new Error("Username already exists");
  }

  if (lowercaseUsername.includes(" ")) {
    throw new Error("Username cannot contain spaces");
  }

  return event;
};
