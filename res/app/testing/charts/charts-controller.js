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

  $scope.drawPieChart = function(dataset,panel){
    var pie = d3.layout.pie().value(function(d){return d[1]})
    var pie_data = pie(dataset)
    var width = 400
    var height = 400
    var outerRadius = width/3
    var innerTadius = 0
    var arc = d3.svg.arc().innerRadius(innerTadius).outerRadius(outerRadius)
    //var color = d3.scale.category20()
    var colors = ['#7cb5ec', '#434348', '#90ed7d', '#f7a35c', '#8085e9','#f15c80', '#e4d354', '#2b908f', '#f45b5b', '#91e8e1']
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

  $scope.drawBarChart = function(){
// 绘制图表
    var width = 500;
    var height = 400;
    var margin = {
      top : 30,
      right : 30,
      bottom : 30,
      left : 30
    };

// 构造数据
    var rand = d3.random.normal(0,25);
    var dataset = [];
    for (var i=0;i<100;i++){
      dataset.push(rand())
    }

// 处理直方图数据
    var bin_num = 10;
    var histogram = d3.layout.histogram()
      .range([-50,50])
      .bins(bin_num)
      .frequency(true);
    var data = histogram(dataset);
    console.log(data)


    var svg = d3.select('#bar_chart')
      .append('svg')
      .attr('width',width+margin.left+margin.right)
      .attr('height',height+margin.top+margin.bottom)
      .append('g')
      .attr('transform',"translate("+margin.left+","+margin.top+")");

// 创建坐标轴
//    var formatPercent = d3.format('个');

    var x = d3.scale.ordinal()
      .rangeRoundBands([0,width],0.1);
    var y = d3.scale.linear()
      .range([height,0]);

    x.domain(data.map(function(d) {
      return d.x.toFixed(1);
    }));
    y.domain([0, d3.max(data, function(d) { return d.y; })]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left')
//            .tickFormat(formatPercent);

    svg.append('g')
      .attr('class','axis')
      .attr('transform',"translate("+0+","+height+")")
      .call(xAxis);

    svg.append('g')
      .attr('class','axis')
      .call(yAxis);

    svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function(d,i) { return i*(width/bin_num); })
      .attr("width", 20)
      .attr("y", function(d) { return y(d.y); })
      .attr("height", function(d) { return height - y(d.y); })
      .attr("fill", function(d) { return color(d.x); });
  }

  // 读取当前用户所有的测试记录
  $http.get('/api/v1/testing/chart/manufacturer/')
    .then(function(response) {
      console.log(response)
      var stat = response['data']['stat']
      var panel = 'pie_chart_manufacturer'
      $scope.drawPieChart(stat,panel)
      $scope.manufacturer_stat = stat
    })

  // 读取当前用户所有的测试记录
  $http.get('/api/v1/testing/chart/name/')
    .then(function(response) {
      console.log(response)
      var stat = response['data']['stat']
      var panel = 'pie_chart_scene'
      $scope.drawPieChart(stat,panel)
      $scope.scene_stat = stat
    })
}
