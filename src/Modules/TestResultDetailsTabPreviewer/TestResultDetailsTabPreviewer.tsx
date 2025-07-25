import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import "./TestResultDetailsTabPreviewer.scss";

import { ArrayItemProvider } from "azure-devops-ui/Utilities/Provider";

import { Card } from "azure-devops-ui/Card";
import { Page } from "azure-devops-ui/Page";
import { ScrollableList, IListItemDetails, ListSelection, ListItem } from "azure-devops-ui/List";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";
import { ZeroData } from "azure-devops-ui/ZeroData";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";

import { IProjectPageService, CommonServiceIds, IProjectInfo } from "azure-devops-extension-api/Common";
import { TestAttachment, ResultDetails } from "azure-devops-extension-api/Test/Test";

import { showRootComponent } from "../../Common";
import { AzureDevOpsUtilities } from "./AzureDevOpsUtilities";
import { TestResultsRestClient } from "azure-devops-extension-api/TestResults";
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";

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
     * The text being displayed for the selected resource, set in-place of URL.
     */
    readonly text?: string;

    /**
     * The URL to the resource, it is embedded in a iframe, set in-place of URL.
     */
    readonly url?: string;

    /**
     * The URL to download the resource.
     */
    readonly downloadUrl: string;

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
        "png": "image/png",
        "svg": "image/svg+xml",
        "bmp": "image/bmp",
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
     * All available buttons shown for a selected previewed attachment.
     */
    private previewerHeaderBarItems: IHeaderCommandBarItem[] = [
        {
            id: "preview-download",
            text: "Download",
            onActivate: () => { this.onAttachmentDownloadClick() },
            iconProps: { iconName: "Download" }
        }
    ];

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
                <Page className="test-result-details-tab-previewer-tab flex-grow flex-column justify-center">
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
                        onSelect={(_, item) => this.onAttachmentClick(item.data.fileName, item.data.id, item.data.url)}
                        maxWidth="250px" />
                </div>

                <div className="attachment flex-column">
                    {!this.state.lock ?
                        this.state.selected ?
                            <Card className="bolt-card-white"
                                titleProps={{ text: this.state.selected.title, ariaLevel: 3 }}
                                headerCommandBarItems={this.previewerHeaderBarItems}>
                                {this.state.selected.text ?
                                    <div className="input" data-testid="text-attachment">
                                        <TextField
                                            multiline={true}
                                            readOnly={true}
                                            value={this.state.selected.text}
                                            width={TextFieldWidth.auto} />
                                    </div>
                                    : // if no text is set then a local URL is being used
                                    this.state.selected.sandbox === null // only disable the sandbox if specifically configured
                                        ? <iframe className="iframe" data-testid="iframe" frameBorder="false" src={this.state.selected.url}></iframe>
                                        : <iframe className="iframe" data-testid="iframe" frameBorder="false" src={this.state.selected.url} sandbox={this.state.selected.sandbox}></iframe>
                                }
                            </Card>
                            :
                            <ZeroData
                                primaryText="No attachment selected"
                                secondaryText={
                                    <span>
                                        Please select an attachment to preview.
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
     * Gets the run sub result id for the provided configuration, returns
     * null if invalid and -1 if an overall run overview.
     */
    private async getSubResultId(configuration: { [key: string]: any }, project: IProjectInfo, testResultClient: TestResultsRestClient): Promise<number | null> {
        // for test run sections that aren't actually run results
        if (configuration.runId && !configuration.resultId) {
            const attachments = await testResultClient.getTestRunAttachments(project.name, configuration.runId);
            if (attachments.length === 0) return null;

            return -1;
        }

        if (!configuration.resultId) {
            this.setState({ loaded: true, attachments: new ArrayItemProvider([]) });

            return null;
        }

        const results = await testResultClient.getTestResultById(project.name, configuration.runId, configuration.resultId, ResultDetails.SubResults);

        // in this case a test run has been selected directly
        if (configuration.subResultId != 0) return configuration.subResultId;

        // this ensures that when a run exists with sub results that the
        // attachments of the last attempt is shown
        const subResultId = results.subResults && results.subResults.length > 0
            ? Array.from(results.subResults).reverse()[0].id
            : configuration.subResultId;

        return subResultId;
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

        const subResultId = await this.getSubResultId(configuration, project, testResultClient);
        if (subResultId == null) {
            this.setState({ loaded: true, attachments: new ArrayItemProvider([]) });

            return;
        }

        // if the subResultId is -1 then the attachments are of the run itself,
        // otherwise they are of the test results themselves
        const attachments = subResultId !== -1
            ? await testResultClient.getTestSubResultAttachments(project.name, configuration.runId, configuration.resultId, subResultId)
            : await testResultClient.getTestRunAttachments(project.name, configuration.runId);

        const sorted = attachments.sort((a, b) => a.fileName.localeCompare(b.fileName));
        const provider = new ArrayItemProvider(sorted);
        this.setState({ loaded: true, attachments: provider });
    }

    /**
     * Handles the selection of an attachment from the provided attachment list.
     */
    private async onAttachmentClick(title: string, attachmentId: number, downloadUrl: string): Promise<void> {
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

        const subResultId = await this.getSubResultId(configuration, project, testResultClient);
        if (subResultId == null) return;

        // if the subResultId is -1 then the attachments are of the run itself,
        // otherwise they are of the test results themselves
        const content = subResultId !== -1
            ? await testResultClient.getTestSubResultAttachmentContent(project.name, configuration.runId, configuration.resultId, attachmentId, subResultId)
            : await testResultClient.getTestRunAttachmentContent(project.name, configuration.runId, attachmentId);

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

        // plain text needs to be displayed in a specific text-box, in order to
        // make it readable for both the dark and light theme, otherwise when
        // using an iFrame, the theme only respects the one configured for the
        // browser but not what is being set Azure in Azure DevOps
        if (mime === "text/plain") {
            // not using blob.text() due to:
            // https://github.com/jsdom/jsdom/issues/2555
            const text = new TextDecoder().decode(content);

            const selected: ISelectedInformation = { title, text, downloadUrl, sandbox };
            this.setState({ selected: selected, lock: false });
        } else {
            // create the local URL to display
            const url = URL.createObjectURL(file);

            const selected: ISelectedInformation = { title, url, downloadUrl, sandbox };
            this.setState({ selected: selected, lock: false });
        }
    }

    /**
     * Triggers a download for the currently selected attachment.
     */
    private onAttachmentDownloadClick(): void {
        if (!this.state.selected) return;

        window.open(this.state.selected.downloadUrl, "_blank");
    }

}

export default TestResultDetailsTabPreviewerComponent;

showRootComponent(<TestResultDetailsTabPreviewerComponent />);
