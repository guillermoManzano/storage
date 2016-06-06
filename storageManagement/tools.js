formatoFecha = function(fecha){
    var d = new Date(fecha || Date.now()),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [day, month, year].join('/');
}

formatoFechaLargo = function(fecha){
    var day=fecha.getDay();
    var month=fecha.getMonth();
    var daym=fecha.getDate();
    var year = fecha.getFullYear();
    
    if (daym<10)
        daym="0"+daym
        
    var dayarray=new Array("Sunday","Monday","Tuesday","Wednesday","Thursday",
                            "Friday","Saturday")
    var montharray=new Array("January","February","March","April","May","June",
                            "July","August","September","October","November","December")
    
    return dayarray[day]+", "+montharray[month]+" "+daym+", "+year;
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

calculaDiasFase = function(){
    $.each($(".timediv"), function(){
        var fila = $(this);
        var dias = 0;
        $.each($(".trAct",fila),function(){
            dias += parseInt($($("td",$(this))[2]).text());
        });
        fila.prev(".time-title").text(+dias+" days remaining");
    });
}

actualizaTimeline = function(stDate){

    var listActivities = Activities.find({}, {sort:{id:1}}).fetch();

    var fechaaTarea = stDate;
    $.each($(".timediv"), function(){
        var fila = $(this);
        fila.prev(".time-title");
        $.each($(".trAct",fila),function(){
            var dias = 86400000*parseInt($($("td",$(this))[2]).text());
            var idAct = parseInt($($("td",$(this))[0]).text());
            var estimated = dias+fechaaTarea;
            var actRes = $(".actResponsable",$($("td",$(this))[3])).val();
            fechaTarea = estimated;
            //console.log("fecha ",fechaTarea);
            var actDep = $.grep(listActivities, function(a){a.id == idAct});
            var tiempoDependencia = 0;
            if (actDep.dependecy && actDep.dependecy.length > 0){
                $.each(actDep.dependency, function(){
                    var dependencia = $.grep(listActivities, function(a){a.id == this});
                    tiempoDependencia += dependencia.time;
                });
            }
            if (tiempoDependencia > 0){
                estimated += 86400000*tiempoDependencia;
            }

            if (!edicionProyecto) {
                //Status.insert({project:Session.get("projectNumber"), activity:idAct, status:false, responsable:actRes, fechaEst: estimated});
                Meteor.call("updateActivitiesStatus",Session.get("projectNumber"),idAct,actRes,estimated,function(error,result){
                    if(error) console.log("Error, no se pudo actualizar el id de Actividad en Status");
                });
            } else {
                var reg = Status.find({project:Session.get("projectNumber"), "activity":idAct}).fetch();
                //Status.update(reg[0]["_id"],{$set:{fechaInicio:estimated}});
                Meteor.call("updateDateStatus2",reg[0]["_id"],estimated,function(error,result){
                    if (error) console.log("Error, no se pudo actualizar la fecha del proyecto");
                });
            }

            $($("td",$(this))[5]).text(formatoFechaLargo(new Date(estimated)));
            $($("td",$(this))[5]).data({"estimated":new Date(estimated).getTime()});
            fechaaTarea = estimated;
        });
    });
}

checkActivityDependency = function(actId){
    var actOn = Activities.find({id:actId}).fetch();
    if(actOn.length > 0) {
        if (actOn[0].dependency && actOn[0].dependency.length > 0) {
            return actOn[0].dependency;
        }
    }
    return [];
}

edicionStatus = function(){
    
    var listStatus = Status.find({project:Session.get("projectNumber"), fechaAccomp:{$exists:true}}).fetch();
    
    if (listStatus && listStatus.length > 0) {
        $.each(listStatus, function(ls, act){
            var task = $(".actid").filter(function() {
                return $(this).text() === ""+act.activity;
            });
            if (this.status){
                $(".checks-time", $(task).parent()).prop("checked",true);
                $(".real-time", $(task).parent()).text(formatoFechaLargo(new Date(this.fechaAccomp)));
            }
            
            if (task.length > 0){
                if (this.notes){
                    $(".notesActivity", $(task).parent()).text(this.notes);
                }
                if (this.fechaEst < this.fechaAccomp)
                    $(task).parent().css({"background-color":"red"});
                else if (this.fechaAccomp < this.fechaEst){
                    $(task).parent().css({"background-color":"green"});
                }
            }
        });
    }
}
  
editarProyecto = function(proyecto){
    
    if (proyecto.projectName)
        $("input[name='projectName']").val(proyecto.projectName);
    if (proyecto.installReason)
        $("input[name='installReason']").val(proyecto.installReason);
    if (proyecto.installReason)
        $("textarea[name='projectComments']").val(proyecto.projectComments);
    if (proyecto.installReason)
        $("input[name='contactName']").val(proyecto.contactName);
    if (proyecto.installReason)
        $("input[name='po']").val(proyecto.po);
    if (proyecto.proyectManager)
        $(".proyectManager").val(proyecto.proyectManager);
    if (proyecto.platform)
        $("select[name='platform']").val(proyecto.platform);
    if (proyecto.fechaInicio) {
        $(".stDate").datepicker("setDate",new Date(proyecto.fechaInicio));
        actualizaTimeline(proyecto.fechaInicio);
        edicionStatus();
    }
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