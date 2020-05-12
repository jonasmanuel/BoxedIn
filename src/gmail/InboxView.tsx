import React from 'react'
import {get as lsget} from 'local-storage'
import { systemFolders, keys, defaultSettings, categories } from '../constants'
import CacheFirst, { NetworkFirst } from '../requestCache'
import ThreadList from './ThreadList'
import { List } from "@material-ui/core";
import { withStyles } from '@material-ui/core'
import LabelGroup from './LabelGroup'
import { ILabel } from './BundleView'

interface Props {
    classes: any,
    gmailApi: any
}

class InboxView extends React.Component<Props, {settings: any, threads: any[], labels: ILabel[]}> {
    labelCache: CacheFirst
    threadCache: NetworkFirst
    constructor(props: Props) {
        super(props)
        this.state = {
            settings: lsget(keys.settings) || defaultSettings,
            threads: [],
            labels: []
        }
        this.labelCache = new CacheFirst(keys.CACHE_LABLES);
        this.threadCache = new NetworkFirst(keys.CACHE_THREADS);
    }

    componentDidMount() {
        this.getLabels();
        this.getThreads();
    }

    getLabelFilter() {
        let bundleLabels: ILabel[] = Object.values(this.state.settings.bundleLabels);
        let filter = bundleLabels
            .map(label => label.name)
            .concat(systemFolders)
            .map(label => `NOT label:${label}`)
            .concat(categories.map(category=>`NOT ${category}`)).join(" ")
          //  filter = categories.map(category=>`NOT ${category}`).join(" ");
        return filter;

    }


    getThreads() {
        let threadsApi = this.props.gmailApi.threads;
        this.threadCache.get("listThreads", threadsApi.list({
            userId: 'me',
            q: this.getLabelFilter(),
            labelIds: ['INBOX']
        })).then(response => {
            let threads = response.result.threads.sort((a: any, b:any) => {
                return b.historyId - a.historyId
            });
            this.setState({ threads });
        });
    }

    async getLabels() {
        let labels: ILabel[] = Object.values(this.state.settings.bundleLabels);
        let batch = window.gapi.client.newBatch();
        labels.forEach(label => {
            batch.add(this.props.gmailApi.labels.get({
                id: label.id,
                userId: 'me'
            }));
        });
        let responses = await this.threadCache.get("bundleLabels", batch);
        labels = Object.values(responses.result).map((response:any) => response.result);
        let labelsSorted = labels.filter(label => label.threadsTotal > 0).sort((l1, l2) => l1.name.localeCompare(l2.name));
        this.setState({ labels: labelsSorted })
    }

    render() {
        const { classes } = this.props;
        return (
            <>
                <h3>Inbox</h3>
                <List className={classes.root}>
                    {categories.map(category=><LabelGroup key={category} category={category} gmailApi={this.props.gmailApi}></LabelGroup>)}
                    {this.state.labels.map(label=><LabelGroup key={label.id} label={label} gmailApi={this.props.gmailApi}></LabelGroup>)}
                    <ThreadList threads={this.state.threads} gmailApi={this.props.gmailApi}></ThreadList>
                </List>
            </>
        )
    }

}

export default withStyles(theme => ({
    root: {
        width: '50vw',
        overflowY: 'auto',
        backgroundColor: theme.palette.background.paper,
    },
}), { withTheme: true })(InboxView)