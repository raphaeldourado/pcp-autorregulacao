//-----------------------------------------VARIAVEIS
var margin = {top: 100, right: 10, bottom: 10, left: 10},
	width = 1300 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangePoints([0, width], 1),
	y = {},
	dragging = {};

var line = d3.svg.line(),
	axis = d3.svg.axis().orient("left"),
	background,
	foreground;


//permite trazer um objeto para o front
d3.selection.prototype.moveToFront = function() {  
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
};

function drawGraph(filter_options){

    //limpa svg
    d3.selectAll("svg > *").remove();

    svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //filtra dados
    filtered_data = student_data.filter(function (row) {
        return row.curso.trim().toLowerCase() == filter_options.curso.trim().toLowerCase() &&
            row.semestre.trim().toLowerCase() == filter_options.semestre.trim().toLowerCase() &&
            row.periodo.trim().toLowerCase() == filter_options.periodo.trim().toLowerCase() &&
            row.nome_disciplina.trim().toLowerCase() == filter_options.nome_disciplina.trim().toLowerCase();
    });

    variable_list_lowercase = filter_options.variaveis.map(function (value) {
        return value.trim().toLowerCase();
    });

    // Extract the list of dimensions and create a scale for each.
    x.domain(dimensions = d3.keys(filtered_data[0]).filter(function (d) {
        return variable_list_lowercase.includes(d.trim().toLowerCase()) && (y[d] = d3.scale.linear()
            .domain(d3.extent(filtered_data, function (p) { return +p[d]; }))
            .range([height, 0]));
    }));

    // Add grey background lines for context.
    background = svg.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(filtered_data)
        .enter().append("path")
        .attr("d", path);

    // Add blue foreground lines for focus.
    foreground = svg.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(filtered_data)
        .enter().append("path")
        .attr("d", path)
        .attr("stroke", function (d) { return setStrokeColor(d) })
        .on("mousemove", function () { return d3.select("#simpletooltip").style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px"); })
        .on('mouseover', function (d) {
            d3.select(this).attr("stroke-width", "4");
             d3.select(this).attr("stroke", function(){
                if (setStrokeColor(d) == "red"){ //TODO procurar um jeito mais seguro de fazer isso
                    return "#730000"; //~darkred
                } else {
                    return "#264662"; //~darkblue
                }
            }); 

            d3.select(this).moveToFront();

            d3.select("#simpletooltip").style("visibility", "visible").text(d.nome_aluno);
        })
        .on('mouseout', function (d) {
            d3.select(this).attr("stroke-width", "1");
            d3.select(this).attr("stroke", setStrokeColor(d)); 
            d3.select("#simpletooltip").style("visibility", "hidden");
        });

    // Add a group element for each dimension.
    var g = svg.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
        .call(d3.behavior.drag()
            .origin(function (d) { return { x: x(d) }; })
            .on("dragstart", function (d) {
                dragging[d] = x(d);
                background.attr("visibility", "hidden");
            })
            .on("drag", function (d) {
                dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                foreground.attr("d", path);
                dimensions.sort(function (a, b) { return position(a) - position(b); });
                x.domain(dimensions);
                g.attr("transform", function (d) { return "translate(" + position(d) + ")"; })
            })
            .on("dragend", function (d) {
                delete dragging[d];
                transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                transition(foreground).attr("d", path);
                background
                    .attr("d", path)
                    .transition()
                    .delay(500)
                    .duration(0)
                    .attr("visibility", null);
            }));

    // Add an axis and title.
    g.append("g")
        .attr("class", "axis")
        .each(function (d) { d3.select(this).call(axis.scale(y[d])); })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function (d) { return d; });

    // Add and store a brush for each axis.
    g.append("g")
        .attr("class", "brush")
        .each(function (d) {
            d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush).on("brushend", displaySelectedStudents));
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);
}

//colore de acordo com a classe aprovado/reprovado
function setStrokeColor(d){
	if (parseInt(d.DESEMPENHO_BINARIO) == 0){
		return "steelblue"; //satisfatorio
	} else {
		return "red"; //insatisfatorio
	}
}

function position(d) {
  var v = dragging[d];
  return v == null ? x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
}

function brushstart() {
  d3.event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
    var actives = dimensions.filter(function (p) { return !y[p].brush.empty(); }),
        extents = actives.map(function (p) { return y[p].brush.extent(); });

    foreground.style("display", function (d) {
        return actives.every(function (p, i) {
            return extents[i][0] <= d[p] && d[p] <= extents[i][1];
        }) ? null : "none";
    });

    foreground.attr("class", function (d) {
        return actives.every(function (p, i) {
            return extents[i][0] <= d[p] && d[p] <= extents[i][1];
        }) ? "brushed" : "non-brushed";
    });

    //impede que a tabela de alunos seja mostrada caso nao haja brush ativo
    if (actives.length == 0 || extents.length == 0){
        showStudentList = false;
    } else {
        showStudentList = true;
    }
}

