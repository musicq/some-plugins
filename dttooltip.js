/*
 * 类似于微博的那种卡片提示
 */

(function($){

  $.fn.dtTooltips = function( options ) {

    var _o = $.extend({}, $.fn.dtTooltips.DEFAULTS, options);

    return this.each(function(){
      // 调试
      function log( log ){
        console.log( log );
      }

      // 得到当前对象
      var $t = $(this);
      var TIMER = null; // 定时器 用来 remove 掉 tooltip

      // 初始化      
      init( $t );
      function init( context ) {
        triggers = _o.trigger.split(' ');

        for(var i=0; i < triggers.length; i++){
          var trigger = triggers[i];

          var enter = trigger == 'hover'? 'mouseenter' : 'focusin';
          var leave = trigger == 'hover'? 'mouseleave' : 'blur';

          // 鼠标进入
          context.on( enter, function(e){
            clearTimeout(TIMER);  // 清除定时器

            // 各种宽、高
            var $target = $(e.target),
                et_Height = $target.height(), // 当前元素高
                et_Width = $target.width(), // 当前元素宽
                et_ofLeft = $target.offset().left,  // 当前元素相对浏览器左侧位置
                et_ofTop = $target.offset().top,  // 当前元素相对浏览器顶部位置
                win_Width = $(window).width(),  // 浏览器窗口宽度
                win_Height = $(window).height(),  // 浏览器窗口高度
                doc_Height = $(document).height(),  // 文档高度
                doc_ScrollTop = $(document).scrollTop(),  // 文档滑动距离
                et_dis_top = et_ofTop - doc_ScrollTop,  // 当前元素距当前浏览器窗口上部距离
                et_dis_bottom = win_Height - et_dis_top,  // 当前元素距当前浏览器窗口下部距离
                et_dis_right = win_Width - et_ofLeft - et_Width, // 当前元素距当前浏览器窗口右侧距离
                arr_direction = et_dis_top - et_dis_bottom, // 箭头位置
                html = _o.html; // 生成内容
            // 当前元素的位置信息
            var etPos = {
              _H: et_Height,
              _W: et_Width,
              _L: et_ofLeft,
              _T: et_ofTop,
              _WinW: win_Width,
              _WinH: win_Height
            };
            // 判断 tooltip 出现的方向
            var arr_dir = ( et_dis_top < 300 && et_dis_bottom < 300) ? 
                          ( et_ofLeft > et_dis_right ) ? 'left' : 'right' :   // 左右
                          ( arr_direction > 0 ) ? 'top' : 'bottom';           // 上下
            // 生成 tooltip
            generateTips( arr_dir, etPos, html );
          });
          
          // 鼠标移出
          context.on( leave, function(e){
            // 移除tooltip
            removeTips();
          });   
        }
      }

      // 生成tooltip
      function generateTips( arr_dir, etPos, html ) {
        var $tipWrapper = $('<div class="dttooltip" ><div class="dttooletip-innerbox">'+html+'</div></div>'); // 创建tips外层包裹体
        var $arrow = $('<div><i class="arr front-arr"></i><em class="arr back-arr"></em></div>'); // 创建箭头

        var _top,_left; // tooltip 的位置

        // 宽、高
        $tipWrapper.width(_o.width);
        $tipWrapper.find('.dttooletip-innerbox').height(_o.height);

        // 加入文档
        $arrow.appendTo($tipWrapper);
        $tipWrapper.appendTo($('body'));
        $tipWrapper.css('opacity','0'); // 隐藏得到宽、高

        var tipWrapper_Height = $tipWrapper.height(),
            tipWrapper_Width = $tipWrapper.width();
        $tipWrapper.hide(); // 得到宽高后，隐藏掉， 使其不影响页面

        // tooltip 出现方向
        switch (arr_dir){
          case 'top':
            _top = etPos._T - tipWrapper_Height + 10;
            _left = etPos._L - tipWrapper_Width/4;
            
            a_left = (etPos._L + etPos._W/2) - _left - 10;

            $arrow.addClass('b-arr');

            $tipWrapper.css({
              'top': _top,
              'left': _left
            });
            $arrow.css('left', a_left+'px');
          break;

          case 'bottom':
            _top = etPos._T + etPos._H + 10;
            _left = etPos._L - tipWrapper_Width/4;

            a_left = (etPos._L + etPos._W/2) - _left - 10;

            $arrow.addClass('t-arr');

            $tipWrapper.css({
              'top': _top,
              'left': _left
            });
            $arrow.css('left', a_left+'px');
          break;

          case 'right':
            _top = etPos._T - tipWrapper_Height/2;
            _left = etPos._L + etPos._W + 10;

            a_left = (etPos._T + etPos._H/2) - _top - 12;

            $arrow.addClass('l-arr');

            $tipWrapper.css({
              'top': _top,
              'left': _left
            });
            $arrow.css('top', a_left+'px');

          break;

          case 'left':
            _top = etPos._T - tipWrapper_Height/2;
            _left = etPos._L - tipWrapper_Width - 10;

            a_left = (etPos._T + etPos._H/2) - _top - 12;

            $arrow.addClass('r-arr');

            $tipWrapper.css({
              'top': _top,
              'left': _left
            });
            $arrow.css('top', a_left+'px');

          break;         
        }

        // tooltip 出现
        $tipWrapper.delay(_o.delay).css('opacity','1').fadeIn(_o.animateSpeed);

        // 防止鼠标离开目标后 tooltip 消失
        $tipWrapper.hover(
          function(){ // 鼠标移入，清除定时器
            clearTimeout(TIMER);
          },
          function(){ // 鼠标移出，开启定时器
            removeTips();
          }
        );
      }

      // 移除tooltip
      function removeTips(){
        var $dttooltip = $('.dttooltip');
        // 清除动画列队
        $dttooltip.stop(true, true);
        // 若有多个 tooltip 的话，保存最新的tooltip
        if($dttooltip.length > 1){
          for(var i=0;i<$dttooltip.length-1;i++){
            $dttooltip.eq(i).remove();
          }
        }
        // 移除tooltip
        TIMER = setTimeout(function(){
          $dttooltip.fadeOut(_o.animateSpeed,function(){
            $dttooltip.remove();
          })
        },_o.delay);
      }

    }); 
  }

  // 默认配置
  $.fn.dtTooltips.DEFAULTS = {            
    trigger: 'hover',                     // 触发事件 /* 其他事件会按照foucs来处理 */
    html: '',                             // 弹框内容
    width: '400px',                       // 弹框宽度
    height: 'auto',                           // 弹框高度
    delay: 500,                           // 弹框延迟时间
    animateSpeed: 200                     // tooltip动画时间
  }

})(jQuery);