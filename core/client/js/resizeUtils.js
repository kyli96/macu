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
            if (Scrollers.scrollPanes['search_results_scroll_div']) {
                Scrollers.scrollPanes['search_results_scroll_div'].update();
            }
        }).trigger('resize');
    },
    resizeCols: function () {
        $('#channels_col').height($(window).height() - $('#header').height());
        $('#side_pane').offset({ top: $('#header').height() });
        $('#side_pane_content').children('div').height($(window).height() - $('#side_pane').offset().top);
    },
    resizeMessageScrollDiv: function () {
        var scroll_div = $('#messages_scroll_div');
        var scroll_div_height = $(window).height() - $('#footer').height() - $('#header').height();
        scroll_div.height(scroll_div_height);
        scroll_div.width($(window).width() - $('#channels_col').width() - $('#side_pane').width());
        var side_pane_content = $('.side_pane_scroll_div');
        side_pane_content.height($(window).height() - side_pane_content.offset().top);
        side_pane_content.width($('#side_pane').width() - parseInt(side_pane_content.css('padding-left')) - parseInt(side_pane_content.css('padding-right')));
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