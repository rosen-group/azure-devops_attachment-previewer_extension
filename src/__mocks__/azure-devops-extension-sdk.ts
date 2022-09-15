import { CommonServiceIds } from "azure-devops-extension-api/Common";

/**
 * Mocked init function to return resolve.
 */
export function init() {
    return new Promise((resolve, _) => resolve());
}

/**
 * Mocked configuration of the initial handshake.
 */
export function getConfiguration() {
    const configuration = {
        runId: mockGetRunID(),
        resultId: mockGetResultID(),
        subResultId: mockGetSubResultID(),
    };

    return configuration;
}

/**
 * Mocked information about the current host.
 */
export function getHost() {
    const information = {
        name: mockGetHostName(),
    };

    return information;
}

/**
 * Mocking SDK.getService() depending on which service is requested
 * it will return mocks for these services
 * here IdentityService or WorkItemFormService
 */
export function getService(id: string) {
    if (id === CommonServiceIds.ProjectPageService)
        return new Promise((resolve) => resolve({
            getProject: mockGetProject,
        }));
}

export const mockGetHostName = jest.fn(); // host name information
export const mockGetProject = jest.fn(); // project data as IProjectInfo or null
export const mockGetResultID = jest.fn(); // test result ID
export const mockGetRunID = jest.fn(); // test run ID
export const mockGetSubResultID = jest.fn(); // test sub result ID
