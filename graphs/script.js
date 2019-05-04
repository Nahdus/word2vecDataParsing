import jon from "./wordferquency/wordFrequency.json"








// set the dimensions of the canvas
var margin = {top: 20, right: 20, bottom: 70, left: 40},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;


// set the ranges

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], 0.1, 0.2);

var y = d3.scale.linear()
    .range([height, 0]);

// define the axis
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")


var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(10);


// add the SVG element
var svg = d3.select("body").append("svg")
    .attr("width", 1000)//width + margin.left + margin.right)
    .attr("height", 500)//height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");


// load the data
d3.json("./wordferquency/wordFrequency.json", 
function(error, Data) {
    
    const data=Object.keys(Data).map((key)=>{
        return {Letter:key,Freq:parseInt(Data[key])}
    })
    
    data.splice(50)
    data.sort((a,b)=>{
        if (a.Freq<b.Freq){
            return -1
        }
        if (a.Freq>b.Freq){
            return 1
        }
        return 0
    })
    console.log(data.slice(-1)[0])
     
    console.log(data)
	
  // scale the range of the data
  x.domain(data.map(function(d) { return d.Letter; }));
  
  y.domain([0, d3.max(data, function(d) { return d.Freq; })]);

  // add axis
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 5)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Frequency");


  // Add bar chart
  svg.selectAll("bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.Letter); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.Freq); })
      .attr("height", function(d) { return height - y(d.Freq); });

})