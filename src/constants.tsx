export const stateLabels = ['STARRED', 'UNREAD', 'IMPORTANT']
export const systemFolders = ['SENT', 'TRASH', 'SPAM', 'DRAFT']
export const categories = ['category:primary', 'category:social', 'category:promotions', 'category:updates', 'category:forums', 'category:reservations', 'category:purchases']
export const noShow = stateLabels.concat(systemFolders);
export const INBOX = 'INBOX';
export const defaultSettings = { labels: {}, bundleLabels: {}, sortLabel: {} }
export const keys = { settings: 'settings', CACHE_ALL_LABELS: 'ALL_LABLES', CACHE_LABLES: 'LABLES', CACHE_THREADS: "THREADS", CACHE_BUNDLES: 'BUNDLES', CACHE_ATTACHMENTS: 'ATTACHMENTS' }
