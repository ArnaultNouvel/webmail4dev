import React from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import * as actions from "../actions";
import * as moment from "moment";

import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';

import RecipientsRow from "../components/RecipientsRow";
import AttachmentChip from "../components/AttachmentChip";

class MailDetails extends React.Component {

    onDeleteClick() {

        this.props.actions.deleteMail(this.props.filename);

    }

    onAttachmentClick(attachment) {

        this.props.actions.getAttachment(this.props.filename, attachment.filename);

    }

    componentDidUpdate() {
        try {
            const iframe = this.refs.iframe;
            if (iframe) {
                const document = iframe.contentDocument;
                document.body.innerHTML = this.props.mail.html;
            }
        } catch (e) {
            console.error(e);
        }
    }

    render() {

        const { mail } = this.props;

        if (!mail) {
            return null;
        }

        return <div className="MailDetails">
            <Toolbar>
                <ToolbarGroup />
                <ToolbarGroup lastChild={true}>
                    <FlatButton label="Delete" primary={true} onClick={this.onDeleteClick.bind(this)} />
                </ToolbarGroup>
            </Toolbar>
            <div className="MailDetails-Header">
                <RecipientsRow label="From :" recipients={mail.from} />
                <RecipientsRow label="To :" recipients={mail.to} />
                <RecipientsRow label="Cc :" recipients={mail.cc} />
                <RecipientsRow label="Bcc :" recipients={mail.bcc} />
                <div className="MailDetails-HeaderRow">
                    <label>Date :</label>
                    <div>{moment(mail.date).calendar()}</div>
                </div>
                <div className="MailDetails-HeaderRow">
                    <label>Subject :</label>
                    <div>{mail.subject}</div>
                </div>
                <div className="MailDetails-HeaderRow">
                    <div className="MailDetails-Attachments">{
                        mail.attachments.filter(att => !att.related).map((att, idx) =>
                            <AttachmentChip key={idx} attachment={att} onClick={() => this.onAttachmentClick(att)} />)}
                    </div>
                </div>
            </div>
            <Divider />
            <div className="MailDetails-Content">
                <iframe className="mail-iframe" frameBorder="0" ref="iframe" title={mail.subject} >
                </iframe>
            </div>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => ({
    filename: state.currentMailFilename,
    mail: (state.mails && state.currentMailFilename) ?
        state.mails.find(m => m._id === state.currentMailFilename) :
        null,
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(actions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(MailDetails);
