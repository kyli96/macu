var Scrollers = require('./scroller');

var Wf = {
    init: function () {
        $(window).on('resize', function () {
            Wf.resizeCols();
            Wf.resizeMessageScrollDiv();
            Wf.resizeMsgFiller();
            if (Scrollers.scrollPanes['messages_scroll_div']) {
                Scrollers.scrollPanes['messages_scroll_div'].update();
            }
        }).trigger('resize');
    },
    resizeCols: function () {
        $('#channels_col').height($(window).height() - $('#header').height());
        $('#side_pane').height($(window).height() - $('#header').height());
        $('#side_pane').offset({ top: $('#header').height() });
    },
    resizeMessageScrollDiv: function () {
        var scroll_div = $('#messages_scroll_div');
        var scroll_div_height = $(window).height() - $('#footer').height() - $('#header').height();
        scroll_div.height(scroll_div_height);
        scroll_div.width($(window).width() - $('#channels_col').width() - $('#side_pane').width());
        $('#search_results_scroll_div').height($('#side_pane').height());
        $('#search_results_scroll_div').width($('#side_pane').width());
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

module.exports = Wf