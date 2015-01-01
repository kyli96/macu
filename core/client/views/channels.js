var ChannelsCol = React.createClass({
    getInitialState: function() {
        var domainChannelCount = 0;
        if (this.props.domainChannelCount) {
            domainChannelCount = this.props.domainChannelCount;
        }
        return {domainChannelCount: domainChannelCount};
    },
    componentDidMount: function() {
        this.props.API.getDomainChannels(this.props.domain, true, function(data) {
            console.log(data);
            if (data && data.count) {
                this.setState({domainChannelCount: data.count});
                console.log('domainChannelCount='+data.count);
            }
        }.bind(this));
    },
    onNewDomainChannel: function(channel) {
        var domainChannelCount = this.state.domainChannelCount + 1;
        this.setState({domainChannelCount: domainChannelCount});
    },
    _onClickChannel: function(i) {
        var new_cid = this.props.channels[i]._id;
        if (new_cid == this.props.currentCid) {
            return;
        }
        if (!this.props.onCurrentCidChange) {
            return;
        }
        this.props.onCurrentCidChange(new_cid);
    },
    _onClickCreateChannel: function() {
        if (this.props.onClickCreateChannel) {
            this.props.onClickCreateChannel();
        }
    },
    render: function () {
        var createItem = function (channel, i) {
            var classname = 'channel';
            if (this.props.currentCid == channel._id) {
                classname += ' active';
            }
            return (
                <li className={classname} key={i}>
                    <a id={channel._id} onClick={this._onClickChannel.bind(this, i)} className="channel_name">#{channel.name}</a>
                </li>
            );
        }.bind(this);
        var joinChannel = function() {
            var more = this.state.domainChannelCount - this.props.channels.length;
            if (more > 0) {
                return (
                    <a className="join_channel list_more">+{more} more</a>
                    );
            }
            return '';
        }.bind(this);
        return (
            <div id="channels" className="section_holder">
              <h2 id="channels_header" className="hoverable">Channels</h2>
              <ul id="channels_list">
                {this.props.channels.map(createItem)}
                {joinChannel()}
                <a className="create_channel list_more" onClick={this._onClickCreateChannel}>Create Channel</a>
              </ul>
            </div>
        );
    }
});