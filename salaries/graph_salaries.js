queue()
    .defer(d3.csv, "salaries.csv")
    .await(makeGraph);

function makeGraph(error, transactionsData) {
    let ndx = crossfilter(transactionsData);

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
            .width(300)
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
    
    dc.renderAll();

}
