var Message = React.createClass( {
    render: function () {
        return <li><strong>{this.props.msg.name}</strong>: {this.props.msg.msg}</li>;
    }
});

var MessageList = React.createClass({
    render: function () {
        var renderMessage = function (message) {
            return <Message key={message.ts} msg={message} />;
        };
        return (
            <ul id="messages">{this.props.msgs.map(renderMessage)}</ul>
        );
    }
});