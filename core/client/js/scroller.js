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
    console.log(this.scroll_div.attr('id'));
    console.log(this.scroll_div.height());
    console.log(content_height);
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

module.exports = Scrollers;
module.exports.MacuScroller = MacuScroller;