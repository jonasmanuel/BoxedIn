import { keys, noShow } from "../constants";
import CacheFirst, { NetworkFirst } from "../requestCache";
import credentials from '../credentials.json';


// Authorization scopes required by the API; 
const scope = 'https://www.googleapis.com/auth/gmail.modify';
// Array of API discovery doc URLs for APIs used by the quickstart
const discoveryDocs = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];
// api keys 
const clientId = credentials.web.client_id;
const apiKey = credentials.web.api_key;


export class GmailApi {
    labelCache: NetworkFirst = new NetworkFirst(keys.CACHE_LABELS);
    labelCacheCF: CacheFirst = new CacheFirst(keys.CACHE_LABELS);
    threadCache: NetworkFirst = new NetworkFirst(keys.CACHE_THREADS);
    gmailApi: { labels: any, threads: any, messages: any } | null = null;
    gapi: any;
    isSignedIn: boolean = false;
    signInStatusHandlers: SigninStatusHandler[] = [];

    init() {
        this.gapi = window.gapi;
        this.gapi.load('client:auth2', () => {
            this.gapi.client.init({ apiKey, clientId, discoveryDocs, scope }).then(() => {
                this.gmailApi = window.gapi.client.gmail.users;
                //register signin status event handler
                this.gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSignInStatus.bind(this));

                // Handle the initial sign-in state.
                this.updateSignInStatus(this.gapi.auth2.getAuthInstance().isSignedIn.get());
            }, (error: any) => {
                console.log('Error: ' + error)
            })
        });
        this.authorize.bind(this)
    }

    onSignInStatusChanged(handler: SigninStatusHandler) {
        this.signInStatusHandlers.push(handler);
        handler(this.isSignedIn);
    }

    updateSignInStatus(isSignedIn: boolean) {
        this.isSignedIn = isSignedIn;
        this.signInStatusHandlers.forEach(handler => handler(isSignedIn));
    }

    getCurrentUserProfile(): Profile {
        return this.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
    }

    async getLabels(labelIds: string[], cacheKey: string, cacheFirst?: boolean) {
        if (labelIds.length > 0) {
            let batch = window.gapi.client.newBatch();
            labelIds.forEach(labelId => {
                batch.add(this.gmailApi?.labels.get({
                    id: labelId,
                    userId: 'me'
                }));
            });
            let cache = cacheFirst ? this.labelCacheCF : this.labelCache;
            let responses: Response<Response<ILabel>> = await cache.get(cacheKey, batch);
            let labels: ILabel[] = Object.values(responses.result).map((response: Response<ILabel>) => response.result);
            let labelsSorted = labels.filter(label => label.threadsTotal > 0).sort((l1, l2) => l1.name.localeCompare(l2.name));
            return labelsSorted
        }
        return [];
    }


    async listAllLabels(): Promise<ILabel[]> {
        return this.gmailApi?.labels.list({
            'userId': 'me'
        }).then((response: { result: { labels: [{ id: string }]; }; }) => {
            let labelIds = response.result.labels.filter(label => !noShow.includes(label.id)).map(label => label.id);
            return this.getLabels(labelIds, keys.CACHE_ALL_LABELS);
        });
    }

    async getThread(id: string): Promise<Response<IThread>> {
        return this.threadCache.get(id, this.gmailApi?.threads.get({ userId: 'me', id }))
    }

    async listThreads(cacheKey: string, labelFilter?: string, labelIds: string[] = ['INBOX']): Promise<ThreadResult> {
        return this.threadCache.get(cacheKey, this.gmailApi?.threads.list({
            userId: 'me',
            q: labelFilter,
            labelIds
        })).then((response: Response<ThreadResult>) => {
            if (response.result.resultSizeEstimate > 0) {
                response.result.threads = response.result.threads.sort((a, b) => {
                    return b.historyId - a.historyId
                });
            }
            return response.result;
        });
    }

    async archiveMessage(messageId: string): Promise<IMessage> {
        return this.gmailApi?.messages.modify({
            userId: 'me',
            id: messageId,
            removeLabelIds: ["INBOX"]
        }).then((response: Response<IMessage>) => {
            return response.result;
        });
    }

    async archiveThread(threadId: string): Promise<IThread> {
        return this.gmailApi?.threads.modify({
            userId: 'me',
            id: threadId,
            removeLabelIds: ["INBOX"]
        }).then((response: Response<IThread>) => {
            return response.result;
        });
    }

    async archiveThreads(threadIds: string[]){
        let batch = window.gapi.client.newBatch();
        threadIds.forEach(threadId => {
            batch.add(this.gmailApi?.threads.modify({
                userId: 'me',
                id: threadId,
                removeLabelIds: ["INBOX"]
            }));
        });
        let responses: Response<Response<IThread>> = await batch;
        return responses;
    }


    authorize() {
        this.gapi.auth2.getAuthInstance().signIn();
    }

    signOut() {
        this.gapi.auth2.getAuthInstance().signOut();
    }
}


interface SigninStatusHandler {
    (isSignedIn: boolean): void;
}

interface Profile {
    getId(): string;
    getName(): string;
    getGivenName(): string;
    getFamilyName(): string;
    getImageUrl(): string;
    getEmail(): string;
}

export interface ILabel {
    id: string,
    threadsTotal: number,
    name: string,
    color?: {
        textColor: string,
        backgroundColor: string
    }
    messageListVisibility: string,
    labelListVisibility: string,
    type: string,
    messagesTotal: number,
    messagesUnread: number,
    threadsUnread: number,
};

export interface IThread {
    id: string,
    snippet: string,
    historyId: number,
    messages?: IMessage[]
}

export interface ThreadResult {
    threads: IThread[],
    nextPageToken?: string,
    resultSizeEstimate: number
}

export interface Response<T> {
    result: T
}

export interface IMessage {
    id: string,
    threadId: string,
    labelIds: [
        string
    ],
    snippet: string,
    historyId: number,
    internalDate: number,
    payload: {
        partId: string,
        mimeType: string,
        filename: string,
        headers: [
            {
                name: string,
                value: string
            }
        ],
        body: IAttachment,
        parts: any[]
    },
    sizeEstimate: number,
    raw: Buffer
}

export interface IAttachment {
    attachmentId: String,
    size: number,
    data: Buffer
}

const gmailInstance = new GmailApi();
export default gmailInstance;

