import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import "./TestResultDetailsTabPreviewer.scss";

import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";

import { Card } from "azure-devops-ui/Card";
import { Page } from "azure-devops-ui/Page";
import { ScrollableList, IListItemDetails, ListSelection, ListItem } from "azure-devops-ui/List";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";
import { ZeroData } from "azure-devops-ui/ZeroData";

import { IProjectPageService, CommonServiceIds } from "azure-devops-extension-api/Common";
import { TestAttachment } from "azure-devops-extension-api/Test/Test";

import { showRootComponent } from "../../Common";
import { AzureDevOpsUtilities } from "./AzureDevOpsUtilities";

/**
 * The interface containg the information of the currently selected information
 * item.
 */
interface ISelectedInformation {

    /**
     * The title being displayed of the selected resource from the information.
     */
    readonly title: string;

    /**
     * The URL to the resource, it is embedded in a iframe.
     */
    readonly url: string;

    /**
     * The MIME type of the resource, an empty string applies all restrictions,
     * null applies no restrictions.
     */
    readonly sandbox: string | null;

}

/**
 * The state of the run with its corresponding data.
 */
interface ITestResultDetailsTabPreviewerComponentState {

    /**
     * The attachments of the run, if there were multiple attempts of the run,
     * the attachments of the attempt are fetched.
     */
    readonly attachments: ArrayItemProvider<TestAttachment>;

    /**
     * The information that are currently selected by the user.
     */
    readonly selected?: ISelectedInformation;

    /**
     * Whether the component has finished loading its data.
     */
    readonly loaded: boolean;

    /**
     * Whether an attachment is currently being loaded, happens when one is
     * clicked by the user, prevents them from loading 2 attachments at the
     * same time.
     */
    readonly lock: boolean;

}

/**
 * The tab containing the attachment previews.
 */
export class TestResultDetailsTabPreviewerComponent extends React.Component<{}, ITestResultDetailsTabPreviewerComponentState> {

    /**
     * The current attachment selection from the list overview.
     */
    private attachmentSelection = new ListSelection(true);

    /**
     * A map that maps the file extension type to a MIME type.
     */
    private TYPE_MAPPINGS: { [type: string]: string } = {
        "htm": "text/html",
        "html": "text/html",

        "pdf": "application/pdf",

        "mp4": "video/mp4",
        "wmv": "video/x-ms-wmv",

        "gif": "image/gif",

        "ico": "image/vnd.microsoft.icon",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "json": "application/json",
        "png": "image/png",
        "svg": "image/svg+xml",
    };

    /**
     * A map that contains the MIME types and their sandbox restrictions.
     */
    private TYPE_SANDBOX: { [type: string]: string | null } = {
        // required for videos to display and allow their playback
        "video/mp4": "allow-same-origin",
        "video/x-ms-wmv": "allow-same-origin",

        // there are no restrictions that prevents PDFs from being blocked
        "application/pdf": null,
    };

    /**
     * Initializes the component and sets a default state.
     */
    constructor(props: {}) {
        super(props);

        this.state = {
            attachments: new ArrayItemProvider([]),

            selected: undefined,

            loaded: false,
            lock: false,
        };
    }

    /**
     * Setups the component once it gets mounted in the UI.
     */
    public componentDidMount() {
        this.setup();
    }

    /**
     * Render the attachment preview tab.
     */
    public render(): JSX.Element {
        // the initial loading screen
        if (!this.state.loaded) {
            return (
                <Page className="test-result-details-tab-previewer-tab flex-grow flex-row">
                    <div className="loading" data-testid="loading">
                        <Spinner className="loading" size={SpinnerSize.large} />
                    </div>
                </Page>
            );
        }

        // whenever no attachments are available
        if (!this.state.attachments || this.state.attachments.length === 0) {
            return (
                <Page className="test-result-details-tab-previewer-tab flex-grow flex-row justify-center">
                    <ZeroData
                        primaryText="No attachments"
                        secondaryText={
                            <span>
                                No available attachments to preview.
                            </span>
                        }
                        imagePath=""
                        imageAltText=""
                    />
                </Page>
            );
        }

        // the attachments listing and preview itself
        return (
            <Page className="test-result-details-tab-previewer-tab flex-grow flex-row">
                <div className={"attachments flex-row " + (this.state.lock ? "attachments-disable" : "")}>
                    <ScrollableList
                        itemProvider={this.state.attachments}
                        renderRow={this.renderAttachmentRow}
                        selection={this.attachmentSelection}
                        onSelect={(_, item) => this.onAttachmentClick(item.data.fileName, item.data.id)}
                        maxWidth="250px" />
                </div>

                <div className="attachment flex-column">
                    {!this.state.lock ?
                        this.state.selected ?
                            <Card className="bolt-card-white" titleProps={{ text: this.state.selected.title, ariaLevel: 3 }}>
                                {this.state.selected.sandbox === null // only disable the sandbox if specifically configured
                                     ? <iframe className="iframe" data-testid="iframe" frameBorder="false" src={this.state.selected.url}></iframe>
                                     : <iframe className="iframe" data-testid="iframe" frameBorder="false" src={this.state.selected.url} sandbox={this.state.selected.sandbox}></iframe>
                                }
                            </Card>
                                :
                            <ZeroData
                              primaryText="No attachment selected"
                              secondaryText={
                                  <span>
                                      Please selected a attachment to preview.
                                  </span>
                              }
                              imagePath=""
                              imageAltText="" />
                        :
                    <div className="loading" data-testid="loading-attachment">
                        <Spinner className="loading" size={SpinnerSize.large} />
                    </div>
                    }
                </div>
            </Page>
        );
    }

