import React from 'react';
import { NetworkFirst } from '../requestCache';
import { noShow, keys } from '../constants';
import LabelGroup from './LabelGroup';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import gmailInstance, { ILabel } from './gmailAPI';


interface Props {
    logo: any,
    classes: any,
}


class BundleView extends React.Component<Props, { labels: ILabel[] }> {
    constructor(props: Props) {
        super(props)
        this.state = {
            labels: []
        }
    }

    componentDidMount() {
        this.getLabels()
    }

    getLabels() {
        gmailInstance.listAllLabels().then(labels => this.setState({ labels }));
    }

    render() {
        const { classes } = this.props;
        let { labels } = this.state;
        return <>
            <h3>Bundle View</h3>
            <List className={classes.root}>

                {
                    labels.length === 0 ?
                        <img src={this.props.logo} className="App-logo" alt="logo" />
                        :
                        labels.map(label => <LabelGroup key={label.id} label={label}></LabelGroup>)
                }
            </List>
        </>
    }
}

export default withStyles(theme => ({
    root: {
        width: '50vw',
        overflowY: 'auto',
        backgroundColor: theme.palette.background.paper,
    },
}), { withTheme: true })(BundleView);