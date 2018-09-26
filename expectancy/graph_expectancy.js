queue()
    .defer(d3.csv, "life_expectancy.csv")
    .await(makeChart);

function makeChart(error, lifeExpectancyData) {
    let ndx = crossfilter(lifeExpectancyData);

    //For chart with date.
    let parseDate = d3.time.format("%d/%m/%Y").parse;

    lifeExpectancyData.forEach(function(d) {
        d.year = parseDate("01/01/" + d.year);
    });


    //Male life expectancy by country
    let maleDim = ndx.dimension(dc.pluck("country"));
    
    let totalLifeExpectancyByMale = maleDim.group().reduce(function(c,v) {
        c.count++;
        c.total += +v.male;
        c.average = c.total / c.count;
        return c;
    },
    function(c,v) {
        c.count--;
        c.total -= +v.male;
        c.average = c.total / c.count;
        return c;
    },
    function() {
        return { count: 0, total: 0, average: 0 };
    });

    let maleChart = dc.barChart("#totalLifeExpectancyByMale")
    
    maleChart
        .width(1500)
        .height(250)
        .margins({top: 20, right: 20, bottom: 100, left: 50})
        .dimension(maleDim)
        .group(totalLifeExpectancyByMale)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .valueAccessor(function(c) {
            return c.value.average;
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Country")
        .yAxisLabel("Male Life Expectancy")
        .yAxis().ticks(8)
    

 //female life expectancy by country
    let femaleDim = ndx.dimension(dc.pluck("country"));
    
    let totalLifeExpectancyByFemale = femaleDim.group().reduce(function(c,v) {
        c.count++;
        c.total += +v.female;
        c.average = c.total / c.count;
        return c;
    },
    function(c,v) {
        c.count--;
        c.total -= +v.female;
        c.average = c.total / c.count;
        return c;
    },
    function() {
        return { count: 0, total: 0, average: 0 };
    });

    let femaleChart = dc.barChart("#totalLifeExpectancyByFemale")
    
    femaleChart
        .width(1500)
        .height(250)
        .margins({top: 20, right: 20, bottom: 100, left: 50})
        .dimension(femaleDim)
        .group(totalLifeExpectancyByFemale)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .valueAccessor(function(c) {
            return c.value.average;
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Country")
        .yAxisLabel("Female Life Expectancy")
        .yAxis().ticks(8)
    
    
    //Life expectancy by gender and country composite chart  
    let countryCompDim = ndx.dimension(dc.pluck("country"));

    let countryByFemale = countryCompDim.group().reduce(
        function(c, v) {
            c.count++;
            c.total += +v.female;
            c.average = c.total / c.count;
            return c;
        },
        function(c, v) {
            c.count--;
            c.total -= +v.female;
            c.average = c.total / c.count;
            return c;
        },
        function() {
            return { count: 0, total: 0, average: 0 };
        });

    let countryByMale = countryCompDim.group().reduce(
        function(c, v) {
            c.count++;
            c.total += +v.male;
            c.average = c.total / c.count;
            return c;
        },
        function(c, v) {
            c.count--;
            c.total -= +v.male;
            c.average = c.total / c.count;
            return c;
        },
        function() {
            return { count: 0, total: 0, average: 0 };
        });

    let compCountryChart = dc.compositeChart("#countryByGender");
    
    compCountryChart
        .width(1500)
        .height(250)
        .margins({top: 10, right: 20, bottom: 100, left: 50})
        .dimension(countryCompDim)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Country")
        .group(countryByFemale)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .yAxisLabel("Life Expectancy")
        .legend(dc.legend().x(80).y(80).itemHeight(13).gap(5))
        .compose([
            dc.lineChart(compCountryChart)
            .colors("blue")
            .group(countryByMale, "Male")
            .valueAccessor(function(c) {
                return c.value.average;
            }),
            dc.lineChart(compCountryChart)
            .colors("purple")
            .group(countryByFemale, "Female")
            .valueAccessor(function(c) {
                return c.value.average;
            })
        ])
        .render()
        .yAxis().ticks(4);
    
    
    //Life expectancy by gender and year composite chart  
    let yearCompDim = ndx.dimension(dc.pluck("year"));

    let yearByFemale = yearCompDim.group().reduce(
        function(c, v) {
            c.count++;
            c.total += +v.female;
            c.average = c.total / c.count;
            return c;
        },
        function(c, v) {
            c.count--;
            c.total -= +v.female;
            c.average = c.total / c.count;
            return c;
        },
        function() {
            return { count: 0, total: 0, average: 0 };
        });

    let yearByMale = yearCompDim.group().reduce(
        function(c, v) {
            c.count++;
            c.total += +v.male;
            c.average = c.total / c.count;
            return c;
        },
        function(c, v) {
            c.count--;
            c.total -= +v.male;
            c.average = c.total / c.count;
            return c;
        },
        function() {
            return { count: 0, total: 0, average: 0 };
        });

    let minYear = yearCompDim.bottom(1)[0].year
    let maxYear = yearCompDim.top(1)[0].year

    let compYearChart = dc.compositeChart("#yearByGender");
    
    compYearChart
        .width(1500)
        .height(250)
        .margins({top: 10, right: 20, bottom: 50, left: 50})
        .dimension(yearCompDim)
        .group(yearByFemale)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .x(d3.time.scale().domain([minYear, maxYear]))
        .xAxisLabel("Year")
        .yAxisLabel("Life Expectancy")
        .legend(dc.legend().x(80).y(80).itemHeight(13).gap(5))
        .compose([
            dc.lineChart(compYearChart)
            .colors("blue")
            .group(yearByMale, "Male")
            .valueAccessor(function(c) {
                return c.value.average;
            }),
            dc.lineChart(compYearChart)
            .colors("purple")
            .group(yearByFemale, "Female")
            .valueAccessor(function(c) {
                return c.value.average;
            })
        ])
        .render()
        .yAxis().ticks(4);
    
    
    
    dc.renderAll();

}
