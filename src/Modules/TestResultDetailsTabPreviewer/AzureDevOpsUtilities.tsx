import * as SDK from "azure-devops-extension-sdk";

import { getClient, IVssRestClientOptions } from "azure-devops-extension-api/Common";
import { TestResultsRestClient } from "azure-devops-extension-api/TestResults";

/**
 * Utilities for the Azure DevOps API/SDK.
 */
export class AzureDevOpsUtilities {

    /**
     * Gets a test result REST client for API interactions.
     */
    public static getTestResultRestClient(): TestResultsRestClient {
        const host = SDK.getHost();

        const domain = document.referrer ? new URL(document.referrer).host : "";
        const isCloud = domain === "dev.azure.com" || domain.endsWith(".visualstudio.com");

        const options = {} as IVssRestClientOptions;

        // for cloud instances the API via `dev.azure.com` does not work as test
        // attachments are only available via `vstmr.dev.azure.com`
        if (isCloud)
            options.rootPath = `https://vstmr.dev.azure.com/${host.name}/`;

        const client = getClient(TestResultsRestClient, options);
        return client;
    }

}
