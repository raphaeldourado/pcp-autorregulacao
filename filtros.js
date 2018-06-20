function carregarSemestres() {
    cursoSelecionado = document.getElementById("cbcurso").selectedOptions[0].value;
    cbFilterData.semestres = d3.map(student_data.filter(function (row) { return row.curso == cursoSelecionado; }), function (d) { return d.semestre; }).keys();
    updateFiltersOptions('cbsemestre');
}
function carregarPeriodos() {
    semestreSelecionado = document.getElementById("cbsemestre").selectedOptions[0].value;
    cursoSelecionado = document.getElementById("cbcurso").selectedOptions[0].value;
    cbFilterData.periodos = d3.map(student_data.filter(function (row) {
        return row.curso == cursoSelecionado && row.semestre == semestreSelecionado;
    }), function (d) { return d.periodo; }).keys();
    updateFiltersOptions('cbperiodo');
}
function carregarDisciplinas() {
    semestreSelecionado = document.getElementById("cbsemestre").selectedOptions[0].value;
    cursoSelecionado = document.getElementById("cbcurso").selectedOptions[0].value;
    periodoSelecionado = document.getElementById("cbperiodo").selectedOptions[0].value;
    cbFilterData.disciplinas = d3.map(student_data.filter(function (row) {
        return row.curso == cursoSelecionado
            && row.semestre == semestreSelecionado
            && row.periodo == periodoSelecionado;
    }), function (d) { return d.nome_disciplina; }).keys();
    updateFiltersOptions('cbdisciplina');
}

//atualiza combos com opcoes de filtro
function updateFiltersOptions(elementId){
    
    var target = document.getElementById(elementId);

    switch (elementId) {
        case "cbcurso":
            //cursos
            populateCbOptions(target, cbFilterData.cursos);
            break;
        case "cbsemestre":
            clearCbOptions(target);
            addDefaultOption(target);
            populateCbOptions(target, cbFilterData.semestres);
            break;
            case "cbperiodo":
            clearCbOptions(target);
            addDefaultOption(target);
            populateCbOptions(target, cbFilterData.periodos);
            break;
        case "cbdisciplina":
            clearCbOptions(target);
            addDefaultOption(target);
            populateCbOptions(target, cbFilterData.disciplinas);
            break;
    }

}

function clearCbOptions(cbelement){
    cbelement.options.length = 0;
}

function addDefaultOption(cbelement){
    var newOption = document.createElement("option");
    newOption.text = "Selecione";
    newOption.setAttribute('disabled', 'disabled');
    newOption.setAttribute('selected', 'selected');
    newOption.setAttribute('value', 'value');
    cbelement.add(newOption);    
}

function populateCbOptions(cbelement, options){

    sorted_options = options.sort();

    sorted_options.forEach(op => {
        var newOption = document.createElement("option");
        newOption.text = op;
        cbelement.add(newOption);    
    });        
}