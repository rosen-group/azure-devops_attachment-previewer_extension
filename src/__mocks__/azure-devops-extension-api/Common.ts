import { IVssRestClientOptions } from "azure-devops-extension-api/Common";

import { TestResultsRestClient } from "./TestResults";

/**
 * Mocking getClient returns different mocked client depending on the request.
 */
export function getClient(client: any, options: IVssRestClientOptions) {
     if (typeof client === typeof TestResultsRestClient)
        return new TestResultsRestClient(options);
}
