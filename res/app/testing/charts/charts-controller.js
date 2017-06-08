require('d3');
module.exports = function ChartsCtrl(
  $scope,
  DeviceService,
  ControlService,
  socket,
  $http
) {
  $scope.tracker = DeviceService.trackAll($scope)
  $scope.control = ControlService.create($scope.tracker.devices, '*ALL')

  $scope.devices = [];

  $scope.start_time = new Date();
  $scope.end_time = new Date();
  $scope.format = "yyyy/MM/dd";
  $scope.altInputFormats = ['yyyy/M!/d!'];
  $scope.options = {
    showWeeks: false
  };

  $scope.getStatData = function(params){
    $http({
      method:'post',
      url:'/api/v1/testing/pie/manufacturer/',
      data: params
    }).success(function(response){
      var stat = response['stat']
      var panel = 'pie_chart_manufacturer'
      $scope.drawPieChart(stat,panel)
      $scope.manufacturer_stat = stat
    })

    $http({
      method:'post',
      url:'/api/v1/testing/pie/name/',
      data: params
    }).success(function(response){
      var stat = response['stat']
      var panel = 'pie_chart_scene'
      $scope.drawPieChart(stat,panel)
      $scope.scene_stat = stat
    })

    $http({
      method:'post',
      url:'/api/v1/testing/bar/user/',
      data: params
    }).success(function(response){
      var labels = response['labels']
      var dataset = response['dataset']
      var panel = 'bar_chart_user'
      $scope.drawBarChart(labels,dataset,panel);
    })

    $http({
      method:'post',
      url:'/api/v1/testing/bar/model/',
      data: params
    }).success(function(response){
      var labels = response['labels']
      var dataset = response['dataset']
      var panel = 'bar_chart_device'
      $scope.drawBarChart(labels,dataset,panel)
    })
  };

  // 获取所有的测试类型
  $http.get('/api/v1/testing/types/')
    .then(function(response) {
      $scope.types = response['data']['types']
    })

  // 定义默认的参数
  var default_params = {
    'start_time': 0,
    'end_time': new Date().getTime(),
    'test_type': ''
  }
  // 获取默认的数据
  $scope.getStatData(default_params)

  // 根据条件查询统计图的信息
  $scope.submitQuery = function(){
    // 检查开始时间和结束时间的输入
    var start_time = $scope.start_time
    var end_time = $scope.end_time
    var test_type = $scope.test_type

    // 检查开始时间和结束时间
    if (start_time>end_time){
      alert('开始时间不能大于结束时间')
      return
    }

    // 检查测试类型
    if (!test_type){
      alert('请选择测试类型')
      return
    }
    var params = {
      'start_time': start_time.getTime(),
      'end_time': end_time.getTime(),
      'test_type': test_type
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

  // 初始化画布
  var width = 540
  var height = 540

  // 定义默认颜色
  var colors = d3.range(100).map(d3.scale.category20())

  var outerRadius = 150
  var innerTadius = 0
  var arc = d3.svg.arc().innerRadius(innerTadius).outerRadius(outerRadius)

  $scope.drawPieChart = function(dataset,panel){
    // 检查数据源
    if(dataset.length == 0){
      dataset = [['暂无数据',0.01]]
      var colors = ['#dddddd']
    }else{
      var colors = d3.range(100).map(d3.scale.category20())
    }
    var pie = d3.layout.pie().value(function(d){return d[1]})
    var pie_data = pie(dataset)
    // 清空画布
    d3.select('#'+panel).select('svg').remove()
    var svg = d3.select("#"+panel).append("svg").attr("width",width).attr("height",height)
    var arcs = svg.selectAll("g")
      .data(pie_data)
      .enter()
      .append("g")
      .attr("transform","translate("+(width/2)+","+(height/2)+")")
      .on("mouseover",function(d,i){
        d3.select(this).attr('fill','red')
      })
      .on("mouseout",function(d,i){
        d3.select(this).transition().duration(500).attr('fill','#666666')
      })
    arcs.append("path").attr("fill",function(d,i){return colors[i]}).attr('d',function(d){return arc(d)})

    // 假设label的长度为100，高度为20 ,计算每个label的位置，进行label碰撞检测，和边缘碰撞检测
    // label合理的范围在，图像之外的空白区域
    var label_points = [];
    arcs.append('text').attr('class','pie-label').text(function(d){
      var x = arc.centroid(d)[0]*2.4
      var y = arc.centroid(d)[1]*2.4
      label_points.push({
        name : d.data[0],
        x : x,
        y : y
      })
    }).attr('fill','#ffffff')

    // 将label_points拆分成两部分， x>0 和 x <0

    var left_points = [];
    var right_points = [];
    label_points.forEach(function(d){
      if (d.x >0){
        right_points.push(d)
      }else{
        left_points.push(d)
      }
    });

    // 排序操作
    left_points.sort(function(a,b){
      return a.y - b.y
    })
    right_points.sort(function(a,b){
      return a.y - b.y
    })

    var point_hash = {}
    // 上下点之间的距离
    left_points.forEach(function(d,index){
      console.log('===',d)
      if (index==0){
        point_hash[d.name] = [d.x, d.y]
      }else{
        // 比较
        if (d.y - left_points[index-1].y < 14){
          d.y = left_points[index-1].y + 14
        }
        d.x = Math.max(-Math.abs(d.x - index*30),-(width/2)+120)

        // 如果改点在内部，重新计算x坐标
        point_hash[d.name] = [d.x, d.y]

      }
    })

    right_points.forEach(function(d,index){
      if (index==0){
        point_hash[d.name] = [d.x, d.y]
      }else{
        // 比较
        if (d.y - right_points[index-1].y < 14){
          d.y = left_points[index-1].y + 14
        }
        d.x = Math.min(d.x,(width/2)-120)

        // 如果x距离太近，需要调整一下
        point_hash[d.name] = [d.x, d.y]
      }
    })

    arcs.append('text').attr('transform',function(d){
      console.log('xxx',d.data[0])
      var points = point_hash[d.data[0]];
      console.log(points)
      var x = points[0];
      var y = points[1];

      //if(x<0){
      //  if (Math.abs(x)+100>width/2){
      //    x = -(width/2)+100
      //  }
      //}else{
      //  if (Math.abs(x)+100>=width/2){
      //    x = width/2-100
      //  }
      //}

      return "translate("+x+","+y+")"

    }).attr('text-anchor',function(d){
      var x = arc.centroid(d)[0]*2.4
      console.log(d)
      if (x>20){
        return 'start'
      }else if(-20<=x && x<=20){
        return 'middle'
      }else{
        return 'end'
      }
    }).text(function(d){
      var percent = Number(d.value)/d3.sum(dataset,function(d){return d[1]})*100
      return d.data[0] + '(' + percent.toFixed(1)+'%)'
    })

    arcs.append("line").attr('stroke','#666666')
      .attr('x1',function(d){return arc.centroid(d)[0]*2})
      .attr('y1',function(d){return arc.centroid(d)[1]*2})
      .attr('x2',function(d){
        var points = point_hash[d.data[0]];
        console.log(points)
        var x = points[0];
        return x
      })
      .attr('y2',function(d){
        var points = point_hash[d.data[0]];
        console.log(points)
        var y = points[1];

        return y
      })
  }

  $scope.drawBarChart = function(lables,dataset,panel){
    // 定义图表的间距
    var margin = {top: 30, right: 30, bottom: 30, left: 100}
    var w = 500 - margin.left - margin.right
    var h = Math.max(350,dataset.length*14) - margin.top - margin.bottom;

    // 定义x轴和y轴
    var y = d3.scale.ordinal()
      .rangeRoundBands([0,h],0.1,0);

    console.log('label',lables)
    y.domain(lables.map(function(d) { return d; }));

    var x = d3.scale.linear()
      .range([0,w]);
    x.domain([0, d3.max(dataset, function(d) { return d; })]);

    var formatPercent = d3.format(".0");
    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(formatPercent)

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")

    d3.select('#'+panel).select('svg').remove()
    var svg = d3.select("#"+panel).append("svg")
      .attr("width", w + margin.left + margin.right)
      .attr("height", h + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, " + h + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis);

    svg.selectAll(".bar")
      .data(dataset)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("y", function(d,i) {
        return  y(lables[i])
      })
      .attr("height", y.rangeBand())
      .attr("x", function(d) { return 0; })
      .attr("width", function(d) { return x(d); })
      .attr("fill", function(d,i) { return colors[i]; });
  }
}
