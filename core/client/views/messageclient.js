var React = require('react'),
    ChannelsCol = require('./channels'),
    MessageList = require('./messages');

var MessageClient = React.createClass({
    render: function() {
        return (
            <div className="row">
              <div id="channels_col">
                <ChannelsCol />
              </div>
              <div id="messages_container">
                  <div id="messages_scroll_div">
                    <div id="message_filler"></div>
                    <div id="message_front"></div>
                    <MessageList />
                  </div>
              </div>
            </div>
        );
    }
});

module.exports = MessageClient;