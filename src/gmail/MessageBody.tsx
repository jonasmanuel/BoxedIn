import React, { Component } from 'react';
import { headerMap } from './MessageHeader';
import CacheFirst from '../requestCache';
import logo from '../logo.svg';
import { keys } from '../constants';

var attachmentCache = new CacheFirst(keys.CACHE_ATTACHMENTS);

function getBody(message: { parts: any; body: { data: string; }; }) {
    var encodedBody = '';
    if (typeof message.parts === 'undefined') {
        encodedBody = message.body.data;
    }
    else {
        encodedBody = getHTMLPart(message.parts);
    }
    encodedBody = convert(encodedBody);
    return decodeURIComponent(escape(window.atob(encodedBody)));
}

function convert(encodedBody: string) {
    return encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
}

function getHTMLPart(arr: any[]): string {
    for (var x = 0; x <= arr.length; x++) {
        if (typeof arr[x].parts === 'undefined') {
            if (arr[x].mimeType === 'text/html') {
                return arr[x].body.data;
            }
        }
        else {
            return getHTMLPart(arr[x].parts);
        }
    }
    return '';
}

async function getAttachment(attachment: Attachment) {
    return await attachmentCache.get(attachment.cid, attachment.request).then(response => {
        attachment.data = response.result.data;
        return attachment;
    })
    // return new Promise(resolve =>{
    //     attachmentCache.match(new Request(attachment.cid)).then(cachedResponse=>{
    //         if (cachedResponse){
    //             cachedResponse.json().then(json=>{
    //                 attachment.data = json.data;    
    //                 resolve(attachment)
    //             })


    //         }else {
    //             attachment.request.execute(response=>{
    //                 attachmentCache.put(new Request(attachment.cid), new Response(JSON.stringify(response)));
    //                 attachment.data = response.data;
    //                 resolve(attachment);
    //             })
    //         }
    //     })
    // })
}

function getAttachments(parts: any, messageId: string): { all: Attachment[], byCID: {[key: string]: Attachment} } {
    let attachments = { all: [] as Attachment[], byCID: {} as {[key: string]: Attachment} };
    if (!parts)
        return attachments;
    for (let part of parts) {
        if (part.filename && part.filename.length > 0) {
            var attachId = part.body.attachmentId;
            var request = window.gapi.client.gmail.users.messages.attachments.get({
                'id': attachId,
                messageId,
                'userId': 'me'
            });
            let headers = headerMap(part.headers)
            let cid = headers['Content-ID']
            if (cid)
                cid = cid.replace('<', '').replace('>', '');
            let attachment = new Attachment(attachId, part.filename, cid, part.mimeType, request);
            attachments.all.push(attachment)
            if (cid) {
                attachments.byCID[cid] = attachment;
            }
        } else if (part.mimeType === 'multipart/related') {
            let recAttachments = getAttachments(part.parts, messageId);
            attachments.all.push(...recAttachments.all);
            Object.assign(attachments.byCID, recAttachments.byCID);
        }

    }
    return attachments;
}

class Attachment {
    id: string;
    filename: string;
    cid: string;
    mimeType: string;
    request: any;
    data?: any;
    constructor(id: string, filename: string, cid: string, mimeType: string, request: any) {
        this.id = id;
        this.filename = filename;
        this.cid = cid;
        this.mimeType = mimeType;
        this.request = request;
        this.data = null;
    }

    setData(data: any) {
        this.data = data;
    }


}


// function loadCID(messageId, cid, attachments) {


//     return new Promise(resolve => {

//         let fromStorage = ls.get(`${messageId}.${cid}`)
//         if (fromStorage)
//             resolve(fromStorage);
//         else {
//             let attachment = attachments.byCID[cid];
//             if (attachment.loadingPromise) {
//                 attachment.loadingPromise.then(resolve)
//             } else {
//                 attachment.loadingPromise = this;
//                 attachment.request.execute(response => {
//                     attachment.data = response.data;
//                     let { request, loadingPromise, ...storeAttachtent } = attachment;
//                     ls.set(`${messageId}.${cid}`, storeAttachtent);
//                     resolve(attachment);
//                 })
//             }
//         }
//     });

// }

class MessageBody extends Component<{message: any}, {body: string}> {
    iframe: any;
    timeOut?: number;

    constructor(props: {message: any}) {
        super(props)
        this.state = {
            body: getBody(props.message.payload)
        }
    }

    componentDidMount() {
        let attachments = getAttachments(this.props.message.payload.parts, this.props.message.id);

        let body = this.state.body;
        // replace cids with placeholders
        for (let cid of Object.keys(attachments.byCID)) {
            body = body.split(`cid:${cid}`).join(`${logo}?${cid}`)
        }
        //inject mail.css
        body = body.split('<head>').join('<head><link href="Mail.css" rel="stylesheet" type="text/css">')
        this.setState({body})

        for (let attachment of Object.values(attachments.byCID)) {
            getAttachment(attachment)
                .then(loadedAttachment => {
                    this.setState({ body: this.state.body.split(`${logo}?${loadedAttachment.cid}`).join(`data:${loadedAttachment.mimeType};base64,${convert(loadedAttachment.data)}`) })
                })
        }
    }
    componentDidUpdate() {
        const iframe = this.iframe;
        const document = iframe.contentDocument;
        const html = document.getElementsByTagName('html')[0];
        html.innerHTML = this.state.body;
        this.timeOut = window.setTimeout(() => {
            if (iframe.contentWindow) {
                iframe.height = iframe.contentWindow.document.body.scrollHeight + 30;
            }
        }, 200)
    }

    componentDidUnMount() {
        window.cancelTimeout(this.timeOut);
    }

    setIframeRef(iframe: any) {
        this.iframe = iframe;
    }

    render() {
        return <iframe title={this.props.message.snippet} ref={this.setIframeRef.bind(this)} width="100%"></iframe>
    }
}

export default MessageBody;