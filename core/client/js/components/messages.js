var React = require('react');
var MessageStore = require('../stores/MessageStore');
var resizeUtils = require('../resizeUtils');
var Scrollers = require('../scroller');

function getStateFromStores() {
    return {
        msgs: MessageStore.getCurrentChannelMessages()
    };
}

var last_ts = null;

var Message = React.createClass( {
    render: function () {
        var showDayDivider = function (ts) {
            if (!this.props.showDayDivider) {
                return '';
            }
            var show = '';
            var d = new Date(ts);
            var td = new Date();
            if (!last_ts) {
                show = (d.getDate() == td.getDate()) ? 'Today' : d.toDateString();
            }
            else {
                var t = new Date(last_ts);
                if (t.toDateString() != d.toDateString()) {
                    show = (d.getDate() == td.getDate()) ? 'Today' : d.toDateString();
                }
            }
            last_ts = ts;
            var div_id = 'day_divider_'+ts;
            if (show) {
                return (
                    <div className="day_divider" id={div_id}>
                      <hr role="separator" aria-hidden="true" />
                      <div className="day_divider_label">{show}</div>
                    </div>
                );
            }
        }.bind(this);
        var displayTime = function(ts) {
            var d = new Date(ts);
            var addZero = function (i) {
                if (i < 10) {
                    i = '0' + i;
                }
                return i;
            }
            if (d.getHours()>12) {
                return (d.getHours()-12)+':'+addZero(d.getMinutes())+'PM';
            }
            else {
                return d.getHours()+':'+addZero(d.getMinutes())+'AM';
            }
        }
        return (
            <div>
            {showDayDivider(this.props.msg.ts)}
            <div className="message">
              <a className="message_sender">{this.props.msg.name}</a>
              <a className="timestamp">{displayTime(this.props.msg.ts)}</a>
              <span className="message_content">{this.props.msg.msg}</span>
            </div>
            </div>
        );
    }
});

var MessageList = React.createClass({
    getInitialState: function() {
        return getStateFromStores();
    },
    componentDidMount: function() {
        MessageStore.addChangeListener(this._onChange);
    },
    _onChange: function() {
        this.setState(getStateFromStores(), function() {
            resizeUtils.resizeMsgFiller();
            if (!Scrollers.scrollPanes['messages_scroll_div']) {
                Scrollers.init('messages_scroll_div');
            } else {
                Scrollers.scrollPanes['messages_scroll_div'].update();
            }
        });
    },
    render: function () {
        var renderMessage = function (message) {
            return <Message key={message.ts} msg={message} showDayDivider={true} />;
        };
        return (
            <div id="msgs_div">{this.state.msgs.map(renderMessage)}</div>
        );
    }
});

module.exports = MessageList;
module.exports.Message = Message;