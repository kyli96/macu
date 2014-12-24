var MessageClient = React.createClass({
    getInitialState: function() {
        this.msgs = [];
        if (this.props.initState) {
            this.msgs = this.props.initState.msgs;
            return this.props.initState;
        }
        return {channels: [], currentCid: null, msgs: this.msgs};
    },
    componentDidMount: function() {
        this.props.getChannels(function (channels) {
            var currentCid = this.state.currentCid;
            if (!currentCid) {
                currentCid = channels[0]._id;
            }
            this.props.getMsgs(currentCid, function (history) {
                this.msgs = history; // need to merge in case of race condition
                this.setState(
                    {channels: channels, currentCid: currentCid, msgs: this.msgs}, 
                    this.props.onRefreshMsgs
                );
            }.bind(this));
        }.bind(this));
    },
    onNewMessage: function(msg) {
        if (msg.t_id == this.state.currentCid) {
            this.msgs.push(msg);
            this.setState({msgs: this.msgs}, this.props.onRefreshMsgs);
        }
    },
    onCurrentCidChange: function(new_cid) {
        this.props.getMsgs(new_cid, function(history) {
            this.msgs = history; 
            this.setState({currentCid: new_cid, msgs: this.msgs}, this.props.onRefreshMsgs);
        }.bind(this));
    },
    render: function() {
        return (
            <div className="row">
              <div id="channels_col">
                <ChannelsCol 
                    channels={this.state.channels} 
                    currentCid={this.state.currentCid}
                    onCurrentCidChange={this.onCurrentCidChange}
                    onClickCreateChannel={this.props.onClickCreateChannel}
                />
              </div>
              <div id="messages_container">
                <div id="message_front"></div>
                <MessageList msgs={this.state.msgs} />
              </div>
            </div>
        );
    }
});