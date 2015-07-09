var React = require('react'),
    ChannelsCol = require('./channels.jsx'),
    MessageList = require('./messages.jsx');

var MessageClient = React.createClass({
    render: function () {
        return (
            <div className="row">
              <div id="channels_col">
                <ChannelsCol locales={this.props.locales} messages={this.props.messages} />
              </div>
              <div id="messages_container">
                  <div id="messages_scroll_div">
                    <div id="message_filler"></div>
                    <div id="message_front"></div>
                    <MessageList locales={this.props.locales} messages={this.props.messages} />
                  </div>
              </div>
            </div>
        );
    }
});

module.exports = MessageClient;