    /**
     * Renders the row where the attachments are being listed.
     */
    private renderAttachmentRow(index: number,
                                item: TestAttachment,
                                details: IListItemDetails<TestAttachment>,
                                key?: string): JSX.Element {

        return (
            <ListItem key={key || "list-item-" + index} index={index} details={details}>
                <div className="attachment-item flex-column h-scroll-hidden">
                    <span className="text-ellipses">{item.fileName}</span>
                    <span className="fontSizeMS font-size-ms text-ellipses secondary-text">{item.comment || "No description available"}</span>
                </div>
            </ListItem>
        );
    }

    /**
     * Load the attachment data of the currently selected test result.
     */
    private async setup(): Promise<void> {
        await SDK.init();

        const configuration = SDK.getConfiguration();

        const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
        const project = await projectService.getProject();

        if (!project) {
            console.warn("[TestResultDetailsTabPreviewer] invalid project");

             return;
        }

        const testResultClient = AzureDevOpsUtilities.getTestResultRestClient();

        // if the attempt ID is not `-1` then the attempt attachments are
        // fetched from the run itself
        const attachments = configuration.subResultId !== -1
            ? await testResultClient.getTestSubResultAttachments(project.name, configuration.runId, configuration.resultId, configuration.subResultId)
            : await testResultClient.getTestResultAttachments(project.name, configuration.runId, configuration.resultId);

        const provider = new ArrayItemProvider(attachments);
        this.setState({ loaded: true, attachments: provider });
    }

    /**
     * Handles the selection of an attachment from the provided attachment list.
     */
    private async onAttachmentClick(title: string, attachmentId: number): Promise<void> {
        // lock the UI, prevents the user from clicking on another attachment
        // during loading
        this.setState({ lock: true });

        const configuration = SDK.getConfiguration();

        const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
        const project = await projectService.getProject();

        if (!project) {
            console.warn("[TestResultDetailsTabPreviewer] invalid project");

             return;
        }

        const testResultClient = AzureDevOpsUtilities.getTestResultRestClient();

        // if the attempt ID is not `-1` then the attempt attachments are
        // fetched from the run itself
        const content = configuration.subResultId !== -1
            ? await testResultClient.getTestSubResultAttachmentContent(project.name, configuration.runId, configuration.resultId, attachmentId, configuration.resultId)
            : await testResultClient.getTestResultAttachmentContent(project.name, configuration.runId, configuration.resultId, attachmentId);

        const blob = new Blob([content]);

        // the title is the file name it can be different types, such as a PDF
        // PNG, WMV or a text
        const split = title.split(".");
        const type = split[split.length - 1];
        const mime = this.TYPE_MAPPINGS[type] || "text/plain";
        const file = new Blob([blob], { type: mime });

        // get the sandbox restrictions for the given MIME type, by default an
        // empty string means everything is restricted, if null is specified no
        // restrictions are applied
        const whitelist = this.TYPE_SANDBOX[mime];
        const sandbox = (whitelist || whitelist === null) ? whitelist : "";

        // create the local URL to display
        const url = URL.createObjectURL(file);

        const selected: ISelectedInformation = { title, url, sandbox };

        this.setState({ selected: selected, lock: false });
    }

}

export default TestResultDetailsTabPreviewerComponent;

showRootComponent(<TestResultDetailsTabPreviewerComponent />);
