﻿var React = require('react'),
    ChannelsCol = require('./channels'),
    MessageList = require('./messages');

var MessageClient = React.createClass({
    getInitialState: function() {
        this.msgs = [];
        this.channels = [];
        this.channel_ids = [];
        if (this.props.initState) {
            this.msgs = this.props.initState.msgs;
            this.channels = this.props.initState.channels;
            for(var i=0;i<this.channels.length;i++) {
                this.channel_ids.push(''+this.channels[i]._id);
            }
            return this.props.initState;
        }
        return {channels: [], currentCid: null, msgs: this.msgs};
    },
    componentDidMount: function() {
        this.props.getChannels(function (channels) {
            this.channels = channels;
            for(var i=0;i<this.channels.length;i++) {
                this.channel_ids.push(''+this.channels[i]._id);
            }
            var currentCid = this.state.currentCid;
            if (!currentCid && channels.length) {
                currentCid = channels[0]._id;
            }
            if (this.props.updateChannelHeader) {
                this.props.updateChannelHeader(this.channels[this.channel_ids.indexOf(currentCid)]);
            }
            this.props.getMsgs(currentCid, function (history) {
                this.msgs = history; // need to merge in case of race condition
                this.setState(
                    {channels: this.channels, currentCid: currentCid, msgs: this.msgs}, 
                    function() {
                        this.props.onRefreshChannels();
                        this.props.onRefreshMsgs();
                    }
                );
            }.bind(this));
        }.bind(this));
    },
    onNewMessage: function(msg) {
        if (msg.t_id == 'C'+this.state.currentCid) {
            this.msgs.push(msg);
            this.setState({msgs: this.msgs}, this.props.onRefreshMsgs);
        }
    },
    onCurrentCidChange: function(new_cid) {
        if (this.props.updateChannelHeader) {
            this.props.updateChannelHeader(this.channels[this.channel_ids.indexOf(new_cid)]);
        }
        this.props.getMsgs(new_cid, function(history) {
            this.msgs = history; 
            this.setState({currentCid: new_cid, msgs: this.msgs}, this.props.onRefreshMsgs);
        }.bind(this));
    },
    onNewChannel: function(channel) {
        this.channels.push(channel);
        this.channel_ids.push(''+channel._id);
        this.setState({channels: this.channels}, this.props.onRefreshChannels);
    },
    onRemoveChannel: function(channel) {
        var i = this.channel_ids.indexOf(''+channel._id);
        if (i != -1) {
            this.channels.splice(i, 1);
            this.channel_ids.splice(i, 1);
            this.setState({channels: this.channels}, this.props.onRefreshChannels);
        }
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
                    domain={this.props.user.domain}
                    API={this.props.API}
                />
              </div>
              <div id="messages_container">
                  <div id="messages_scroll_div">
                    <div id="message_filler"></div>
                    <div id="message_front"></div>
                    <MessageList msgs={this.state.msgs} />
                  </div>
              </div>
            </div>
        );
    }
});

module.exports = MessageClient;