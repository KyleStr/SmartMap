function initScrollable() {

  var $scrollers = $('[data-scrollable]');
  
  $scrollers.once('scrollable').each(function() {
    $this = $(this);
    $this.addClass('scrollable-shadow')
      .wrapInner('<div class="scrollable-inner">');
   
    $this.find('.scrollable-inner')
      .perfectScrollbar({suppressScrollX: true})
      .scroll(function(e) {
        checkShadow.call(this);
      });

    checkShadow.call(this);
  });

  function checkShadow() {
    $this = $(this);
    $scrollableShadow = $this.parent(); 
    $scrollableShadow.addClass('shadow-top shadow-bottom');

    if ($this.scrollTop() === 0) {
      $scrollableShadow.removeClass('shadow-top');
    } 
    if ($this.scrollTop() === $this.prop('scrollHeight') - $this.height()) {
      $scrollableShadow.removeClass('shadow-bottom');
    }
  }
  
}

$(function() {
  initScrollable();
});
