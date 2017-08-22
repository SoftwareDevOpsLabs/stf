require('d3');
module.exports = function UserStatCtrl(
  $scope,
  DeviceService,
  ControlService,
  socket,
  $http,
  $filter
) {
  $scope.tracker = DeviceService.trackAll($scope)
  $scope.control = ControlService.create($scope.tracker.devices, '*ALL')

  $scope.devices = [];

  $scope.types = ['日','月','年'];
  $scope.tickTypes = ['hours','day','month'];

  $scope.active_type_index = 0;

  // @chenhao 从前端存储中过去用户之前设置的参数
  var cached_params = sessionStorage.getItem('STAT_USER_PARAMS');
  var start_time = (new Date(new Date().setHours(0,0,0,0))).getTime();
  var end_time = new Date().getTime();
  if (cached_params){
    var data = JSON.parse(cached_params);
    start_time = data['start_time'];
    end_time = data['end_time'];
  }

  $scope.start_time = new Date(start_time);
  $scope.end_time = new Date(end_time);
  $scope.format = "yyyy/MM/dd";
  $scope.altInputFormats = ['yyyy/M!/d!'];
  $scope.options = {
    showWeeks: false
  };

  $scope.getStatData = function(params){
    //@chenhao 缓存每次请求的参数
    sessionStorage.setItem('STAT_USER_PARAMS', JSON.stringify(params));
    $http({
      method:'post',
      url:'/api/v1/overview/',
      data: params
    }).success(function(response){
      var stats = response['stats']
      var panel = 'bar_chart_user'
      $scope.drawBarChart(stats,panel)
    })
  };

  var default_params = {
    'start_time': start_time,
    'end_time': end_time,
    'type': $scope.types[$scope.active_type_index]
  }
  // 获取默认的数据
  $scope.getStatData(default_params)

  // 切换维度type的显示
  $scope.showActiveType = function (obj) {
    var type_index = obj.$index
    $scope.active_type_index = type_index
    $scope.submitQuery()
  }

  // 根据条件查询统计图的信息
  $scope.submitQuery = function(){
    // 检查开始时间和结束时间的输入
    var start_time = $scope.start_time
    var end_time = $scope.end_time

    // 检查开始时间和结束时间
    if (start_time>end_time){
      alert('开始时间不能大于结束时间')
      return
    }

    var params = {
      'start_time': (new Date(start_time.setHours(0,0,0,0))).getTime(),
      'end_time': (new Date(end_time.setHours(23,59,59,59))).getTime(),
      'type': $scope.types[$scope.active_type_index]
    }

    // 获取统计图的数据
    $scope.getStatData(params)
  };

  $scope.popup1 = {
    opened: false
  };
  $scope.open1 = function () {
    $scope.popup1.opened = true;
  };

  $scope.popup2 = {
    opened: false
  };
  $scope.open2 = function () {
    $scope.popup2.opened = true;
  };

  // 定义默认颜色
  var colors = d3.range(100).map(d3.scale.category20())

  // 定义时间常量
  var HOUR_MS = 1000*60*60;
  var DAY_MS = HOUR_MS*24;
  var MONTH_MS = DAY_MS*30;
  var YEAR_MS = MONTH_MS*12;

  // 定义时间取整和格式转化的函数,将时间字符串转化成为对应的整月，整日，整小时
  $scope.timeScaleAdapter = function (str) {
    var tick_type = $scope.active_type_index;
    // 格式化字符串得到一个时间对应，转化为本地时间

    var local_time = new Date(str).getTime()+1000*60*60*8;
    var time_scale;
    switch(tick_type){
      case 0 :
          time_scale = new Date(local_time).setMinutes(0,0);
          break;
      case 1:
          time_scale = new Date(local_time).setHours(0,0,0,0);
          break;
      case 2:
          time_scale = new Date(local_time).setDate(1);
          break;
    }
    return time_scale;
  }

  $scope.drawBarChart = function(dataset,panel){
    // 定义图表的间距
    var margin = {top: 30, right: 100, bottom: 30, left: 100};
    var w = 1200 - margin.left - margin.right;
    var h = 550 - margin.top - margin.bottom;

    var start_time = $scope.start_time;  // 边界起始时间
    var end_time = $scope.end_time;      // 边界结束时间

    var tickType = $scope.active_type_index;
    // 计算处理时间相关的数据

    var niceType;
    var niceFormat;
    var niceUnit;
    var dragable = false;
    var slider_width = 0;
    // 根据tickType计算绘图的时间起点和终点，是否能够拖动等
    switch(tickType){
      case 0 :
        // 天视图，如果时间间隔大于24小时，则需要拖动显示数据
        var start_ms = new Date(start_time.setMinutes(0,0)).getTime()-HOUR_MS  // 向前一小时
        var end_ms = new Date(end_time.setMinutes(59,59)).getTime()
        if (end_ms-start_ms > DAY_MS){
          slider_width = w/(end_ms-start_ms)*DAY_MS
          dragable = true;
          end_ms = start_ms + DAY_MS
        }
        niceType = d3.time.hours
        niceFormat = "%H:%M"
        niceUnit = DAY_MS
        break;
      case 1 :
        var start_ms = new Date(start_time.setHours(0,0,0,0)).getTime()-DAY_MS //向前一天
        var end_ms = new Date(end_time.setHours(23,59,59,59)).getTime()
        if (end_ms-start_ms > MONTH_MS){
          slider_width = w/(end_ms-start_ms)*MONTH_MS
          dragable = true;
          end_ms = start_ms + MONTH_MS
        }
        niceType = d3.time.day
        niceFormat = "%m-%d"
        niceUnit = MONTH_MS
        break;
      case 2 :
        var start_ms = new Date(start_time.setDate(1)).getTime()- MONTH_MS  // 向前一个月
        var end_ms = new Date(end_time.setDate(31)).getTime()
        if (end_ms-start_ms > YEAR_MS){
          slider_width = w/(end_ms-start_ms)*YEAR_MS
          dragable = true;
          end_ms = start_ms + YEAR_MS
        }
        niceType = d3.time.month
        niceFormat = "%Y-%m"
        niceUnit = YEAR_MS
        break;
    }

    $scope.start_ms = start_ms
    $scope.end_ms = end_ms

    var xScale = d3.time.scale()
      .domain([start_ms, end_ms])
      .range([0, w])

    var offset_x;
    var latest_offset_x = 0;
    var drag = d3.behavior.drag()
      .origin(function(d,i){
        var t = d3.select(this);
        return {
          x: t.attr("dx"),
          y: t.attr("dy")
        };
        console.log(t)

      }).on('dragstart',function(d){

      }).on('dragend',function(d){
        // 拖拽完成之后坐标轴的变化，首先需要知道拖拽的位移
        console.log(offset_x)
        latest_offset_x = offset_x
        // 根据x轴的offset来对应时间的变化比例
        if (!dragable){
          return
        }
        var offset_scale = Math.abs(offset_x)/w * niceUnit;
        if (offset_x>0){
          var offset_start_ms = start_ms-offset_scale;
          var offset_end_ms = end_ms-offset_scale;
        }else{
          var offset_start_ms = start_ms+offset_scale;
          var offset_end_ms = end_ms+offset_scale;
        }
        console.log(offset_start_ms,offset_end_ms)
        $scope.start_ms = offset_start_ms
        $scope.end_ms = offset_end_ms
        $scope.$apply()

        xScale.domain([offset_start_ms, offset_end_ms])
        svg.select('.x.axis').call(xAxis);

        // 改变画布背景的位置
        svg.select('.slide').attr('x',-offset_x+40)

        // 隐藏不在可是区域的bar
        svg.selectAll('.bar')
          .attr('fill',function(d,i){
            var time_scale = $scope.timeScaleAdapter(d.time);
            if (xScale(new Date(time_scale))<barWidth/2 || xScale(new Date(time_scale)) > w-barWidth/2){
              return '#ffffff'
            }else{
              return colors[i];
            }
          })

        svg.selectAll('.bar-text')
          .attr('fill',function(d,i){
            var time_scale = $scope.timeScaleAdapter(d.time);
            if (xScale(new Date(time_scale))<barWidth/2 || xScale(new Date(time_scale)) > w-barWidth/2){
              return '#ffffff'
            }else{
              return colors[i];
            }
          })

      }).on('drag',function(d){
        console.log('最近一次距离',latest_offset_x)
        var all_offset = latest_offset_x+d3.event.x
        if (dragable){
          d3.select(this).attr('transform','translate('+all_offset+',0)')
          offset_x = all_offset
        }
      })

    d3.select('#'+panel).select('svg').remove()
    var svg = d3.select("#"+panel).append("svg")
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")

    var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .ticks(niceType, 1)
      .tickFormat(d3.time.format(niceFormat))
      //.outerTickSize(10);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, " + h + ")")
      .call(xAxis);

    var tickSize = d3.selectAll('g.tick text')[0]
    var barWidth = Math.min(w/tickSize.length,40)
    var barPadding = 6

    // 定义x轴和y轴
    var yScale = d3.scale.linear()
      .range([0,h])
      .domain([d3.max(dataset, function(d) {
        return d.long;
      }),0]);

    var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")

    // 添加画布，用来绘制bar
    var panel = svg.append("g")
      .attr('class','panel')
      .attr('x',0)
      .attr('y',0)
      .attr('width',w)
      .attr('height',h)
      .call(drag);

    // 添加拖拽的bar
    panel.append('rect')
      .attr("class", "slide")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", w)
      .attr("height", h)
      .attr("fill","#ffffff")

    panel.selectAll(".bar")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function(d) {
        var time_scale = $scope.timeScaleAdapter(d.time);
        return xScale(time_scale)-barWidth/2;
      })
      .attr("width", function(d) {
        return barWidth-barPadding;
      })
      .attr("y", function(d,i) {
        return  yScale(d.long)
      })
      .attr("height", function(d,i){
        return h-yScale(d.long)
      })
      .attr("fill", function(d,i) {
        return colors[i];
      })

    panel.selectAll('.bar-text')
      .data(dataset)
      .enter()
      .append('text')
      .attr('class','bar-text')
      .text(function(d){return d.long.toFixed(2)})
      .attr("x", function(d) {
        var time_scale = $scope.timeScaleAdapter(d.time);
        return xScale(time_scale)-barWidth/2;
      })
      .attr("y", function(d,i) {
        return  yScale(d.long)-5
      })

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    svg.append('text').attr('x',w+20).attr('y',h+8).text('时间轴')
    svg.append('text').attr('x',-20).attr('y',-15).text('单位(H)')
  }
}
