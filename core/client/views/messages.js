var React = require('react');

var last_ts = null;

var Message = React.createClass( {
    render: function () {
        var showDayDivider = function(ts) {
            var show = false;
            var d = new Date(ts);
            if (!last_ts) {
                show = true;
            }
            else {
                var t = new Date(last_ts);
                if (t.toDateString() != d.toDateString()) {
                    show = true;
                }
            }
            last_ts = ts;
            var div_id = 'day_divider_'+ts;
            if (show) {
                return (
                    <div className="day_divider" id={div_id}>
                      <hr role="separator" aria-hidden="true" />
                      <div className="day_divider_label">{d.toDateString()}</div>
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
    render: function () {
        var renderMessage = function (message) {
            return <Message key={message.ts} msg={message} />;
        };
        return (
            <div id="msgs_div">{this.props.msgs.map(renderMessage)}</div>
        );
    }
});

module.exports = MessageList;