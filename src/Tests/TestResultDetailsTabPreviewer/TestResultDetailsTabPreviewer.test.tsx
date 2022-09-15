import { TextEncoder } from "util";

import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import React from "react";

import TestResultDetailsTabPreviewerComponent from "../../Modules/TestResultDetailsTabPreviewer/TestResultDetailsTabPreviewer";

import { mockGetProject, mockGetSubResultID } from "../../__mocks__/azure-devops-extension-sdk";
import { mockGetTestResultAttachments, mockGetTestResultAttachmentContent } from "../../__mocks__/azure-devops-extension-api/TestResults";

// related mocks for Azure DevOps are loaded automatically (implementations /src/__mocks__)

// loading module related mocks
jest.mock("../../Common");

describe("TestResultDetailsTabPreviewerComponent", () => {

    // warnings are ignored, these might come from the component itself
    const warn = console.warn.bind(console.warn);
    beforeAll(() => {
        console.warn = () => {};
    });
    afterAll(() => {
        console.warn = warn;
    });

    test("should show loading", async () => {
        // Arrange
        mockGetProject.mockResolvedValue(null);

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        // Assert
        expect(screen.getByTestId("loading")).toBeDefined();
    });

    test("should show no available attachments", async () => {
        // Arrange
        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetSubResultID.mockReturnValue(-1);
        mockGetTestResultAttachments.mockResolvedValue([]);

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getByText(/no attachments/i)).toBeDefined();
    });

    test("should show no selected attachment", async () => {
        // Arrange
        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetSubResultID.mockReturnValue(-1);
        mockGetTestResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename",
            }
        ]);

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getByText(/no attachment selected/i)).toBeDefined();
    });

    test("should show listed attachment with no comment", async () => {
        // Arrange
        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetSubResultID.mockReturnValue(-1);
        mockGetTestResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1",
            }
        ]);

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getByText(/filename1/i)).toBeDefined();
        expect(screen.getByText(/no description available/i)).toBeDefined();
    });

    test("should show listed attachments with no comment", async () => {
        // Arrange
        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetSubResultID.mockReturnValue(-1);
        mockGetTestResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1",
            },
            {
                id: "attachment2",
                fileName: "filename2",
            }
        ]);

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getByText(/filename1/i)).toBeDefined();
        expect(screen.getByText(/filename2/i)).toBeDefined();
        expect(screen.getAllByText(/no description available/i)).toHaveLength(2);
    });

    test("should show listed attachment with comment", async () => {
        // Arrange
        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetSubResultID.mockReturnValue(-1);
        mockGetTestResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1",
                comment: "comment1",
            }
        ]);

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getByText(/filename1/i)).toBeDefined();
        expect(screen.getByText(/comment1/i)).toBeDefined();
    });

    test("should show listed attachments with comment", async () => {
        // Arrange
        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetSubResultID.mockReturnValue(-1);
        mockGetTestResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1",
                comment: "comment1",
            },
            {
                id: "attachment2",
                fileName: "filename2",
                comment: "comment2",
            }
        ]);

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getByText(/filename1/i)).toBeDefined();
        expect(screen.getByText(/comment1/i)).toBeDefined();
        expect(screen.getByText(/filename2/i)).toBeDefined();
        expect(screen.getByText(/comment2/i)).toBeDefined();
    });

    test("should show listed attachments with mixed comment", async () => {
        // Arrange
        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetSubResultID.mockReturnValue(-1);
        mockGetTestResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1",
            },
            {
                id: "attachment2",
                fileName: "filename2",
                comment: "comment2",
            }
        ]);

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getByText(/filename1/i)).toBeDefined();
        expect(screen.getByText(/no description available/i)).toBeDefined();
        expect(screen.getByText(/filename2/i)).toBeDefined();
        expect(screen.getByText(/comment2/i)).toBeDefined();
    });

    test("should select attachment", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn().mockReturnValue("https://url1/");

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetSubResultID.mockReturnValue(-1);
        mockGetTestResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.txt",
            }
        ]);
        mockGetTestResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename1/));

        fireEvent.click(screen.getByText(/filename1/i));

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getAllByText(/filename1/i)).toHaveLength(2);
        expect(screen.getByTestId("iframe")).toBeDefined();
        expect(screen.getByTestId("iframe").getAttribute("src")).toEqual("https://url1/");
    });

    test("should select second attachment", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn().mockReturnValue("https://url2/");

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetSubResultID.mockReturnValue(-1);
        mockGetTestResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.txt",
            },
            {
                id: "attachment2",
                fileName: "filename2.txt",
            }
        ]);
        mockGetTestResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename2/));

        fireEvent.click(screen.getByText(/filename2/i));

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getAllByText(/filename2/i)).toHaveLength(2);
        expect(screen.getByTestId("iframe")).toBeDefined();
        expect(screen.getByTestId("iframe").getAttribute("src")).toEqual("https://url2/");
    });

    test("should select attachment with unknown type", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn().mockReturnValue("https://url1/");

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetSubResultID.mockReturnValue(-1);
        mockGetTestResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.unknown",
            }
        ]);
        mockGetTestResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename1/));

        fireEvent.click(screen.getByText(/filename1/i));

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getAllByText(/filename1/i)).toHaveLength(2);
        expect(screen.getByTestId("iframe")).toBeDefined();
        expect(screen.getByTestId("iframe").getAttribute("src")).toEqual("https://url1/");
    });

    test("should switch selected attachment", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn()
            .mockReturnValueOnce("https://url1/")
            .mockReturnValueOnce("https://url2/");

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetSubResultID.mockReturnValue(-1);
        mockGetTestResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.txt",
            },
            {
                id: "attachment2",
                fileName: "filename2.txt",
            }
        ]);
        mockGetTestResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename1/));

        fireEvent.click(screen.getByText(/filename1/i));
        await new Promise((resolve => setTimeout(resolve, 0)));

        fireEvent.click(screen.getByText(/filename2/i));
        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getAllByText(/filename2/i)).toHaveLength(2);
        expect(screen.getByTestId("iframe")).toBeDefined();
        expect(screen.getByTestId("iframe").getAttribute("src")).toEqual("https://url2/");
    });

    test("should lock during attachment load", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn().mockReturnValueOnce("https://url1/");

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetSubResultID.mockReturnValue(-1);
        mockGetTestResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.txt",
            }
        ]);
        mockGetTestResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename1/));

        fireEvent.click(screen.getByText(/filename1/i));
        const loading = screen.getByTestId("loading-attachment");
        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(loading).toBeDefined();
        expect(screen.queryByTestId("loading-attachment")).toBeNull();
    });

    test("should lock during switch of selected attachment", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn()
            .mockReturnValueOnce("https://url1/")
            .mockReturnValueOnce("https://url2/");

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetSubResultID.mockReturnValue(-1);
        mockGetTestResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.txt",
            },
            {
                id: "attachment2",
                fileName: "filename2.txt",
            }
        ]);
        mockGetTestResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename1/));

        fireEvent.click(screen.getByText(/filename1/i));

        const loading = screen.getByTestId("loading-attachment");
        await new Promise((resolve => setTimeout(resolve, 0)));

        fireEvent.click(screen.getByText(/filename2/i));
        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getAllByText(/filename2/i)).toHaveLength(2);
        expect(loading).toBeDefined();
    });

    test("should set restriction for attachment content iframe by default", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn().mockReturnValue("https://url1/");

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetSubResultID.mockReturnValue(-1);
        mockGetTestResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.html",
            }
        ]);
        mockGetTestResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename1/));

        fireEvent.click(screen.getByText(/filename1/i));

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getAllByText(/filename1/i)).toHaveLength(2);
        expect(screen.getByTestId("iframe")).toBeDefined();
        expect(screen.getByTestId("iframe").getAttribute("sandbox")).toEqual("");
    });

    test("should not restrict attachment content iframe for PDFs", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn().mockReturnValue("https://url1/");

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetSubResultID.mockReturnValue(-1);
        mockGetTestResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.pdf",
            }
        ]);
        mockGetTestResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename1/));

        fireEvent.click(screen.getByText(/filename1/i));

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getAllByText(/filename1/i)).toHaveLength(2);
        expect(screen.getByTestId("iframe")).toBeDefined();
        expect(screen.getByTestId("iframe").getAttribute("sandbox")).toBeNull();
    });

    test("should set restriction for attachment content iframe of mp4", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn().mockReturnValue("https://url1/");

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetSubResultID.mockReturnValue(-1);
        mockGetTestResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.mp4",
            }
        ]);
        mockGetTestResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename1/));

        fireEvent.click(screen.getByText(/filename1/i));

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getAllByText(/filename1/i)).toHaveLength(2);
        expect(screen.getByTestId("iframe")).toBeDefined();
        expect(screen.getByTestId("iframe").getAttribute("sandbox")).toEqual("allow-same-origin");
    });

});
