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
        var showDayDivider = function(ts) {
            var show = '';
            var d = new Date(ts);
            if (!last_ts) {
                show = d.toDateString();
            }
            else {
                var t = new Date(last_ts);
                if (t.toDateString() != d.toDateString()) {
                    show = d.toDateString();
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
        }
        var displayTime = function(ts) {
            var d = new Date(ts);
            if (d.getHours()>12) {
                return (d.getHours()-12)+':'+d.getMinutes()+'PM';
            }
            else {
                return d.getHours()+':'+d.getMinutes()+'AM';
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
            return <Message key={message.ts} msg={message} />;
        };
        return (
            <div id="msgs_div">{this.state.msgs.map(renderMessage)}</div>
        );
    }
});

module.exports = MessageList;