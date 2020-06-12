
export default class CacheFirst {
    cacheInit: Promise<any>;
    cache: Cache | null = null;
    /**
     * 
     * @param {string} cacheName 
     */
    constructor(cacheName: string) {
        this.cacheInit = this.initCache(cacheName);
    }

    /**
     * 
     * @param {string} cacheName 
     */
    async initCache(cacheName: string) {
        this.cache = await caches.open(cacheName);
        return this.cache;
    }

    async fromNetwork(request: Promise<any> | undefined, requestKey: RequestInfo) {
        if (request) {
            let response = await request;
            this.cache?.put(new Request(requestKey), new Response(JSON.stringify(response)))
            return response;
        }
        throw new Error("no request given")
    }

    async fromCache(requestKey: RequestInfo) {
        let cachedResponse = await this.cache?.match(new Request(requestKey));
        if (cachedResponse) {
            return await cachedResponse.json();
        }
        throw new Error("not found in cache");
    }

    /**
     * 
     * @param {string} requestKey 
     * @param {Promise} request
     */
    async get(requestKey: RequestInfo, request: Promise<any> | undefined = undefined) {
        if (!this.cache) {
            await this.cacheInit;
        }
        try {
            return await this.fromCache(requestKey)
        } catch (err) {
            try {
                return await this.fromNetwork(request, requestKey);
            } catch (err) {
                return null;
            }
        }
    }
}

export class NetworkFirst extends CacheFirst {

    /**
     * 
     * @param {string} requestKey 
     * @param {Promise} request 
     */
    async get(requestKey: RequestInfo, request: Promise<any> | undefined = undefined) {
        if (!this.cache) {
            await this.cacheInit;
        }
        try {
            return await this.fromNetwork(request, requestKey);
        } catch (err) {
            try {
                return await this.fromCache(requestKey)
            }
            catch (err) {
                return null;
            }
        }
    }
}