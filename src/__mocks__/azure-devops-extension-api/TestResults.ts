import { TextEncoder } from "util";

import { IVssRestClientOptions } from "azure-devops-extension-api/Common";

export const mockGetTestResultRestClientOptions = jest.fn(); // REST client options for TestResultsRestClient

export const mockGetTestResultById = jest.fn().mockResolvedValue({}); // test result

export const mockGetTestResultAttachments = jest.fn().mockResolvedValue([]); // test result attachments
export const mockGetTestSubResultAttachments = jest.fn().mockResolvedValue([]); // test result attachments for sub tests with results

export const mockGetTestResultAttachmentContent = jest.fn().mockResolvedValue(new TextEncoder().encode("")); // test result attachment content
export const mockGetTestSubResultAttachmentContent = jest.fn().mockResolvedValue(new TextEncoder().encode("")); // test result attachment content for tests with sub results

/**
 * Mocking the test result REST client.
 */
export class TestResultsRestClient {

   constructor(options: IVssRestClientOptions) {
      mockGetTestResultRestClientOptions.mockReturnValue(options);
   }

   public getTestResultById(project: string, run: any, result: any, details: any) {
      return mockGetTestResultById();
   }

   public getTestResultAttachments(project: string, run: any, result: any) {
      return mockGetTestResultAttachments();
   }

   public getTestSubResultAttachments(project: string, run: any, result: any, sub: any) {
      return mockGetTestSubResultAttachments(project, run, result, sub);
   }

   public getTestResultAttachmentContent(project: string, run: any, result: any, attachment: any) {
      return mockGetTestResultAttachmentContent();
   }

   public getTestSubResultAttachmentContent(project: string, run: any, result: any, attachment: any, sub: any) {
      return mockGetTestSubResultAttachmentContent(project, run, result, attachment, sub);
   }

}
