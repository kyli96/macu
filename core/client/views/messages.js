var Message = React.createClass( {
    render: function () {
        return (
            <div className="message">
              <a className="message_sender">{this.props.msg.name}</a>
              <span className="message_content">{this.props.msg.msg}</span>
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