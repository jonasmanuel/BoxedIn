import React, { MouseEvent } from 'react';
import { Avatar, withStyles, WithStyles, createStyles, makeStyles } from '@material-ui/core';
import translate from '../translations';
import { arrayToMap } from '../utils';
import gmailInstance, { IMessage, ILabel } from './gmailAPI';
import ContactMailIcon from '@material-ui/icons/ContactMail';
import ArchiveIcon from '@material-ui/icons/Archive';
import StarIcon from '@material-ui/icons/Star';
import { CSSTransition } from "react-transition-group";

export function headerMap(headers: { name: string, value: any }[]) {
    return arrayToMap(headers, header => header.name, header => header.value);
}


const styles = createStyles({

    root: {
        display: 'flex',
        position: 'relative',
        "&:hover $archive": {
            display: "block"
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
    header: {
        overflowX: 'hidden'
    },
    archive: {
        position: "absolute",
        top: 10,
        right: 10,
        display: "none",
        cursor: "pointer",
        zIndex: 1
    },
})

interface Props extends WithStyles<typeof styles> {
    message: IMessage,
    noOfMessages: number,
    isThread?: boolean,
    archiveMessage: (messageId: string) => void,
}

interface State {
    labels: ILabel[],
    mounted: boolean
}


class MessageHeader extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            labels: [],
            mounted: true
        }
    }

    archive(e: MouseEvent) {
        e.stopPropagation()
        this.setState({mounted: false},()=>{
            this.props.archiveMessage(this.props.message.id);
        })
    }

    render() {
        let { message, noOfMessages, isThread, classes } = this.props;
        let headers = headerMap(message.payload.headers)
        const subject = headers["Subject"];
        const from = headers["From"].replace(">", "").split("<");
        from[0] = from[0].replace(/"|\\/g, '');
        const read = !message.labelIds.includes("UNREAD");
        const ref = React.createRef<HTMLDivElement>();
        return (
            <CSSTransition
                in={this.state.mounted}
                unmountOnExit
                timeout={500}
                classNames={classes.root}
                nodeRef={ref}
            >
                <div ref={ref} className={classes.root + " message " + (isThread ? "threaded " : "") + (read ? "read" : "")}>
                    <Avatar>{from[0][0]}</Avatar>
                    <div className={classes.header}>
                        <div title={from[1]}><b>{from[0]}</b>{noOfMessages > 1 ? noOfMessages : ""}</div>
                        <div><b>Subject:</b> {subject}</div>
                        <div title={message.snippet} className="snippet">{message.snippet}</div>
                        <div style={{ display: "flex" }}>
                            {this.state.labels.length === 0 ? <Tag id="placeHolder" text={"..."}></Tag> : <></>}
                            {this.state.labels.map((label: ILabel) => <Tag key={label.id} id={label.id} text={translate(label.name)} textColor={label.color?.textColor} backgroundColor={label.color?.backgroundColor}></Tag>)}
                        </div>
                    </div>
                    <ArchiveIcon className={classes.archive} onClick={this.archive.bind(this)}></ArchiveIcon>
                </div>
            </CSSTransition>
        )
    }

    componentDidMount() {
        gmailInstance.getLabels(this.props.message.labelIds.filter(id => !['UNREAD', 'INBOX'].includes(id)), this.props.message.id, false)
            .then(labels => {
                this.setState({ labels });
            })
    }
}

export default withStyles(styles)(MessageHeader);

export function Tag(props: { textColor?: string, backgroundColor?: string, id: string, text: string }) {
    const classes = makeStyles({
        tagStyle: {
            color: props.textColor || 'black',
            background: props.backgroundColor || 'white',
            borderRadius: '0.25em',
            display: 'inline-block',
            alignSelf: "center",
            marginRight: '5px',
            padding: '0 5px',
        },
        iconStyle:
        {
            marginRight: '5px',
        },
        important: {
            color: "gold"
        }
    })();
    switch (props.id) {
        case 'CATEGORY_PERSONAL':
            return <ContactMailIcon className={classes.iconStyle} ></ContactMailIcon>
        case 'IMPORTANT':
            return <StarIcon className={classes.iconStyle + " " + classes.important}></StarIcon>
    }
    return <div className={classes.tagStyle} >{props.text}</div>
}