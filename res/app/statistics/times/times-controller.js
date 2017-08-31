require('d3');
module.exports = function UserStatCtrl(
  $scope,
  DeviceService,
  ControlService,
  socket,
  $http,
  $filter,
  $timeout
) {
  $scope.tracker = DeviceService.trackAll($scope)
  $scope.control = ControlService.create($scope.tracker.devices, '*ALL')

  $scope.devices = [];

  $scope.types = ['日','月','年'];
  $scope.tickTypes = ['hours','day','month'];

  $scope.active_type_index = 0;

  var w = 1000;
  var h = 400;
  var padding = 40;
  var x_conf;
  var start_time;
  var min_time;
  var max_time;
  var datasets = [];
  // 时间常量
  var HOUR_MS = 1000*60*60;
  var DAY_MS = HOUR_MS*24;
  var MONTH_MS = DAY_MS*30;
  var YEAR_MS = MONTH_MS*12;

  // 刻度类型，数据源，最大最小时间 三个变量都会发生变化的时候
  var DATA_TYPES = {
    '0' : {'type': d3.time.hours, 'format': '%H:%M','range': DAY_MS},
    '1' : {'type': d3.time.day, 'format': '%m-%d', 'range': MONTH_MS},
    '2' : {'type': d3.time.month, 'format': '%Y-%m', 'range' : YEAR_MS}
  };

  x_conf = DATA_TYPES[$scope.active_type_index];

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



  var colors = d3.range(100).map(d3.scale.category20());

  // 通过开始时间和x_conf获取结束时间
  function getEndTime(start){
    if (typeof(start)=='number'){
      var end = new Date(start+x_conf['range']);

    }else{
      var end = new Date(start.getTime()+x_conf['range']);
    }
    return end;
  }
  // 获取结束时间
  function getStartTime(end){
    if (typeof(end)=='number'){
      var start = new Date(end-x_conf['range']);
    }else{
      var start = new Date(end.getTime()-x_conf['range']);
    }
    return start;
  }


  // 创建画布
  var svg = d3.select('#timeline')
    .append('svg')
    .attr('width', w + 2*padding)
    .attr('height', h + 2*padding);

  // 创建x轴比例尺,以时间为刻度
  var xScale = d3.time.scale()
    .domain([start_time, getEndTime(start_time)])
    .range([0,w]);

  // 创建y轴比例尺，线性的刻度
  var yScale = d3.scale.linear()
    .domain([0,d3.max(datasets,function(d){return d.long})])
    .range([h,0]);

  // 创建x轴坐标
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom')
    .ticks(d3.time.day, 1)
    .tickSize(10)
    .tickFormat(d3.time.format('%m-%d'));

  // 创建y轴坐标
  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient('left');

  // 绘制x轴
  svg.append('g')
    .attr('class','x axis')
    .attr('transform','translate('+padding+','+(h+padding)+')')
    .call(xAxis);

  // 绘制y轴
  svg.append('g')
    .attr('class','y axis')
    .attr('transform','translate('+padding+','+padding+')')
    .call(yAxis);

  var barWidth = 30;

  var all_offset = 0;   // 总体位移
  var single_offset = 0;  // 单次位移

  // 计算当前的偏移总值有没有越界(通过输入偏移量，返回本屏开始和结束的时间)
  function getTimeRange(){
    var range = max_time.getTime() - min_time.getTime();
    var pre_range = x_conf['range'];
    var max_offset = range/pre_range*w-w;

    var range_length = range/w;
    var timestamp = parseFloat(all_offset)*range_length;

    console.log('最大距离',max_offset)
    console.log('目前偏移',all_offset)

    var start;
    var end;
    if (all_offset<-max_offset){
      end = max_time.getTime()
      start = getStartTime(new Date(end)).getTime()
    }else if(all_offset>max_offset){
      start = min_time.getTime()
      end = getEndTime(new Date(start)).getTime()
    }else{
      start = min_time.getTime()-parseFloat(timestamp);
      end = getEndTime(min_time).getTime()-parseFloat(timestamp);
    }

    // 监测时间的边界
    var range = {
      'start' : parseInt(start),
      'end' : parseInt(end),
      'min' : -max_offset,
      'max' : max_offset
    };
    return range;
  }

  // 定义拖拽函数
  var drag = d3.behavior.drag()
    .origin(function(d){
      var t = d3.select(this);
      return {
        x: t.attr("x"),
        y: t.attr("y")
      };
    })
    .on('dragstart',function(){
      single_offset = 0;
    })
    .on('dragend',function(){
      // 按照时间的总长度和x轴的长度，求出每单位时间的长度
      all_offset = all_offset + single_offset;
      var range = getTimeRange();
      console.log(range);
      // 更新图表
      $scope.updateTimeLine(new Date(range['start']),new Date(range['end']));
    })
    .on('drag',function(){
      // 被拖动的对象移动
      console.log('正在拖动',d3.event.x)
      d3.select(this).attr('x',d3.event.x);
      d3.select(this).attr('y',0);
      single_offset = parseFloat(d3.event.x);
      d3.select('.panel').attr('transform','translate('+(parseFloat(d3.event.x))+',0)')

      // 判断所有bar的坐标，是不是大于移动的距离
      d3.selectAll('.group').attr('fill-opacity',function(d,i){
        var point_x = d3.select(this).select('.bar').attr('x');
        if (parseFloat(point_x)<Math.abs(single_offset-padding) || parseFloat(point_x)+Math.abs(single_offset)>w){
          return 0;
        }else{
          return 1;
        }
      })
    });

  // 绘制panel
  var panel = svg.append('g')
    .attr('width',w)
    .attr('height',h)
    .attr('class','panel');

  // 添加裁剪路径
  svg.append('defs')
    .append('clipPath')
    .attr('id', 'chart-content')
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', h)
    .attr('width', w)

  // 添加数据组
  var groups = panel.selectAll('.group')
    .data(datasets)
    .enter()
    .append('g')
    .attr('class','group');

  // 添加bar的信息
  groups.append('rect')
    .attr('class','bar')
    .attr('x',function(d,i){
      var local_date = new Date(d.time);
      return xScale(local_date)+padding-barWidth/2;
    })
    .attr('y',function(d){
      return yScale(d.long)+padding;
    })
    .attr('width', function(d,i){
      return barWidth;
    })
    .attr('height', function(d){
      return h-yScale(d.long)
    })
    .attr('fill',function(d,i){
      return colors[0];
    })
    .on('mouseover', function(d){
      var point_x = parseFloat(d3.select(this).attr('x'));
      var point_y = parseFloat(d3.select(this).attr('y'));
      svg.append('line')
        .attr('id','horizontal-line')
        .attr('x1',padding)
        .attr('x2',point_x)
        .attr('y1',point_y)
        .attr('y2',point_y)
    })
    .on('mouseout', function(d){
      d3.select('#horizontal-line').remove();
    });

  // 添加label
  groups.append('text')
    .attr('class','label')
    .attr('x', function(d){
      var local_date = new Date(d.date);
      return xScale(local_date)+padding-barWidth/2;
    })
    .attr('y',function(d){
      return yScale(d.long)+padding-5;
    })
    .text(function(d){
      return d.long+'件';
    })
    .attr('textLength',barWidth)
    .attr('lengthAdjust','spacing');

  // 添加x轴的维度标注
  svg.append("text")
    .attr('class','axis-label')
    .attr('x',w+padding+5)
    .attr('y',h+padding)
    .text('时间轴');

  // 添加y轴的维度标注
  svg.append("text")
    .attr('class','axis-label')
    .attr('x',padding-10)
    .attr('y',padding-20)
    .text('单位（小时）');


  // 添加拖拽的表面层
  svg.append('rect')
    .attr('width',w)
    .attr('height',h)
    .attr('class','drag')
    .attr('fill','#dddddd')
    .attr('fill-opacity',0)
    .attr('transform','translate('+padding+','+padding+')')
    .call(drag);

  // 绘图的核心函数
  $scope.updateTimeLine = function(start, end){
    /*
     * start 开始时间,格式为时间对象
     * end 结束时间,格式为时间对象
     * datasets 数据源
     */

    // 更新显示
    $timeout(function(){
      $scope.start_ms = start;
      $scope.end_ms = end;
    },0);

    // 过滤元数据的
    var data_list = []
    datasets.forEach(function(item){
      if (new Date(item['time']) > start && new Date(item['time']) < end){
        data_list.push(item)
      }
    });

    // 创建x轴比例尺,以时间为刻度
    var xScale = d3.time.scale()
      .domain([new Date(start),new Date(end)])
      .range([0,w]);

    // 更新X轴
    var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('bottom')
      .ticks(x_conf['type'], 1)
      .tickFormat(d3.time.format(x_conf['format']));
    svg.select('.x.axis').call(xAxis);

    // 创建y轴比例尺，线性的刻度
    var yScale = d3.scale.linear()
      .domain([0,d3.max(datasets,function(d){return d.long})])
      .range([h,0]);
    // 创建y轴坐标
    var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left');
    svg.select('.y.axis').call(yAxis);

    var panel =  svg.select('.panel')
      .attr('transform','translate(0,0)');

    // 添加数据组
    var groups = panel.selectAll('.group')
      .data(data_list);

    groups.exit().remove();

    var new_groups = groups.enter().append('g').attr('class','group');
    new_groups.append('rect').attr('class','bar').attr('fill',function(d,i){
      return colors[0];
    });
    new_groups.append('text').attr('class','label');

    // 添加bar的信息
    groups.select('.bar')
      .attr('x',function(d,i){
        var local_date = new Date(d.time);
        return xScale(local_date)+padding-barWidth/2;
      })
      .attr('y',function(d){
        return yScale(d.long)+padding;
      })
      .attr('width', function(d,i){
        return barWidth;
      })
      .attr('height', function(d){
        return h-yScale(d.long)
      })
      .on('mouseover', function(d){
        var point_x = parseFloat(d3.select(this).attr('x'));
        var point_y = parseFloat(d3.select(this).attr('y'));
        svg.append('line')
          .attr('id','horizontal-line')
          .attr('x1',padding)
          .attr('x2',point_x)
          .attr('y1',point_y)
          .attr('y2',point_y)
      })
      .on('mouseout', function(d){
        d3.select('#horizontal-line').remove();
      });

    // 添加label
    groups.select('.label')
      .attr('x', function(d){
        var local_date = new Date(d.time);
        return xScale(local_date)+padding-barWidth/2;
      })
      .attr('y',function(d){
        return yScale(d.long)+padding-5;
      })
      .text(function(d){
        return d.long.toFixed(2);
      })
      .attr('textLength',barWidth)
      .attr('lengthAdjust','spacing');

    d3.select('.drag')
      .attr('transform','translate('+padding+','+padding+')')
      .attr('x',0)
      .attr('y',0);
  }

  $scope.getStatData = function(params){
    //@chenhao 缓存每次请求的参数
    sessionStorage.setItem('STAT_USER_PARAMS', JSON.stringify(params));
    $http({
      method:'post',
      url:'/api/v1/overview/',
      data: params
    }).success(function(response){
      var stats = response['stats'];
      var panel = 'bar_chart_user';
      var type = $scope.active_type_index;
      var min = $scope.start_time;
      var max = $scope.end_time;
      var data = stats

      // 根据type确定X轴的刻度，间隔等
      x_conf = DATA_TYPES[type];

      // 更新最大最小时间
      min_time = min;
      max_time = max;

      datasets = data;
      start_time = min;

      var end = new Date(min.getTime()+x_conf['range']);

      // 更新数据
      $scope.updateTimeLine(min, end);

      //$scope.drawBarChart(stats,panel)
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
}
