// event handler for dropdown selection change
function newContractFunc() {
    var selectBox = document.getElementById("selectContract");
    if (selectBox.selectedIndex < 0) return;
    var selectedValue = selectBox.options[selectBox.selectedIndex].value;
    contract_data = corn.filter(function(d) { return d.contract == selectedValue });

    contract_data.sort(function(a, b) {
      return a.trade_date - b.trade_date;
    });

    prices.forEach(function(p) {
      p.values = contract_data.map(function(d) {
        return {date: d.trade_date, price: +d[p.name]};
      })
    });

    x_time.domain(d3.extent(contract_data, function(d) { return d.trade_date; }));
    x_time_ctx.domain(x_time.domain());

    y_price.domain([
      d3.min(prices.filter(function(d) { return d.name.indexOf('price')>=0}), function(c) { return d3.min(c.values, function(v) { return v.price; }); }),
      d3.max(prices.filter(function(d) { return d.name.indexOf('price')>=0}), function(c) { return d3.max(c.values, function(v) { return v.price; }); })
    ]);

    y_volume.domain(d3.extent(contract_data, function(d) { return +d.volume; }));
    y_volume_ctx.domain(y_volume.domain());

    svgYAxis.transition().duration(0).call(yAxis);
    svgYAxis2.transition().duration(0).call(yAxis2);

    svgXAxis.transition().duration(0).call(xAxis);
    svgXAxisCtx.transition().duration(0).call(xAxisCtx);

    lines.transition().duration(800).attr("d", function(d) { return d.name.indexOf('price') >=0? line(d.values): line2(d.values); });

    ctxLine.transition().duration(800).attr ('d', lineCtx(prices[4].values));

    brush.clear();
    svgBrush.call(brush);

}

// brush handler
function brushed() {
    x_time.domain(brush.empty() ? x_time_ctx.domain() : brush.extent());
    lines.attr("d", function(d) { return d.name.indexOf('price') >=0? line(d.values): line2(d.values); });
    svgXAxis.call(xAxis);
}

// event handler for mouse hover
bisectData = d3.bisector(function(d) { return d.trade_date; }).left;
function mousemove() {
	var x0 = x_time.invert(d3.mouse(this)[0]),
			i = bisectData(contract_data, x0, 1),
  		d0 = contract_data[i - 1],
			d1 = contract_data[i],
			d = (x0 - d0.trade_date) > (d1.trade_date - x0) ? d1 : d0;
  temp_x=x0;
  labels.text(function(d) { return d.name == 'volume'? d.values[i].price: ("$" + d.values[i].price); })
        .attr("transform", function(d) { return "translate(" + (x_time(x0) + color.domain().indexOf(d.name)*50) + ",5)"; })

	vData[0].date = vData[1].date = x0;
  vData[0].price = y_price.domain()[0];
  vData[1].price = y_price.domain()[1];
	vLine.attr("d", line);

}
