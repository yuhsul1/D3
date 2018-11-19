// @TODO: YOUR CODE HERE!


// if the SVG area isn't empty when the browser loads,
// remove it and replace it with a resized version of the chart
const svgArea = d3.select("body").select("svg");

// clear svg is not empty
if (!svgArea.empty()) {
    svgArea.remove();
}

// SVG wrapper dimensions are determined by the current width and
// height of the browser window.
const svgWidth = 960;
const svgHeight = 500;

const margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;


// Append SVG element
const svg = d3
    .select("#scatter")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

// Append group element
const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);



// function used for updating x-scale const upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    const xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

    return xLinearScale;

}

// function used for updating xAxis const upon click on axis label
function renderAxes(newXScale, xAxis) {
    const bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
};
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

// function used for updating circles group with new tooltip (Don't need yet)
function updateToolTip(chosenXAxis, circlesGroup) {
    let label = "Lack of Healthcare: "

    const toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
        return (`${d.state}<br>${chosenXAxis} ${d[chosenXAxis]}%<br>${label}${d.healthcare}%`);
    });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this)

    })
    // onmouseout event
    .on("mouseout", function(data, index) {
        toolTip.hide(data);
    });

    return circlesGroup;
}




let chosenXAxis = "poverty";

//plotting
d3.csv("assets/data/data.csv").then(function(healthData, error){
if (error) return console.warn(error);
healthData.forEach(function(data) {
    data.healthcare = +data.healthcare;
    data.poverty = +data.poverty;
    data.income = +data.income;
    data.age = +data.age;
    });

console.log(healthData)


let xLinearScale = xScale(healthData, chosenXAxis)

const yHealthcareScale = d3.scaleLinear()
.domain([0, d3.max(healthData, d => d.healthcare)])
.range([height, 0]);

let bottomAxis = d3.axisBottom(xLinearScale)
const yAxis = d3.axisLeft(yHealthcareScale)

let xAxis = chartGroup.append("g")
.attr("transform", `translate(0, ${height})`)
.call(bottomAxis);

chartGroup.append("g")
.call(yAxis);


// append circles
let circlesGroup = chartGroup.selectAll("circle")
.data(healthData)
.enter()
.append("circle")
.attr("cx", d => xLinearScale(d[chosenXAxis]))
.attr("cy", d => yHealthcareScale(d.healthcare))
.attr("r", "10")
.attr("fill", "blue")
.attr("stroke-width", "1")
.attr("stroke", "black")
.text(d => d.abbr);

// Date formatter to display dates nicely
const labelsGroup = chartGroup.append("g")
.attr("transform", `translate(${width / 2}, ${height + 20})`);

const povertyLabel = labelsGroup.append("text")
.attr("x", 0)
.attr("y", 20)
.attr("value", "poverty") // value to grab for event listener
.classed("active", true)
.text("Poverty Level");

const ageLabel = labelsGroup.append("text")
.attr("x", 0)
.attr("y", 40)
.attr("value", "age") // value to grab for event listener
.classed("inactive", true)
.text("Age");

const incomeLabel = labelsGroup.append("text")
.attr("x", 0)
.attr("y", 60)
.attr("value", "income") // value to grab for event listener
.classed("inactive", true)
.text("Income level");

// append y axis
chartGroup.append("text")
.attr("transform", "rotate(-90)")
.attr("y", 0 - margin.left)
.attr("x", 0 - (height / 2))
.attr("dy", "1em")
.classed("axis-text", true)
.text("Lack of Healthcare");

circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      const value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXaxis with value
        chosenXAxis = value;

        //console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true)
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true)
          }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false)
        }
      }
    });


});


