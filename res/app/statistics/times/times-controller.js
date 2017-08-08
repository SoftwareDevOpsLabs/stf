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
  var DAY_MS = 1000*60*60*24;
  var MONTH_MS = DAY_MS*30;
  var YEAR_MS = MONTH_MS*12;

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
    var drugable = false;
    // 根据tickType计算绘图的时间起点和终点，是否能够拖动等
    switch(tickType){
      case 0 :
        // 天视图，如果时间间隔大于24小时，则需要拖动显示数据
        var start_ms = new Date(start_time.setMinutes(0,0)).getTime()
        var end_ms = new Date(end_time.setMinutes(59,59)).getTime()
        if (end_ms-start_ms > DAY_MS){
          drugable = true;
          end_ms = start_ms + DAY_MS
        }
        niceType = d3.time.hours
        niceFormat = "%H:%M"
        break;
      case 1 :
        var start_ms = new Date(start_time.setHours(0,0,0,0))
        var end_ms = new Date(end_time.setHours(23,59,59,59))
        if (end_ms-start_ms > MONTH_MS){
          drugable = true;
          end_ms = start_ms + MONTH_MS
        }
        niceType = d3.time.day
        niceFormat = "%m-%d"
        break;
      case 2 :
        var start_ms = new Date(start_time.setDate(1))
        var end_ms = new Date(end_time.setDate(31))
        if (end_ms-start_ms > YEAR_MS){
          drugable = true;
          end_ms = start_ms + YEAR_MS
        }
        niceType = d3.time.month
        niceFormat = "%Y-%m"
        break;
    }

    var xScale = d3.time.scale()
      .domain([start_ms, end_ms])
      .range([0, w])

    var offset_x;
    var drag = d3.behavior.drag()
      .origin(function(d,i){
        var t = d3.select(this);
        return {
          x: t.attr("dx"),
          y: t.attr("dy")
        };
        console.log(t)

      }).on('dragstart',function(d){
        offset_x = 0

      }).on('dragend',function(d){
        // 拖拽完成之后坐标轴的变化，首先需要知道拖拽的位移
        console.log(offset_x)
        // 根据x轴的offset来对应时间的变化比例
        var offset_scale = Math.abs(offset_x)/w * DAY_MS;
        if (offset_x>0){
          var offset_start_ms = start_ms-offset_scale;
          var offset_end_ms = end_ms-offset_scale;
        }else{
          var offset_start_ms = start_ms+offset_scale;
          var offset_end_ms = end_ms+offset_scale;
        }
        console.log(offset_start_ms,offset_end_ms)
        xScale.domain([offset_start_ms, offset_end_ms])
        svg.select('.x.axis').call(xAxis);

      }).on('drag',function(d){
        d3.select(this).attr('transform','translate('+d3.event.x+',0)')
        offset_x = d3.event.x
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
      .outerTickSize(10);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(40, " + h + ")")
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

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    // 添加画布，用来绘制bar
    var panel = svg.append("g")
      .attr('class','panel')
      .attr('x',0)
      .attr('y',0)
      .attr('width',w)
      .attr('height',h)
      .call(drag);

    panel.selectAll(".bar")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function(d) {
        var time = new Date(d.time).getTime()+1000*60*60*8
        return xScale(new Date(time))+40-barWidth/2;
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
      .attr("fill", function(d,i) { return colors[i]; })
      .on('mouseover',function(){

      })
      .on('mouseout',function(){

      });

    // 添加拖拽的bar
    panel.append('rect')
      .attr("class", "slide")
      .attr("x", w)
      .attr("y", -15)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("width", 100)
      .attr("height", 10)
      .attr("fill","#dddddd")

    svg.append('text').attr('x',w+25).attr('y',h+20).text('时间轴')
    svg.append('text').attr('x',-20).attr('y',-15).text('单位(H)')
  }

  // 绘图core
  $scope.draw = function(config){
    /*--config 里面的参数内容--
    * panel 绘图的容器id
    * type  0 天视图， 1 月视图， 2年视图
    * start 查询起点时间
    * end   查询终点时间
    * scale 缩放比例
    */

    // 创建x轴比例尺，以时间刻度
    var xScale = d3.time.scale()
      .domain([
        config.start,
        config.end
      ])
      .range([0, w])

    // 清空画布
    d3.select('#'+config.panel).select('svg').remove()
    var margin = config.margin
    var svg = d3.select("#"+config.panel).append("svg")
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .ticks(niceType, 1)
      .tickFormat(d3.time.format(niceFormat))
      .outerTickSize(10);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(40, " + h + ")")
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

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    svg.selectAll(".bar")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function(d) {
        return xScale(new Date(d.time))+40-barWidth/2;
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
      .attr("fill", function(d,i) { return colors[i]; })
      .on('mouseover',function(){

      })
      .on('mouseout',function(){

      });


    svg.append('text').attr('x',w+25).attr('y',h+20).text('时间轴')
    svg.append('text').attr('x',-20).attr('y',-15).text('单位(H)')

  }
}
