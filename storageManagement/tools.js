formatoFecha = function(fecha){
    var d = new Date(fecha || Date.now()),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [day, month, year].join('/');

}

actualizaGrid = function(){
	var lis = Proyectos.find().fetch();
    var src ={
    	datatype: "json",
        datafields: [
        	{ name: 'id', type: 'string' },
            { name: 'projectName', type: 'string' },
            { name: 'equipo', type: 'string' },
            { name: 'fechaInicio', type: 'string' },
            { name: 'fechaCompromiso', type: 'string' },
            { name: 'site', type: 'string' }
          ],
          localdata: lis
        };
    var dt = new $.jqx.dataAdapter(src);
	$("#proyectosGrid").jqxGrid({source: dt})
}
  
editarProyecto = function(proyecto){
    console.log("PROYECTO ",proyecto);
    $(".id_").val(proyecto._id);
    if (proyecto.projectName)
        $(".projectName").val(proyecto.projectName);
    if (proyecto.proyectManager)
        $(".proyectManager").val(proyecto.proyectManager);
    if (proyecto.plataforma)
        $(".plataforma").val(proyecto.plataforma);
    if (proyecto.equipo)
        $(".equipo").val(proyecto.equipo);
    if (proyecto.tipoProyecto)
        $(".tipoProyecto").val(proyecto.tipoProyecto);
    if (proyecto.cmu)
        $(".cmu").val(proyecto.cmu);
    if (proyecto.sirh)
        $(".sirh").val(proyecto.sirh);
    if (proyecto.iep)
        $(".iep").val(proyecto.iep);
    if (proyecto.gocCode)
        $(".goc").val(proyecto.gocCode);
    if (proyecto.cate)
        $(".cate").val(proyecto.cate);
    if (proyecto.packingList)
        $(".packingList").val(proyecto.packingList);
    if (proyecto.aperture)
        $(".aperture").val(proyecto.aperture);
    if (proyecto.deviceName)
        $(".deviceName").val(proyecto.deviceName);
    if (proyecto.serialNumber)
        $(".serialNumber").val(proyecto.serialNumber);
    if (proyecto.invoice)
        $(".invoice").val(proyecto.invoice);
    if (proyecto.site)
        $(".site").val(proyecto.site);
    if (proyecto.po)
        $(".po").val(proyecto.po);
    if (proyecto.so)
        $(".so").val(proyecto.so);
    if (proyecto.quote)
        $(".quote").val(proyecto.quote);
    if (proyecto.sr)
        $(".sr").val(proyecto.sr);
    if (proyecto.humanResource)
        $(".human-resources").val(proyecto.humanResource.join("\n"));
    if (proyecto.fechaCompromiso)
        $(".fechaCompromiso").val(proyecto.fechaCompromiso);
    if (proyecto.programActivities)
        $(".program-activities").val(proyecto.programActivities);

    if (proyecto.sn)
        $.each(proyecto.sn, function(){
            var linea = this.split(",");
            var sn = "<div class='lineaSN'><p class='texto-campo'>Service Now</p><input class='sn valor-campo' type='text' value='"+linea[0]+"'/><p class='texto-campo'>Incident</p><input class='incident valor-campo' type='text' value='"+linea[1]+"'/></div><br/>";
            $('.div-sn').append(sn);  
        });  

    if (proyecto.powerProfile)
        $.each(proyecto.powerProfile, function(){
            var linea = this.split(",");
            var pp = "<div class='lineaPP'><p class='texto-campo'>Descripción</p><input class='valor-campo descPP' type='text' value='"+linea[0]+"'/><p class='texto-campo'>Valor</p><input class='valor-campo valorPP' type='text' value='"+linea[1]+"'/><p class='texto-campo'>Tipo</p><input class='valor-campo tipoPP' type='text' value='"+linea[2]+"'/></div><br/>";
            $('.divPP').append(pp);  
        });    
    
    if (proyecto.powerCabling)
        $.each(proyecto.powerCabling, function(){
            var linea = this.split(",");
            var pc = "<div class='lineaPC'><p class='texto-campo'>Descripción</p><input class='valor-campo descPC' type='text' value='"+linea[0]+"'/><p class='texto-campo'>Cantidad</p><input class='valor-campo valorPC' type='text' value='"+linea[1]+"'/><p class='texto-campo'>Tipo</p><input class='valor-campo tipoPC' type='text' value='"+linea[2]+"'/></div><br/>";
            $('.divPC').append(pc);  
        });  

    
}