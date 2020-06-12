import { ILabel } from "./gmail/gmailAPI";

export const stateLabels = ['STARRED', 'UNREAD', 'IMPORTANT']
export const systemFolders = ['SENT', 'TRASH', 'SPAM', 'DRAFT']
export const categories = ['category:social', 'category:promotions', 'category:updates', 'category:forums', 'category:reservations', 'category:purchases'] //'category:primary', 
export const noShow = stateLabels.concat(systemFolders);
export const INBOX = 'INBOX';
export const defaultSettings : ISettings = { labels: {}, bundleLabels: {}, sortLabel: {} }
export const keys = { settings: 'settings', CACHE_ALL_LABELS: 'ALL-LABELS', CACHE_LABELS: 'LABELS', CACHE_THREADS: "THREADS", CACHE_BUNDLES: 'BUNDLES', CACHE_ATTACHMENTS: 'ATTACHMENTS' }
export interface ISettings {
    labels: {},
    bundleLabels:  { [key: string]: ILabel },
    sortLabel: {}
}