var M = {
    currentCid: null,
    user: null,
    messageClient: null,
    header: null
};
var API = {
    get: function(url, fn) {
        $.ajax({
            url: '/api' + url
        }).done(function (data) {
            fn(data);
        });
    },
    post: function(url, data, fn) {
        $.ajax({
            type: 'POST',
            url: '/api' + url,
            data: data
        }).done(function(r) {
            fn(r);
        });
    }
};
var Mf = {
    init: function () {
        Mf.socket = io();
        Mf.socket.on('profile', function (obj) {
            M.user = obj;
        })
        Mf.socket.on('sendMsg', Mf.onNewMessage);
        Mf.socket.on('newChannel', Mf.onNewChannel);
        
        $('form').submit(function () {
            var msg = $('#message-input').val();
            Mf.sendMsg('C' + M.messageClient.state.currentCid, msg);
            $('#message-input').val('');
            return false;
        });
    },
    renderHeader: function () {
        var header_props = {
            domain: { name: M.user.domain }
        };
        M.header = React.render(React.createElement(ChannelHeader, header_props), $('#header')[0]);
    },
    renderMessageClient: function () {
        var client_props = {
            // initState: {
            //     currentCid: M.currentCid,
            // }
            getChannels: Mf.getChannels,
            getMsgs: Mf.getMsgs,
            onRefreshMsgs: Mf.onRefreshMsgs,
            onClickCreateChannel: Mf.onClickCreateChannel,
            onRefreshChannels: Mf.onRefreshChannels,
            updateChannelHeader: Mf.updateChannelHeader
        };
        M.messageClient = React.render(React.createElement(MessageClient, client_props), 
            $('#client_body')[0]);
    },
    sendMsg: function (t_id, msg) {
        if (!t_id) {
            return;
        }
        var msg_obj = {
            t_id: t_id,
            user_id: M.user._id,
            username: M.user.username, 
            name: M.user.name, 
            msg: msg, 
            ts: Date.now()
        }
        Mf.socket.emit('sendMsg', msg_obj);
        M.messageClient.onNewMessage(msg_obj);
        return true;
    },
    onNewMessage: function (obj) {
        M.messageClient.onNewMessage(obj);
    },
    onNewChannel: function (channel) {
        if (channel.domain == M.user.domain) {
            M.messageClient.onNewChannel(channel);
        }
    },
    updateChannelHeader: function (channel) {
        M.currentCid = channel._id;
        M.header.updateChannel(channel);
    },
    onClickCreateChannel: function () {
        if ($('#create_channel_modal').length === 0) {
            $(document.body).append($('<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">')
                .attr('id', 'create_channel_modal'));
            var props = {
                onClickSave: Mf.createChannel
            };
            React.render(React.createElement(CreateChannel, props), $('#create_channel_modal')[0], function () {
                $('#create_channel_modal').modal();
            });
        }
        else {
            $('#create_channel_modal').modal();
        }
    },
    createChannel: function (channel) {
        channel.access = "public";
        channel.domain = M.user.domain;
        channel.owner = M.user._id;
        API.post('/channels', channel, function(data){
        });
        if ($('#create_channel_modal').length) {
            $('#create_channel_modal').modal('hide');
        }
    },
    getChannels: function (fn) {
        API.get('/user/'+M.user._id+'/channels', fn);
    },
    getMsgs: function (t_id, fn) {
        API.get('/channel/'+t_id+'/history', fn);
    },
    onRefreshChannels: function() {
        Wf.resizeChannelsCol();
    },
    onRefreshMsgs: function () {
        Wf.resizeMsgFiller();
        if (!Scrollers.scrollPanes['messages_scroll_div']) {
            Scrollers.init('messages_scroll_div');
        } else {
            Scrollers.scrollPanes['messages_scroll_div'].update();
        }
    }
}

