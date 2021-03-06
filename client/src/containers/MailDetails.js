import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as actions from "../actions";
import * as moment from "moment";

import Divider from "material-ui/Divider";
import FlatButton from "material-ui/FlatButton";
import { Toolbar, ToolbarGroup } from "material-ui/Toolbar";

import RecipientsRow from "../components/RecipientsRow";
import Loader from "../components/Loader";
import AttachmentChip from "../components/AttachmentChip";
import MailContent from "../components/MailContent"

import PropTypes from "prop-types";

class MailDetails extends React.Component {
  onDeleteClick() {
    this.props.actions.deleteOneMail(this.props.mailId);
  }

  onAttachmentClick(attachment) {
    this.props.actions.downloadAttachment(
      this.props.mailId,
      attachment.filename
    );
  }

  componentDidUpdate() {
    const { mailId, mail, actions } = this.props;

    if (mailId && mail && !mail.loaded && !mail.loading && !mail.error) {
      actions.fetchOneMail(mailId);
    } 
  }

  shouldComponentUpdate(nextProps, nextState) {
    try {
      // update if current mail changes
      if (this.props.mailId !== nextProps.mailId) {
        return true;
      }

      // update if new mails are received
      if (this.props.loading !== nextProps.loading) {
        return true;
      }

      return false;

    } catch (err) {
      console.error(err);
      return true;
    }
  }

  render() {
    const { mail, loading, actions } = this.props;

    if (loading) {
      return <Loader />;
    }

    if (!mail || !mail.loaded || mail.error) {
      return null;
    }

    try {
      if (!mail.read) {
        actions.readMail(mail._id);
      }

      return (
        <div className="MailDetails">
          <Toolbar>
            <ToolbarGroup />
            <ToolbarGroup lastChild={true}>
              <FlatButton
                label="Delete"
                primary={true}
                onClick={this.onDeleteClick.bind(this)}
              />
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
              <div className="MailDetails-Attachments">
                {mail.attachments
                  .filter(att => !att.related)
                  .map((att, idx) => (
                    <AttachmentChip
                      key={idx}
                      attachment={att}
                      onClick={() => this.onAttachmentClick(att)}
                    />
                  ))}
              </div>
            </div>
          </div>
          <Divider />
          <div className="MailDetails-Content">
            <MailContent html={mail.html} />
          </div>
        </div>
      );
    } catch (err) {
      console.error(err);
      return <div>error</div>;
    }
  }
}

MailDetails.propTypes = {
  mail: PropTypes.object,
  mailId: PropTypes.string,
  loading: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => ({
  mailId: state.ui.mailId,
  mail:
    state.mails && state.ui.mailId
      ? state.mails.find(m => m._id === state.ui.mailId)
      : null,
  loading:
    state.mails &&
    state.ui.mailId &&
    state.mails.find(m => m._id === state.ui.mailId && m.loading) != null
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(MailDetails);
