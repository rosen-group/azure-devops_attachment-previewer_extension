import { AzureDevOpsUtilities } from "../../Modules/TestResultDetailsTabPreviewer/AzureDevOpsUtilities";

import { mockGetHostName } from "../../__mocks__/azure-devops-extension-sdk";
import { mockGetTestResultRestClientOptions } from "../../__mocks__/azure-devops-extension-api/TestResults";

// related mocks for Azure DevOps are loaded automatically (implementations /src/__mocks__)

describe("AzureDevOpsUtilities", () => {

    test("should get on-premises client", async () => {
        // Arrange
        mockGetHostName.mockReturnValue("rosen");

        // Act
        const client = AzureDevOpsUtilities.getTestResultRestClient();
        const options = mockGetTestResultRestClientOptions();

        // Assert
        expect(client).toBeDefined();
        expect(options.rootPath).toBeUndefined(); // should not be overwritten on-premise
    });

    test("should get Azure cloud client", async () => {
        // Arrange
        mockGetHostName.mockReturnValue("rosen");

        // `document.referrer` is a read-only property, it needs to be
        // overwritten
        Object.defineProperty(global.document, "referrer", { value: "https://dev.azure.com/", configurable: true });

        // Act
        const client = AzureDevOpsUtilities.getTestResultRestClient();
        const options = mockGetTestResultRestClientOptions();

        // Assert
        expect(client).toBeDefined();
        expect(options.rootPath).toEqual("https://vstmr.dev.azure.com/rosen/"); // should be overwritten for cloud
    });

    test("should get Visual Studio cloud client", async () => {
        // Arrange
        mockGetHostName.mockReturnValue("rosen");

        // `document.referrer` is a read-only property, it needs to be
        // overwritten
        Object.defineProperty(global.document, "referrer", { value: "https://rosen.visualstudio.com/", configurable: true });

        // Act
        const client = AzureDevOpsUtilities.getTestResultRestClient();
        const options = mockGetTestResultRestClientOptions();

        // Assert
        expect(client).toBeDefined();
        expect(options.rootPath).toEqual("https://vstmr.dev.azure.com/rosen/"); // should be overwritten for cloud
    });

});
