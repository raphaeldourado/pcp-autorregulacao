//copiado de http://bl.ocks.org/feyderm/6bdbc74236c27a843db633981ad22c1b
function displaySelectedStudents() {
    // disregard brushes w/o selections  
    // ref: http://bl.ocks.org/mbostock/6232537
    //if (!d3.event.selection) return;
    // programmed clearing of brush after mouse-up
    // ref: https://github.com/d3/d3-brush/issues/10
    //d3.select(this).call(brush.move, null);

    if (showStudentList == true){ //apenas se houver brush ativo
        var d_brushed = d3.selectAll(".brushed").data();
        // populate table if one or more elements is brushed
        if (d_brushed.length > 0) {
            clearTableRows();
            //ordena
            d_brushed = d_brushed.map(function (value) {return value.nome_aluno;}).sort();
            d_brushed.forEach(d_row => populateTableRow(d_row));
        }
        else {
            clearTableRows();
        }
    } else {
        hideTableColNames();
    }
}
function clearTableRows() {
    hideTableColNames();
    d3.selectAll(".row_data").remove();
}
function hideTableColNames() {
    //d3.select("table").style("visibility", "hidden");
    d3.select("#div-table").style("display", "none");
}
function showTableColNames() {
    //d3.select("table").style("visibility", "visible");
    d3.select("#div-table").style("display", "block");
}
function populateTableRow(d_row) {
    showTableColNames();
    var d_row_filter = [d_row];
    d3.select("table")
        .append("tr")
        .attr("class", "row_data")
        .selectAll("td")
        .data(d_row_filter)
        .enter()
        .append("td")
        .attr("align", (d, i) => i == 0 ? "left" : "right")
        .text(d => d);
}