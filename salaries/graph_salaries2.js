//Responsiveness for smaller screens - see also 'makeGraph function below'.
let windowWidth = document.documentElement["clientWidth"];

window.onresize = function() {
    location.reload();
}

queue()
    .defer(d3.csv, "salaries.csv")
    .await(makeGraph);

function makeGraph(error, transactionsData) {
    let ndx = crossfilter(transactionsData);


    //Responsiveness for smaller screens   
    let chartWidth = 300;
    
    if (windowWidth < 768) {
        chartWidth = windowWidth;
    } else {
        chartWidth = windowWidth / 5;
    }


    //Salary by gender chart
    let genderDim = ndx.dimension(dc.pluck("sex"));
    
    let salaryByGender = genderDim.group().reduce(
        function(c, v) {
            //Add function, run once for each record that's added to the group
            c.count++;
            c.total += +v.salary; //+v is a javaScript reserved term so that the result is always seen as a number, rather than a string.
            c.average = c.total / c.count;
            return c;
        },
        function(c,v) {
            //Remove function, run once for each record that's removed from the group
            c.count--;
            c.total -= +v.salary;
            c.average = c.total / c.count;
            return c;
        },
        function() {
            //Initialiser function. Referred to as c in the add and remove functions above
            return { count: 0, total: 0, average: 0 };
        });
        
        let salaryChart = dc.barChart("#salaryByGender");
        
        salaryChart
            .width(chartWidth)
            .height(150)
            .margins({top: 10, right: 20, bottom: 50, left: 50,})
            .dimension(genderDim)
            .group(salaryByGender)
            .valueAccessor(function(c) { //Gets the value of 'c'
                return c.value.average;
            })
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .xAxisLabel("Gender")
            .yAxis().ticks(6);
    
    
    //Salary by rank chart   
    let rankDim = ndx.dimension(dc.pluck("rank"));

    let salaryByRank = rankDim.group().reduceSum(dc.pluck("salary"));

    let rankChart = dc.barChart("#salaryByRank");

    rankChart
        .width(chartWidth)
        .height(150)
        .margins({top: 10, right: 20, bottom: 50, left: 70,})
        .dimension(rankDim)
        .group(salaryByRank)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Rank")
        .yAxis().ticks(6)    
    

    //Salary by gender and rank composite chart  
    let rankCompDim = ndx.dimension(dc.pluck("rank"));

    let rankByFemale = rankCompDim.group().reduce(
        function(c, v) {
            // Add function, run once for each record
            // that's added to the group
            if (v.sex == "Female") {
                c.count++;
                c.total += +v.salary;
                c.average = c.total / c.count;
            }
            return c;
        },
        function(c, v) {
            // Remove function, run once for each record
            // that's removed from the group
            if (v.sex == "Female") {
                c.count--;
                c.total -= +v.salary;
                c.average = c.total / c.count;
            }
            return c;
        },
        function() {
            // Initialiser function. Referred to as c
            // in the add and remove functions above
            return { count: 0, total: 0, average: 0 };
        });

    let rankByMale = rankCompDim.group().reduce(
        function(c, v) {
            // Add function, run once for each record
            // that's added to the group
            if (v.sex == "Male") {
                c.count++;
                c.total += +v.salary;
                c.average = c.total / c.count;
            }
            return c;
        },
        function(c, v) {
            // Remove function, run once for each record
            // that's removed from the group
            if (v.sex == "Male") {
                c.count--;
                c.total -= +v.salary;
                c.average = c.total / c.count;
            }
            return c;
        },
        function() {
            // Initialiser function. Referred to as c
            // in the add and remove functions above
            return { count: 0, total: 0, average: 0 };
        });

    let compSalaryChart = dc.compositeChart("#salaryByGenderRank");
    
    compSalaryChart
        .width(chartWidth)
        .height(200)
        .margins({top: 10, right: 20, bottom: 50, left: 50})
        .dimension(rankCompDim)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Rank")
        .group(rankByFemale)
        // .yAxisLabel("Salary")
        .legend(dc.legend().x(60).y(10).itemHeight(13).gap(5))
        .compose([
            dc.barChart(compSalaryChart)
            .colors("blue")
            .group(rankByMale, "Male")
            .valueAccessor(function(c) {
                return c.value.average;
            }),
            dc.barChart(compSalaryChart)
            .colors("purple")
            .group(rankByFemale, "Female")
            .valueAccessor(function(c) {
                return c.value.average;
            })
        ])
        .render()
        .yAxis().ticks(4);
    
    
    
    dc.renderAll();

}
