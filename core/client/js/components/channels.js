var React = require('react');
var ChannelStore = require('../stores/ChannelStore');
var ChannelActionCreators = require('../actions/ChannelActionCreators');

function getStateFromStores() {
    return {
        channels: ChannelStore.getAsArray(),
        currentCid: ChannelStore.getCurrentID(),
        domainChannelCount: ChannelStore.getAvailableChannelCount()
    };
}

var ChannelsCol = React.createClass({
    getInitialState: function() {
        return getStateFromStores();
    },
    componentDidMount: function() {
        ChannelStore.addChangeListener(this._onChange);
    },
    onNewDomainChannel: function(channel) {
        var domainChannelCount = this.state.domainChannelCount + 1;
        this.setState({domainChannelCount: domainChannelCount});
    },
    _onChange: function() {
        this.setState(getStateFromStores());
    },
    _onClickChannel: function(new_cid) {
        if (new_cid == this.state.currentCid) {
            return;
        }
        ChannelActionCreators.changeChannel(new_cid);
    },
    _onClickCreateChannel: function() {
        ChannelActionCreators.clickCreateChannel();
    },
    _onClickMoreChannels: function () {
        ChannelActionCreators.clickMoreChannels();
    },
    render: function () {
        var createItem = function (channel) {
            var classname = 'channel';
            if (this.state.currentCid == channel._id) {
                classname += ' active';
            }
            return (
                <li className={classname} key={channel._id}>
                    <a id={channel._id} onClick={this._onClickChannel.bind(this, channel._id)} className="channel_name">#{channel.name}</a>
                </li>
            );
        }.bind(this);
        var joinChannel = function() {
            var more = this.state.domainChannelCount - this.state.channels.length;
            if (more > 0) {
                return (
                    <a className="join_channel list_more" onClick={this._onClickMoreChannels}>+{more} more</a>
                    );
            }
            return '';
        }.bind(this);
        return (
            <div id="channels" className="section_holder">
              <h2 id="channels_header" className="hoverable">Channels</h2>
              <ul id="channels_list">
                {this.state.channels.map(createItem)}
                {joinChannel()}
                <a className="create_channel list_more" onClick={this._onClickCreateChannel}>Create Channel</a>
              </ul>
            </div>
        );
    }
});

module.exports = ChannelsCol;