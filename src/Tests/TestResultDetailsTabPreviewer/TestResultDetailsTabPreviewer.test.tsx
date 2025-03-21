import { TextDecoder, TextEncoder } from "util";

import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import React from "react";

import TestResultDetailsTabPreviewerComponent from "../../Modules/TestResultDetailsTabPreviewer/TestResultDetailsTabPreviewer";

import { mockGetProject, mockGetSubResultID, mockGetRunID, mockGetResultID } from "../../__mocks__/azure-devops-extension-sdk";
import { mockGetTestSubResultAttachments, mockGetTestSubResultAttachmentContent, mockGetTestResultById, mockGetTestRunAttachments } from "../../__mocks__/azure-devops-extension-api/TestResults";

// related mocks for Azure DevOps are loaded automatically (implementations /src/__mocks__)

// loading module related mocks
jest.mock("../../Common");

describe("TestResultDetailsTabPreviewerComponent", () => {

    // warnings are ignored, these might come from the component itself
    const warn = console.warn.bind(console.warn);
    beforeAll(() => {
        console.warn = () => { };
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
        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestSubResultAttachments.mockResolvedValue([]);

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getByText(/no attachments/i)).toBeDefined();
    });

    test("should show no available attachments for run", async () => {
        // Arrange
        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(null);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestRunAttachments.mockResolvedValue([]);

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getByText(/no attachments/i)).toBeDefined();
    });

    test("should list attachments for run", async () => {
        // Arrange
        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(null);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestRunAttachments.mockResolvedValue([
            {
                id: "attachment2",
                fileName: "filename2",
            }
        ]);

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(mockGetTestRunAttachments).toHaveBeenCalledWith(expect.any(String), expect.any(Number));
        expect(screen.getByText(/filename2/i)).toBeDefined();
    });

    test("should show list attachments of last sub result", async () => {
        // Arrange
        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({
            subResults: [
                {
                    id: 1001,
                },
                {
                    id: 1002,
                }
            ]
        });
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment2",
                fileName: "filename2",
            }
        ]);

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(mockGetTestSubResultAttachments).toHaveBeenCalledWith(expect.any(String), expect.any(Number), expect.any(Number), 1002);
        expect(screen.getByText(/filename2/i)).toBeDefined();
    });

    test("should show no selected attachment", async () => {
        // Arrange
        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
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
        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
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
        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
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

    test("should show listed attachments in sorted order", async () => {
        // Arrange
        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment3",
                fileName: "filename-testz",
            },
            {
                id: "attachment1",
                fileName: "filename-testa",
            },
            {
                id: "attachment2",
                fileName: "filename-testf",
            }
        ]);

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getAllByText(/filename-/i)[0].textContent).toBe("filename-testa");
        expect(screen.getAllByText(/filename-/i)[1].textContent).toBe("filename-testf");
        expect(screen.getAllByText(/filename-/i)[2].textContent).toBe("filename-testz");
    });

    test("should show listed attachment with comment", async () => {
        // Arrange
        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
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
        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
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
        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
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

    test("should select URL attachment", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn().mockReturnValue("https://url1/");

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.svg",
            }
        ]);
        mockGetTestSubResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

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

    test("should select text attachment", async () => {
        // Arrange
        Object.assign(global, { TextDecoder });

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.txt",
            }
        ]);
        mockGetTestSubResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename1/));

        fireEvent.click(screen.getByText(/filename1/i));

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getAllByText(/filename1/i)).toHaveLength(2);
        expect(screen.getByTestId("text-attachment")).toBeDefined();
        expect(screen.getByTestId("text-attachment").querySelector("textarea")!.textContent).toEqual("content");
    });

    test("should select second URL attachment", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn().mockReturnValue("https://url2/");

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.svg",
            },
            {
                id: "attachment2",
                fileName: "filename2.svg",
            }
        ]);
        mockGetTestSubResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

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

    test("should select second text attachment", async () => {
        // Arrange
        Object.assign(global, { TextDecoder });

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.txt",
            },
            {
                id: "attachment2",
                fileName: "filename2.txt",
            }
        ]);
        mockGetTestSubResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename2/));

        fireEvent.click(screen.getByText(/filename2/i));

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getAllByText(/filename2/i)).toHaveLength(2);
        expect(screen.getByTestId("text-attachment")).toBeDefined();
        expect(screen.getByTestId("text-attachment").querySelector("textarea")!.textContent).toEqual("content");
    });

    test("should select attachment as text attachment with unknown type", async () => {
        // Arrange
        Object.assign(global, { TextDecoder });

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.unknown",
            }
        ]);
        mockGetTestSubResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename1/));

        fireEvent.click(screen.getByText(/filename1/i));

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getAllByText(/filename1/i)).toHaveLength(2);
        expect(screen.getByTestId("text-attachment")).toBeDefined();
        expect(screen.getByTestId("text-attachment").querySelector("textarea")!.textContent).toEqual("content");
    });

    test("should switch selected URL attachment", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn()
            .mockReturnValueOnce("https://url1/")
            .mockReturnValueOnce("https://url2/");

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.svg",
            },
            {
                id: "attachment2",
                fileName: "filename2.svg",
            }
        ]);
        mockGetTestSubResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

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

    test("should switch selected text attachment", async () => {
        // Arrange
        Object.assign(global, { TextDecoder });

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.txt",
            },
            {
                id: "attachment2",
                fileName: "filename2.txt",
            }
        ]);
        mockGetTestSubResultAttachmentContent
            .mockReturnValueOnce(new TextEncoder().encode("content1"))
            .mockReturnValueOnce(new TextEncoder().encode("content2"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename1/));

        fireEvent.click(screen.getByText(/filename1/i));
        await new Promise((resolve => setTimeout(resolve, 0)));

        fireEvent.click(screen.getByText(/filename2/i));
        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getAllByText(/filename2/i)).toHaveLength(2);
        expect(screen.getByTestId("text-attachment")).toBeDefined();
        expect(screen.getByTestId("text-attachment").querySelector("textarea")!.textContent).toEqual("content2");
    });

    test("should switch selected URL to text attachment", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn().mockReturnValue("https://url1/");
        Object.assign(global, { TextDecoder });

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.svg",
            },
            {
                id: "attachment2",
                fileName: "filename2.txt",
            }
        ]);
        mockGetTestSubResultAttachmentContent
            .mockReturnValueOnce(new TextEncoder().encode("content1"))
            .mockReturnValueOnce(new TextEncoder().encode("content2"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename1/));

        fireEvent.click(screen.getByText(/filename1/i));
        await new Promise((resolve => setTimeout(resolve, 0)));

        fireEvent.click(screen.getByText(/filename2/i));
        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getAllByText(/filename2/i)).toHaveLength(2);
        expect(screen.getByTestId("text-attachment")).toBeDefined();
        expect(screen.getByTestId("text-attachment").querySelector("textarea")!.textContent).toEqual("content2");
    });

    test("should switch selected text to URL attachment", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn().mockReturnValue("https://url1/");
        Object.assign(global, { TextDecoder });

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.txt",
            },
            {
                id: "attachment2",
                fileName: "filename2.svg",
            }
        ]);
        mockGetTestSubResultAttachmentContent.mockReturnValueOnce(new TextEncoder().encode("content1"));

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
        expect(screen.getByTestId("iframe").getAttribute("src")).toEqual("https://url1/");
    });

    test("should lock during URL attachment load", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn().mockReturnValueOnce("https://url1/");

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.svg",
            }
        ]);
        mockGetTestSubResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

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

    test("should lock during switch of selected URL attachment", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn()
            .mockReturnValueOnce("https://url1/")
            .mockReturnValueOnce("https://url2/");

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.svg",
            },
            {
                id: "attachment2",
                fileName: "filename2.svg",
            }
        ]);
        mockGetTestSubResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

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

    test("should select URL attachment of test with attempt", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn().mockReturnValue("https://url1/");

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(1001);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.svg",
            }
        ]);
        mockGetTestSubResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename1/));

        fireEvent.click(screen.getByText(/filename1/i));

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getAllByText(/filename1/i)).toHaveLength(2);
        expect(mockGetTestSubResultAttachments).toHaveBeenCalledWith(expect.any(String), expect.any(Number), expect.any(Number), 1001);
        expect(mockGetTestSubResultAttachmentContent).toHaveBeenCalledWith(expect.any(String), expect.any(Number), expect.any(Number), expect.any(String), 1001);
        expect(screen.getByTestId("iframe")).toBeDefined();
        expect(screen.getByTestId("iframe").getAttribute("src")).toEqual("https://url1/");
    });

    test("should select URL attachment of test with multiple attempts", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn().mockReturnValue("https://url1/");

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(1001);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({
            subResults: [
                {
                    id: 1001,
                },
                {
                    id: 1002,
                }
            ]
        });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.svg",
            }
        ]);
        mockGetTestSubResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename1/));

        fireEvent.click(screen.getByText(/filename1/i));

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getAllByText(/filename1/i)).toHaveLength(2);
        expect(mockGetTestSubResultAttachments).toHaveBeenCalledWith(expect.any(String), expect.any(Number), expect.any(Number), 1001);
        expect(mockGetTestSubResultAttachmentContent).toHaveBeenCalledWith(expect.any(String), expect.any(Number), expect.any(Number), expect.any(String), 1001);
        expect(screen.getByTestId("iframe")).toBeDefined();
        expect(screen.getByTestId("iframe").getAttribute("src")).toEqual("https://url1/");
    });

    test("should select URL attachment content of parent test with attempt", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn().mockReturnValue("https://url1/");

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({
            subResults: [
                {
                    id: 1001,
                },
                {
                    id: 1002,
                }
            ]
        });
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.svg",
            }
        ]);
        mockGetTestSubResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename1/));

        fireEvent.click(screen.getByText(/filename1/i));

        await new Promise((resolve => setTimeout(resolve, 0)));

        // Assert
        expect(screen.getAllByText(/filename1/i)).toHaveLength(2);
        expect(mockGetTestSubResultAttachments).toHaveBeenCalledWith(expect.any(String), expect.any(Number), expect.any(Number), 1002);
        expect(mockGetTestSubResultAttachmentContent).toHaveBeenCalledWith(expect.any(String), expect.any(Number), expect.any(Number), expect.any(String), 1002);
        expect(screen.getByTestId("iframe")).toBeDefined();
        expect(screen.getByTestId("iframe").getAttribute("src")).toEqual("https://url1/");
    });

    test("should select URL attachment and perform download", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn().mockReturnValue("https://url1/");
        global.window.open = jest.fn();

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.svg",
                url: "https://download1",
            }
        ]);
        mockGetTestSubResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename1/));

        fireEvent.click(screen.getByText(/filename1/i));

        await new Promise((resolve => setTimeout(resolve, 0)));

        fireEvent.click(screen.getByText(/download/i));

        // Assert
        expect(global.window.open).toHaveBeenCalledWith("https://download1", expect.any(String));
    });

    test("should select second URL attachment and perform download", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn().mockReturnValue("https://url2/");
        global.window.open = jest.fn();

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.svg",
                url: "https://download1",
            },
            {
                id: "attachment2",
                fileName: "filename2.svg",
                url: "https://download2",
            }
        ]);
        mockGetTestSubResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

        // Act
        render(<TestResultDetailsTabPreviewerComponent />);

        await waitFor(() => screen.getByText(/filename2/));

        fireEvent.click(screen.getByText(/filename2/i));

        await new Promise((resolve => setTimeout(resolve, 0)));

        fireEvent.click(screen.getByText(/download/i));

        // Assert
        expect(global.window.open).toHaveBeenCalledWith("https://download2", expect.any(String));
    });

    test("should set restriction for attachment content iframe by default", async () => {
        // Arrange
        global.URL.createObjectURL = jest.fn().mockReturnValue("https://url1/");

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.html",
            }
        ]);
        mockGetTestSubResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

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

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.pdf",
            }
        ]);
        mockGetTestSubResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

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

        mockGetRunID.mockReturnValue(1);
        mockGetResultID.mockReturnValue(1);
        mockGetSubResultID.mockReturnValue(0);

        mockGetProject.mockResolvedValue({ name: "project" });
        mockGetTestResultById.mockResolvedValue({});
        mockGetTestSubResultAttachments.mockResolvedValue([
            {
                id: "attachment1",
                fileName: "filename1.mp4",
            }
        ]);
        mockGetTestSubResultAttachmentContent.mockResolvedValue(new TextEncoder().encode("content"));

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
