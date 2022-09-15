import { TextEncoder } from "util";

import { IVssRestClientOptions } from "azure-devops-extension-api/Common";

export const mockGetTestResultRestClientOptions = jest.fn(); // REST client options for TestResultsRestClient
export const mockGetTestResultAttachments = jest.fn().mockResolvedValue([]); // test result attachments
export const mockGetTestResultAttachmentContent = jest.fn().mockResolvedValue(new TextEncoder().encode("")); // test result attachment content

/**
 * Mocking the test result REST client.
 */
export class TestResultsRestClient {

   constructor(options: IVssRestClientOptions) {
      mockGetTestResultRestClientOptions.mockReturnValue(options);
   }

   public getTestResultAttachments(project: string, run: any, result: any) {
      return mockGetTestResultAttachments();
   }

   public getTestResultAttachmentContent(project: string, run: any, result: any, attachment: any) {
      return mockGetTestResultAttachmentContent();
   }

}
