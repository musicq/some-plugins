/**
 * 轻量级瀑布流组件
 *
 * created by musicq
 *
 * 说明：
 * 
 * 这个插件有个缺陷，就是在正常情况下，img 中的图片加载是不可控的
 * 而我们瀑布流的绝对定位是直接找到所有需要进行定位的单元进行绝对定位
 * 这样的话，我们的 img 不可能会全部都加载完成，这样就会造成一个问题
 * 即 瀑布流图片的定位会有重叠
 * 这个问题需要怎么解决呢？
 * 在一些以瀑布流为主要呈现方式的网站，例如堆糖，它的解决方式是在返回的数据中直接返回图片的宽和高
 * 这样我们就可以提前得到图片的宽高，用它来占位，加载起来就不会有各单元重叠的问题了
 * 问题又来了
 * 对于我们来说，并没有后端，当然也不可能去按个测量每一张图片的大小尺寸了，这样就得不到图片的宽和高了，那要怎么办呢？
 * 目前我的解决方式是，在每一次滑动的时候，会对当前的瀑布流进行一次重构
 * 即 重新计算所有单元的宽和高，对他们再进行新的定位
 * 这样就能解决图片重叠的问题了
 * 但是这还不行，因为每一次的 scroll 事件都会重新计算所有单元的位置，再重新排列，这样太消耗性能了，有的计算机会运行起来会很卡
 * 这就是问题了，目前我还没有很好的解决方式，我会在有时间时看看别人是怎样解决这个问题的，寻求更好地解决方法
 */
(function($){
  $.fn.lighterWoo = function(options){
    // 配置参数
    var defaults = {
      cols : 4 // 第一行有多少列
    };

    var _o = $.extend(defaults, options),
        $t = $(this); // 包裹瀑布流单元的盒子
    // 给当前的 `瀑布流包裹div` 加上 相对定位
    $t.css('position','relative');

    this.each(function(){
      init();
      reBuild();

      function init(){
        var _screenWidth = $(window).width(),
            _cols = 4; // 瀑布流的列数
        if( _screenWidth < 990 ){
          _cols = 2;
        }

        var cur_cols = _cols,
            $unit = $t.children('div'), // 每个单元
            hArr = [], // 储存每列的高度
            minH, //最小高度值
            index;

        for(var i=0; i < $unit.length; i++){
          if(i < cur_cols){
            // 把第一行元素的高度存入数组
            hArr.push($unit.eq(i).outerHeight(true));
            // 给第一行元素清除定位样式
            $unit.eq(i).css('position','static');
          }else{
            minH = Math.min.apply(null, hArr);
            index = minIndex(hArr, minH);
            var _left = $unit.eq(index).position().left;
            var _top = minH;

            $unit.eq(i).css({
              'position': 'absolute',
              'left': _left,
              'top': _top
            });

            var newH = $unit.eq(i).outerHeight(true);
            hArr[index] = hArr[index] + newH;

            maxH = Math.max.apply(null, hArr);
            $t.height(maxH);
          }
        }
      }

      // 得到最小高度索引
      function minIndex( arr, min ){
        for(var i in arr){
          if( arr[i] == min){
            return i;
          }
        }
      }

      // 重新排列
      var timer = null;
      function reBuild(){
        $(window).scroll(redraw);
        $(window).resize(redraw);
      }

      // 重绘瀑布流
      function redraw(){
        clearTimeout(timer);
        timer = setTimeout(function(){
          // 当滑动到底部时，停止重构
          if(($(document).height() - ($(document).scrollTop() + $(window).height())) / $(document).height() < 0.34){
            return false;
          }
          init();
        },100);
      }
    });
  }
})(jQuery);