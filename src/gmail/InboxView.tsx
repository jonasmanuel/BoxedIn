import React from 'react'
import { get as lsget } from 'local-storage'
import { systemFolders, keys, ISettings, defaultSettings, categories } from '../constants'
import CacheFirst, { NetworkFirst } from '../requestCache'
import ThreadList from './ThreadList'
import { List } from "@material-ui/core";
import { withStyles } from '@material-ui/core'
import LabelGroup from './LabelGroup'
import gmailInstance, { ILabel } from './gmailAPI';

interface Props {
    classes: any
}

class InboxView extends React.Component<Props, { settings: ISettings, threads: any[], labels: ILabel[] }> {
    labelCache: CacheFirst
    threadCache: NetworkFirst
    constructor(props: Props) {
        super(props)
        this.state = {
            settings: lsget(keys.settings) || defaultSettings,
            threads: [],
            labels: []
        }
        this.labelCache = new CacheFirst(keys.CACHE_LABELS);
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
            .concat(categories.map(category => `NOT ${category}`)).join(" ")
        //  filter = categories.map(category=>`NOT ${category}`).join(" ");
        return filter;

    }


    getThreads() {
        gmailInstance.listThreads("listThreads", this.getLabelFilter()).then(result => {
            let threads = result.threads || [];
            this.setState({ threads });
        });
    }

    getLabels() {
        let labelIds: string[] = Object.values(this.state.settings.bundleLabels).map(label => label.id);
        gmailInstance.getLabels(labelIds, "bundleLabels").then(labels => this.setState({ labels }));
    }

    archiveThread(id: string){
        gmailInstance.archiveThread(id).then(_ =>{
            this.setState({threads: this.state.threads.filter(thread => thread.id !== id)})
        })
    }

    render() {
        const { classes } = this.props;
        return (
            <>
                <List className={classes.root}>
                    {categories.map(category => <LabelGroup key={category} category={category}></LabelGroup>)}
                    {this.state.labels.map(label => <LabelGroup key={label.id} label={label}></LabelGroup>)}
                    <ThreadList threads={this.state.threads} archiveThread={this.archiveThread.bind(this)}></ThreadList>
                </List>
            </>
        )
    }

}

export default withStyles(theme => ({
    root: {
        width: '100%',
        overflowY: 'auto',
        backgroundColor: theme.palette.background.paper,
    },
}), { withTheme: true })(InboxView)