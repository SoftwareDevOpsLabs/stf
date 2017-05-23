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

  $scope.stat_time = new Date();
  $scope.end_time = new Date();
  $scope.format = "yyyy/MM/dd";
  $scope.altInputFormats = ['yyyy/M!/d!'];
  $scope.options = {
    showWeeks: false
  };

  // 获取所有的测试类型
  $http.get('/api/v1/testing/types/')
    .then(function(response) {
      console.log(response)
      $scope.types = response['data']['types']
    })

  // 根据条件查询统计图的信息
  $scope.submitQuery = function(){
    // 检查开始时间和结束时间的输入
    var stat_time = $scope.stat_time
    var end_time = $scope.end_time
    var test_type = $scope.test_type

    if (stat_time>end_time){
      alert('开始时间不能大于结束时间')
    }

    // 发送请求，按照过滤条件查询
    // TODO get data from server
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

  $scope.drawPieChart = function(dataset,panel){
    // 检查数据源
    var colors = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9','#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1']
    if(dataset.length == 0){
      dataset = [['暂无数据',0.01]]
      var colors = ['#dddddd']
    }
    var pie = d3.layout.pie().value(function(d){return d[1]})
    var pie_data = pie(dataset)
    var width = 400
    var height = 400
    var outerRadius = width/3
    var innerTadius = 0
    var arc = d3.svg.arc().innerRadius(innerTadius).outerRadius(outerRadius)
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
    arcs.append('text').attr('transform',function(d){
      var x = arc.centroid(d)[0]*1.4
      var y = arc.centroid(d)[1]*1.4
      return "translate("+x+","+y+")"
    }).text(function(d){
      var percent = Number(d.value)/d3.sum(dataset,function(d){return d[1]})*100
      return percent.toFixed(1)+'%'
    }).attr('fill','#ffffff')
    arcs.append("line").attr('stroke','#666666')
      .attr('x1',function(d){return arc.centroid(d)[0]*2})
      .attr('y1',function(d){return arc.centroid(d)[1]*2})
      .attr('x2',function(d){return arc.centroid(d)[0]*2.2})
      .attr('y2',function(d){return arc.centroid(d)[1]*2.2})

    arcs.append('text').attr('transform',function(d){
      var x = arc.centroid(d)[0]*2.5
      var y = arc.centroid(d)[1]*2.5
      return "translate("+x+","+y+")"
    }).attr('text-anchor','middle').text(function(d){
      console.log('d',d);
      return d.data[0]
    })
  }

  $scope.drawBarChart = function(lables,dataset,panel){
    // 绘制图表
    var colors = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9','#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1']

    var margin = {top: 30, right: 30, bottom: 30, left: 30},
      w = 400 - margin.left - margin.right,
      h = 350 - margin.top - margin.bottom;
    var color = d3.scale.category10();

    var x = d3.scale.ordinal()
      .rangeRoundBands([0, w], .1);
    var y = d3.scale.linear()
      .range([h, 0]);

    var formatPercent = d3.format(".0");
    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");
    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickFormat(formatPercent);

    x.domain(lables.map(function(d) { return d; }));
    y.domain([0, d3.max(dataset, function(d) { return d; })]);

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
      .attr("x", function(d,i) {
        var pad = 0.5*(w/dataset.length-x.rangeBand())
        return pad + i*(w/dataset.length)
      })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d); })
      .attr("height", function(d) { return h - y(d); })
      .attr("fill", function(d,i) { return colors[i]; });
  }

  $http({
    method:'post',
    url:'/api/v1/testing/pie/model/',
    data:{
      'start_time': '',
      'end_time': '',
      'test_type': 1
    }
  }).success(function(response){
    console.log(response);
    var stat = response['stat']
    var panel = 'pie_chart_manufacturer'
    $scope.drawPieChart(stat,panel)
    $scope.manufacturer_stat = stat
  })

  $http({
    method:'post',
    url:'/api/v1/testing/pie/name/',
    data:{
      'start_time': '',
      'end_time': '',
      'test_type': 1
    }
  }).success(function(response){
    console.log(response)
    var stat = response['stat']
    var panel = 'pie_chart_scene'
    $scope.drawPieChart(stat,panel)
    $scope.scene_stat = stat
  })

  $http({
    method:'post',
    url:'/api/v1/testing/bar/user/',
    data:{
      'start_time': '',
      'end_time': '',
      'test_type': 1
    }
  }).success(function(response){
    console.log(response);
    var labels = response['labels']
    var dataset = response['dataset']
    var panel = 'bar_chart_user'
    $scope.drawBarChart(labels,dataset,panel);
  })

  $http({
    method:'post',
    url:'/api/v1/testing/bar/model/',
    data:{
      'start_time': '',
      'end_time': '',
      'test_type': 1
    }
  }).success(function(response){
    console.log(response);
    var labels = response['labels']
    var dataset = response['dataset']
    var panel = 'bar_chart_device'
    $scope.drawBarChart(labels,dataset,panel)
  })
}