var Wf = {
    init: function () {
        $(window).on('resize', function () {
            Wf.resizeChannelsCol();
            Wf.resizeMessageScrollDiv();
            Wf.resizeMsgFiller();
            if (Scrollers.scrollPanes['messages_scroll_div']) {
                Scrollers.scrollPanes['messages_scroll_div'].update();
            }
        }).trigger('resize');
    },
    resizeChannelsCol: function () {
        $('#channels_col').height($(window).height() - $('#header').height());
    },
    resizeMessageScrollDiv: function () {
        var scroll_div = $('#messages_scroll_div');
        var msgs_div = $('#msgs_div');
        var scroll_div_height = $(window).height() - $('#footer').height() - $('#header').height();
        scroll_div.height(scroll_div_height);
        scroll_div.width($(window).width() - $('#channels_col').width());
    },
    resizeMsgFiller: function () {
        var msgs_div = $('#msgs_div');
        var msgs_height = $('#message_front').height() + msgs_div.height() + parseInt(msgs_div.css('padding-top')) + parseInt(msgs_div.css('padding-bottom'));
        var scroll_div_height = $('#messages_scroll_div').height();
        var filler = scroll_div_height - msgs_height;
        if (filler > 0) {
            $('#message_filler').height(filler);
        }
        else {
            $('#message_filler').height(0);
        }
    }
}

var Scrollers = {
    init: function (id) {
        if (!id || !$('#' + id) || !$('#' + id).length) {
            console.log('cannot find content element with id ' + id);
            return;
        }
        Scrollers.scrollPanes[id] = new MacuScroller(id);
    }
}
Scrollers.scrollPanes = {};

// move to diff file
var MacuScroller = function (id){
    this.scroll_div = $('#' + id);
    this.content = this.scroll_div.children('div');
    this.init();
}
MacuScroller.prototype.init = function (){
    this.bar = $('<div class="scroll_bar"></div>')
    this.handle = $('<div class="scroll_handle"></div>')
    this.handle_inner = $('<div class="scroll_handle_inner"></div>')
    this.handle.append(this.handle_inner);
    this.bar.append(this.handle);
    var wrapper_id = 'scroll_wrapper_' + this.scroll_div.attr('id');
    this.scroll_div.wrap('<div class="scroll_hider"></div>');
    this.hider = this.scroll_div.parent();
    this.hider.wrap('<div id="' + wrapper_id + '"></div>');
    this.wrapper = $('#' + wrapper_id);
    this.wrapper.prepend(this.bar);
    this.hider = this.wrapper.find('.scroll_hider');
    this.handle_border = parseInt(this.handle_inner.css('borderTopWidth'));
    this.handle.css('left', 0 - this.handle_border);
    this.hider.css('margin-right', this.handle.width() + this.handle_border);
    this.stickBottom = true;
    this.update();
    this.scroll_div.scroll(this.updateHandlePosition.bind(this));
}
MacuScroller.prototype.update = function () {
    var content_height = 0;
    this.content.each(function () { content_height += $(this).height() + parseInt($(this).css('padding-top')) + parseInt($(this).css('padding-bottom')); })
    this.content_height = content_height;
    if (this.scroll_div.height() < content_height) {
        this.bar.height(this.scroll_div.height() - parseInt(this.bar.css('margin-top')) - parseInt(this.bar.css('margin-bottom')));
        this.handle.height(this.bar.height() * this.scroll_div.height() / content_height);
        this.hider.width(this.scroll_div.width() - this.handle.width() - this.handle_border);
        this.bar.css('margin-left', this.hider.width());
        if (this.stickBottom) {
            this.gotoBottom();
        }
        else {
            this.updateHandlePosition();
        }
        this.bar.show();
    }
    else {
        this.bar.hide();
    }
}
MacuScroller.prototype.updateHandlePosition = function () {
    var top = (this.scroll_div.scrollTop() * this.bar.height() / this.content_height);
    if (this.scroll_div.scrollTop() >= this.content_height - this.scroll_div.height() - 10) {
        this.stickBottom = true;
    }
    else {
        this.stickBottom = false;
    }
    this.handle.css('top', Math.max(0, top));
}
MacuScroller.prototype.gotoBottom = function () {
    this.scroll_div.scrollTop(this.content_height - this.scroll_div.height());
}