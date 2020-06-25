import React, { MouseEvent } from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ArchiveIcon from '@material-ui/icons/Archive';
import translate from '../translations';
import ThreadList from './ThreadList';
import gmailInstance, { ILabel, IThread } from './gmailAPI';
import { withStyles, WithStyles, createStyles } from '@material-ui/core';
import { CSSTransition } from "react-transition-group";

const styles = createStyles({

    root: {
        "&:hover $archive": {
            display: "inline-block"
        },
        "&-exit": {
            overflowX: "hidden",
            transform: "translateX(0)",
        },
        "&-exit-active": {
            transform: "translateX(100%)",
            transition: "transform 0.5s"
        }
    },

    archive: {
        display: "none",
        cursor: "pointer",
        zIndex: 1
    },
});

interface Props extends WithStyles<typeof styles> {
    label?: ILabel,
    category?: string,
    onArchived?: (item: ILabel | string) => void;
}

interface State {
    name: string,
    unread: number,
    open: boolean,
    threads: IThread[],
    labelColors?: any,
    mounted: boolean
}

class LabelGroup extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        let labelColors = {}
        if (props.label?.color) {
            labelColors = {
                color: props.label.color.textColor,
                backgroundColor: props.label.color.backgroundColor
            }
        }
        let name = ''
        if (props.category) {
            name = translate(props.category);
        } else if (props.label) {
            name = translate(props.label.name);
        }
        this.state = {
            name,
            unread: 0,
            open: false,
            threads: [],
            labelColors,
            mounted: true
        }
    }

    componentDidMount() {
        let labelIds = ['INBOX'];
        let query;
        if (this.props.label) {
            labelIds.push(this.props.label.id);
        } else if (this.props.category) {
            query = this.props.category;
        }

        gmailInstance.listThreads(this.state.name.replace(":", "_"), query, labelIds).then(result => {
            let { threads, resultSizeEstimate } = result;
            let unread = resultSizeEstimate;
            if (this.props.label) {
                unread = Math.min(this.props.label.messagesUnread, unread);
            }
            if (threads) {
                this.setState({ threads, unread })
            } else {
                this.setState({ unread })
            }
        })
    }

    toggleOpen() {
        this.setState({ open: !this.state.open });
    }

    archiveThread(id: string) {
        gmailInstance.archiveThread(id).then(_ => {
            this.setState({ threads: this.state.threads.filter(thread => thread.id !== id) })
        })
    }

    archive(e: MouseEvent) {
        e.stopPropagation();
        gmailInstance.archiveThreads(this.state.threads.map(thread => thread.id)).then(_ => {
            this.setState({ mounted: false }, () => {

            })
        });
    }

    onExited() {
        if (this.props.onArchived) {
            this.props.onArchived(this.props.label || this.props.category || "");
        }
    }

    render() {
        if (this.state.unread === 0) {
            return ''
        }
        const { classes } = this.props;
        const rootRef = React.createRef<HTMLDivElement>();

        return (
            <CSSTransition
                in={this.state.mounted}
                unmountOnExit
                timeout={500}
                classNames={classes.root}
                onExited={this.onExited.bind(this)}
                nodeRef={rootRef}
            >
                <div ref={rootRef} className={classes.root} >
                    <ListItem style={this.state.labelColors} button onClick={this.toggleOpen.bind(this)}>
                        <ListItemText primary={translate(this.state.name)} secondary={this.state.unread}></ListItemText>
                        <ArchiveIcon className={classes.archive} onClick={this.archive.bind(this)}></ArchiveIcon>
                        {this.state.open ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse style={{ paddingLeft: "1em" }} in={this.state.open} timeout={"auto"} mountOnEnter>
                        <ThreadList threads={this.state.threads} archiveThread={this.archiveThread.bind(this)}></ThreadList>
                    </Collapse>
                </div>
            </CSSTransition>
        )
    }
}

export default withStyles(styles)(LabelGroup);