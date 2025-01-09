import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import {
  AuthorizationType,
  CfnApi,
  CfnChannelNamespace,
} from "aws-cdk-lib/aws-appsync";

const backend = defineBackend({
  auth,
  data,
});

const customResource = backend.createStack("custom-event-resource");

const cfnEventAPI = new CfnApi(customResource, "EventApi", {
  name: "EventApi",
  eventConfig: {
    authProviders: [
      {
        authType: AuthorizationType.USER_POOL,
        cognitoConfig: {
          userPoolId: backend.auth.resources.userPool.userPoolId,
          awsRegion: customResource.region,
        },
      },
    ],

    connectionAuthModes: [
      {
        authType: AuthorizationType.USER_POOL,
      },
    ],
    defaultPublishAuthModes: [{ authType: AuthorizationType.USER_POOL }],
    defaultSubscribeAuthModes: [{ authType: AuthorizationType.USER_POOL }],
  },
});

new CfnChannelNamespace(customResource, "cfnEventAPINamespace", {
  apiId: cfnEventAPI.attrApiId,
  name: "chat",
});

backend.addOutput({
  custom: {
    events: {
      url: `https://${cfnEventAPI.getAtt("Dns.Http").toString()}/event`,
      aws_region: customResource.region,
      default_authorization_type: AuthorizationType.USER_POOL,
    },
  },
});
