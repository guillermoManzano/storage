Proyectos = new Mongo.Collection("proyectos");
Equipos = new Mongo.Collection("equipos");
Tiers = new Mongo.Collection("tiers");
Discos = new Mongo.Collection("discos");  
Activities = new Mongo.Collection("activities");
Phases = new Mongo.Collection("phases");
Status = new Mongo.Collection("status");

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);


  $(document).ready(function() {
      /*$('#fullpage').fullpage({
        anchors: ['proys', 'fails', 'calc'],
        sectionsColor: ['rgb(233,233,233)', '#1BBC9B', '#7E8F7C'],
        css3: true,
        scrollOverflow: false
      });*/

      $("li.menu-link").click(function(){
        $("li.active").toggleClass("active");
        $(this).toggleClass("active");
      });

      edicionProyecto=false;
      proyects=[
      {
        id:'2015QRDC100ljao ds asd',
        name:'upgrd vnxai diajd lija idj li aildj',
        equipo:'AVAMAR',
        fechaInicio:'16/10/2015',
        fechaCompromiso:'26/10/2015',
        site:'QRDC'
      },
      {
        id:'2015JRDC320',
        name:'upgrd vnx',
        equipo:'VNX',
        fechaInicio:'10/10/2015',
        fechaCompromiso:'22/12/2015',
        site:'JRDC'
      },
      {
        id:'2015JRDC200',
        name:'upgrd vnx',
        equipo:'CELERA',
        fechaInicio:'10/10/2015',
        fechaCompromiso:'10/11/2015',
        site:'JRDC'
      }
      ];
      
    });


  Template.cuerpo.onCreated(function(){
    this.subscribe("proyectos");
    this.subscribe("discos");
    this.subscribe("tiers");
  });

  Template.cuerpo.onRendered(function(){
    Meteor.call("listaProyectos",function(error,result){
        var listProyectos = Proyectos.find().fetch();
        console.log("Lista de Proyectos",listProyectos);

        var source ={
          datatype: "json",
          datafields: [
            { name: '_id', type: 'string' },
            { name: 'id', type: 'string' },
            { name: 'projectName', type: 'string' },
            { name: 'equipo', type: 'string' },
            { name: 'fechaInicio', type: 'string' },
            { name: 'fechaCompromiso', type: 'string' },
            { name: 'site', type: 'string' }
          ],
          localdata: listProyectos
        };
        var dataAdapter = new $.jqx.dataAdapter(source);
        
        $("#proyectosGrid").jqxGrid({
                width: 1500,
                source: dataAdapter,                
                pageable: true,
                autoheight: true,
                filterable: true,
                //sortable: true,
                //altrows: true,
                enabletooltips: true,
                editable: false,
                //selectionmode: 'multiplecellsadvanced',
                columns: [
                  { text: 'PRID', datafield: '_id', hidden:true},
                  { text: 'ID', datafield: 'id', width: 250 },
                  { text: 'NAME', datafield: 'projectName', cellsalign: 'right', align: 'right', width: 200 },
                  { text: 'EQUIPMENT', datafield: 'equipo', align: 'right', cellsalign: 'right', cellsformat: 'c2', width: 200 },
                  { text: 'START DATE', datafield: 'fechaInicio', cellsalign: 'right', width: 100 },
                  { text: 'COMMITMENT DATE', datafield: 'fechaCompromiso' },
                  { text: 'SITE', datafield: 'site', width: 200 }
                ]
        });
      

      $('.fechaCompromiso').datepicker({"dateFormat": "dd/mm/yy"});
      //$(".fechaCompromiso").datepicker( "option", "dateFormat", "dd/mm/yyyy");
    });
  });

  /*
  **  CALCULADOR TERAS
  */
  Template.cuerpo.helpers({
      tasks: function () {
        return Discos.find({});
      },
      proys: function() {

        /*$("#proyectosGrid").jsGrid({
          width: "100%",
          filtering: true,
          editing: true,
          sorting: true,
          paging: true,
          data: listProyectos,
     
          fields: [
            { name: "id", type: "text"},
            { name: "name", type: "text"},
            { name: "equipo", type: "text"},
            { name: "fechaInicio", type: "text", title: "Fecha inicio"},
            { name: "fechaCompromiso", type: "text", title: "Fecha compromiso"},
            { name: "site", type: "text", title: "Site", sorting: true }
            //{ type: "control" }
          ]
        });*/

        return;
      }
    });

    Template.registerHelper('formatMoney', function(date) {
      return accounting.formatMoney(date);
    });

    Template.menu.events({
      "click .projects": function(evt){

        viewVar = Blaze.render(Template.cuerpo, $("body").get(0));
        console.log("VIEW ",viewVar);
        //Session.set("projectListView", view);
      }

    });

  Template.cuerpo.events({
    "submit .espacio-solicitado": function (event) {
      // This function is called when the new task form is submitted

      var text = event.target.espacio.value;
      console.log("usabltext ",text);
      if (isNaN(text)) {
        throw new Meteor.Error("not a number");
      }

      $(".tiers tbody").empty();
      console.log("TASKS ",Tiers.find().fetch());
      var disks = Discos.find().fetch();

      var filas = "";
      $.each(Tiers.find().fetch(), function(id, tier){console.log("EACH ",tier);
        filas+="<tr><td>"+tier.nombre+"</td>";
        filas+="<td class='right-align'>"+tier.sizeGB+"</td>";
        filas+="<td class='right-align'>"+accounting.formatNumber((tier.sizeGB)*1024)+"</td>";
        filas+="<td class='right-align'>"+accounting.formatMoney((tier.sizeGB)*text)+"</td>";
        filas+="<td class='center-align'>"+Math.ceil(((tier.sizeGB*text)/(disks[0].precio*0.45))/2.0)*2+"</td>";
      });
      filas += "</tr>";
      console.log("FILAS ",filas);
      $("#tablaTiers").append(filas);
      $("#tiers-container").show();

      var usables = $("input[type='radio']:checked").parent().siblings(".usable").text();
      console.log("USABLES ",usables);
      var cantDiscos = text/usables;
      var precio = accounting.unformat($("input[type='radio']:checked").parent().siblings(".precio").text());
      var costo = cantDiscos*precio;
      var desc = costo*0.55;

      console.log("cantDiscos ",cantDiscos);
      console.log("precio ",precio);

      $("#res-discos").text(cantDiscos);
      $("#res-costo").text(accounting.formatMoney(costo));
      $("#res-desc").text(accounting.formatMoney(desc));
      $("#res-total").text(accounting.formatMoney(costo-desc));
      $("#resultados").show();
      /*Tasks.insert({
        text: text,
        createdAt: new Date() // current time
      });
      */
      // Clear form
      //event.target.text.value = "";

      // Prevent default form submit
      return false;
    }
  });

  Template.menu.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.menu.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });

  Template.modalNuevo.events({
    'click .request-submit':function(evt){
      if (!Session.get("startProject")) {

        Session.set("startProject",true);
        cob = $(".checks[name='cob'").is(':checked'); 
        pp = $(".checks[name='pp'").is(':checked'); 
        np = $(".checks[name='np'").is(':checked'); 
        sp = $(".checks[name='sp'").is(':checked');
        Session.set("newRequestOpts",{"cob":cob, "pp":pp,"np":np,"sp":sp});

        $(".project-section.left").remove();
        var locationDiv = '<div class="project-section left"><table class="right">'+
          '<tr><td class="texto-tabla">Region</td><td class="texto-tabla"><select class="modalSelect" name="region"><option>Latam</option></select></td></tr>'+
          '<tr><td class="texto-tabla">Country</td><td class="texto-tabla"><select class="modalSelect" name="country"><option>Mexico</option></select></td></tr>'+
          '<tr><td class="texto-tabla">City</td><td class="texto-tabla"><select class="modalSelect" name="city"><option>CDMX</option></select></td></tr>'+
          '<tr><td class="texto-tabla">Building</td><td class="texto-tabla"><select class="modalSelect" name="building"><option>Jardines</option></select></td></tr>'+
          '<tr><td class="texto-tabla">Floor</td><td class="texto-tabla"><select class="modalSelect" name="floor"><option>2</option></select></td></tr>'+
          '<tr><td class="texto-tabla">Data Center</td><td class="texto-tabla"><select class="modalSelect" name="dataCenter"><option>Jardines</option></select></td></tr>'+
          '<tr><td class="texto-tabla">Site category</td><td class="texto-tabla"><select class="modalSelect" name="category"><option>Data center</option></select></td></tr>'+
          '</table></div>';
        var locationDiv2 = '<div class="project-section right"><table class="right">'+
          '<tr><td class="texto-tabla">Region</td><td class="texto-tabla"><select class="modalSelect" name="region"><option>Latam</option></select></td></tr>'+
          '<tr><td class="texto-tabla">Country</td><td class="texto-tabla"><select class="modalSelect" name="country"><option>Mexico</option></select></td></tr>'+
          '<tr><td class="texto-tabla">City</td><td class="texto-tabla"><select class="modalSelect" name="city"><option>CDMX</option></select></td></tr>'+
          '<tr><td class="texto-tabla">Building</td><td class="texto-tabla"><select class="modalSelect" name="building"><option>Jardines</option></select></td></tr>'+
          '<tr><td class="texto-tabla">Floor</td><td class="texto-tabla"><select class="modalSelect" name="floor"><option>2</option></select></td></tr>'+
          '<tr><td class="texto-tabla">Data Center</td><td class="texto-tabla"><select class="modalSelect" name="dataCenter"><option>Jardines</option></select></td></tr>'+
          '<tr><td class="texto-tabla">Site category</td><td class="texto-tabla"><select class="modalSelect" name="category"><option>Data center</option></select></td></tr>'+
          '</table></div>';
        $(".titleDiv > .title").text("Production Location");
        if (cob) {
          $('<a class="title">Cob Location</a>').insertAfter(".titleDiv > .title");
          $(locationDiv2).insertAfter(".titleDiv");
          $(locationDiv).insertAfter(".titleDiv");

          $(".project-section").css("width","50%");
          $(".projectOptions a.title").css("width","50%");

        } else {
          $(locationDiv).insertAfter(".titleDiv");
        }
      } else {
        try {
          //var resPro = Proyectos.insert({projectName:"Test2", "opts":});
          var resPro;
          Meteor.call('newProject',Session.get("newRequestOpts"),function(error,result){

            if(error) { console.log("Error al crear el nuevo proyecto"); }
            else {
              Session.set('idProyecto',result); 
              Session.set("creatingProject",true);
              Session.set("projectNumber",Session.get('idProyecto'));
              console.log("id del nuevo proyecto: ", Session.get('projectNumber'));
            }
          });

        
        } catch(err) {
          alert("ERROR "+err);
        }
        Blaze.remove(modalView);
        newRequestView = Blaze.render(Template.newRequest, $("body").get(0));
      }
    }
  });

  Template.newRequest.events({
    'change .projectInfo': function(evt){
      var fieldName = $(evt.target).attr("name");
      var fieldVal = $(evt.target).val().trim();
      var updateObj = {};
      updateObj[fieldName] = fieldVal;
      console.log("CHANGE2 ",updateObj);
      if (fieldVal != "") {
        try{
          //Proyectos.update(Session.get("projectNumber"),{$set:updateObj});
          Meteor.call("updateProject",Session.get("projectNumber"),updateObj,function(error,result){
            if(error) console.log("Error al editar el nombre del proyecto");
          });
        } catch(err){
          console.log("Error updating project info",err);
        }
      }
    },

    'click .notesActivity': function(evt){

    },

    'click .checks-time': function(evt){
      if ($(".stDate").val() == undefined || $(".stDate").val() == ""){
        $(evt.target).prop("checked",false);
        alert("Select project start date.");
      } else {
        var actStatus = $(evt.target).prop("checked");
        var actId = parseInt($(evt.target).parent().siblings(".actid").text());
        var actRes = $(evt.target).parent().prev("td").children(".actResponsable").val();
        var accomplished = new Date(new Date().setHours(0,0,0,0));
        
        $(evt.target).parent().parent();
        var canCheck = true;
        if (actStatus){
          var deps = checkActivityDependency(actId);
          if (deps.length > 0) {
            for (var nn=0;nn<deps.length;nn++){
              var depRow = $(".actid").filter(function() {
                  return $(this).text() === ""+deps[nn];
              });
              var depStatus = $(".checks-time",$(depRow).parent()).prop("checked");
              if (!depStatus){
                canCheck = false;
                $(evt.target).prop("checked",false);
                alert("Check dependencies!");
                break;
              }
            }
          }
        }

        if (canCheck) {
          var statusEx = Status.find({project:Session.get("projectNumber"), "activity":actId}).fetch();
          if (statusEx.length < 1){
            try {
              //Status.insert({project:Session.get("projectNumber"), activity:actId, status:actStatus, responsable:actRes, fechaAccomp:accomplished.getTime()});
              Meteor.call("insertStatus",Session.get("projectNumber"),actId,actStatus,actRes,accomplished.getTime(),function(error,result){
                if(error) console.log("Error al insertar Status");
                else{
                  $(evt.target).parent().siblings(".real-time").text(formatoFechaLargo(accomplished));
                  var est = $($("td",$(evt.target).parent().parent())[5]).data("estimated");
                  if (est < accomplished.getTime()){
                    $(evt.target).parent().parent().css({"background-color":"red"});
                  }else if (est > accomplished.getTime()){
                    $(evt.target).parent().parent().css({"background-color":"green"});
                  }

                }
              });
              
            } catch(err){
              console.log("ERROR INSERT STATUS",err);
            }
          } else {
            try {
              var fechaStatus = statusEx[0].fechaEst;
              $(evt.target).parent().siblings(".real-time").text(formatoFechaLargo(accomplished));
                //fechaStatus = "";
              if (!actStatus){
                $(evt.target).parent().siblings(".real-time").text("");
                $(evt.target).parent().parent().css({"background-color":"white"});
                Meteor.call("updateStatus",statusEx[0]["_id"],actStatus,actRes,function(error,result){
                  if(error) console.log("No se pudo actualizar el Status");
                });
                //Status.update(statusEx[0]["_id"],{$set:{status:actStatus, responsable:actRes}});
                Meteor.call("updateDateStatus",statusEx[0]["_id"],function(error,result){
                  if(error) console.log("No se pudo actualizar la fecha del Status");
                });
                //Status.update(statusEx[0]["_id"],{$unset:{fechaAccomp:{$exists:true}}});
              } else {
                var est = $($("td",$(evt.target).parent().parent())[5]).data("estimated");
                if (est < accomplished.getTime()){
                  $(evt.target).parent().parent().css({"background-color":"red"});
                }else if (est > accomplished.getTime()){
                  $(evt.target).parent().parent().css({"background-color":"green"});
                }
                Meteor.call("updateNewStatus",statusEx[0]["_id"],actStatus,actRes,accomplished.getTime(),function(error,result){
                  if(error) console.log("No se pudo actualizar el Status");
                });
                //Status.update(statusEx[0]["_id"],{$set:{status:actStatus, responsable:actRes, fechaAccomp:accomplished.getTime()}});
              }
            }catch(err){
              console.log("ERROR EDIT STATUS",err);
            }
          }
        }
      }
    },

    'change .stDate':function(evt){
      /*REMOVE*/

    },

    'click .back': function(evt){ 
      console.log("EBACK ",edicionProyecto);
      if (edicionProyecto) {
        try {
          edicionProyecto = false;
          Blaze.remove(newRequestView);
          viewVar = Blaze.render(Template.cuerpo, $("body").get(0));
        } catch (err){
          alert("Oops, Something went wrong!");
        }
      } else {
        if(confirm("Dismiss project?")){
          Session.set("creatingProject");
          try {
            Meteor.call('dismissProject',Session.get("projectNumber"),function(error,result){
              if(error) console.log("Error al borrar el proyecto");
              //Proyectos.remove({_id:Session.get("projectNumber")});
              edicionProyecto = false;
              Blaze.remove(newRequestView);
              viewVar = Blaze.render(Template.cuerpo, $("body").get(0));

            });
            
          } catch (err){
            alert("Oops, Something went wrong!");
          }
        }
      }
    },

    'click .agregar-recurso':function(){
      if ($('.human-resources').val().indexOf($('.human-resource').val()) == -1){
        $('.human-resources').append($('.human-resource').val()+"\n");
      }
    },

    'click .checks':function(evt){

      if(!$(".checks[name='dev-ips'").is(':checked'))
        $(".tabs-device").tabs( "disable", "#dtabs-4" );
      else
        $(".tabs-device").tabs( "enable", "#dtabs-4" );
      
      if(!$(".checks[name='dev-conf'").is(':checked'))
        $(".tabs-device").tabs( "disable", "#dtabs-2" );
      else
        $(".tabs-device").tabs( "enable", "#dtabs-2" );
        
      if(!$(".checks[name='dev-conn'").is(':checked'))
        $(".tabs-device").tabs( "disable", "#dtabs-5" );
      else
        $(".tabs-device").tabs( "enable", "#dtabs-5" );
      
      if(!$(".checks[name='dev-strg'").is(':checked'))
        $(".tabs-device").tabs( "disable", "#dtabs-6" );
      else
        $(".tabs-device").tabs( "enable", "#dtabs-6" );
      
    },
    'click .addDevice':function(evt){
      
      var idProy = Session.get("projectNumber");
      var newDevice = {project:idProy};

      newDevice.devFamily = $(".devFamily").val();
      newDevice.devModel = $(".devModel").val();
      newDevice.devSite = $(".devSite").val();
      newDevice.devTipo = $(".tipoEq").val();
      newDevice.devName = $(".nombreEq").val();
      newDevice.devSerial = $(".snEq").val();
      newDevice.devAperture = $(".apertureEq").val();
      newDevice.devInvoice = $(".invoiceEq").val();
      newDevice.devCoord = $(".coorEq").val();
      newDevice.devServReq = $(".srEq").val();
      newDevice.devNotes = $(".notesEq").val();
      newDevice.devMicro = $(".devMC").val();
      newDevice.devCate = $(".devCate").val();
      newDevice.devQuantPC = $(".quantityPC").val();
      newDevice.devConnTypePC = $(".connectorTypePC").val();
      newDevice.devPhasePC = $(".fasesPC").val();
      newDevice.devVoltPC = $(".voltajePC").val();

      var power =[];
      $.each($(".lineaPP"), function(){
        var pp = {
          quantityPP: $(".quantityPP", $(this)).val(),
          connectorTypePP: $(".connectorTypePP", $(this)).val(),
          fasesPP: $(".fasesPP", $(this)).val(),
          voltajePP: $(".voltajePP", $(this)).val()
        };
        power.push(pp);
      });
      newDevice.power = power;

      var ips =[];
      $.each($(".lineaIP"), function(){
        var ip = {
          devSubnet: $(".devSubnet", $(this)).val(),
          devIP: $(".devIP", $(this)).val(),
          devMask: $(".devMask", $(this)).val(),
          devGateway: $(".devGateway", $(this)).val(),
          devDns: $(".devDns", $(this)).val()
        };
        ips.push(ip);
      });
      newDevice.ips = ips;

      var cabling =[];
      $.each($(".lineaPC"), function(){
        var cable = {
          quantityPC: $(".quantityPC", $(this)).val(),
          connTypePC: $(".connTypePC", $(this)).val(),
          cableTypePC: $(".cableTypePC", $(this)).val(),
          speedPC: $(".speedPC", $(this)).val(),
          lengthPC: $(".lengthPC", $(this)).val()
        };
        cabling.push(cable);
      });
      newDevice.cabling = cabling;

      var strg =[];
      $.each($(".lineaStrg"), function(){
        var st = {
          quantDisk: $(".quantDisk", $(this)).val(),
          typeDisk: $(".typeDisk", $(this)).val(),
          capDisk: $(".capDisk", $(this)).val(),
          raidDisk: $(".raidDisk", $(this)).val()
        };
        strg.push(st);
      });
      newDevice.storage = strg;

      try {
        //Equipos.insert(newDevice);
        Meteor.call("newEquipo",newDevice,function(error,result){
          if(error) console.log("No se pudo insertar el equipo");
          else{
            var listEquipos = Equipos.find({project:Session.get("projectNumber")}).fetch();
            console.log("Lista de equipos para este proyecto",listEquipos);
            var source ={
              datatype: "json",
              datafields: [
                { name: '_id', type: 'string' },
                { name: 'devName', type: 'string' },
                { name: 'devFamily', type: 'string' },
                { name: 'devModel', type: 'string' },
                { name: 'devTipo', type: 'string' },
                { name: 'devSite', type: 'string' }
              ],
              localdata: listEquipos
            };
            var dataAdapterDev = new $.jqx.dataAdapter(source);
            $(".deviceTable").jqxGrid({source:dataAdapterDev});

          }
        });
      
      } catch(err) {
        alert("ERROR "+err);
      }
    }


  });

  Template.newRequest.onCreated(function(){
    this.subscribe("proyectos");
    this.subscribe("equipos");
    this.subscribe("phases");
    this.subscribe("activities");
    this.subscribe("status");
  });

  Template.newRequest.onRendered(function(){

    Meteor.call("editProyecto", function(){
    opts = Session.get("newRequestOpts");
    console.log("OPTs ",opts);
    console.log("OPT1 ",opts.pp);
    console.log("OPT2 ",opts.sp);
    console.log("OPT3 ",opts.np);

    var listPhases = Phases.find({},{sort:{order:1}}).fetch();
    var listActivities = Activities.find({}, {sort:{id:1}}).fetch();

    var divFase = "";
    $.each(listPhases, function(x,obj){
      divFase += "<h3 class='time-title'>"+obj.phaseName+"</h3><div class='timediv'><table class='timetable'><tr><th>Activity</th><th>Days</th><th>Responsable</th><th>Status</th><th>Estimated date</th><th>Accomplished date</th><th>Notes</th></tr>";
      var actividadesFase = $.grep(listActivities, function(a,b){
        return a.phase == obj.id;
      });

      $.each(actividadesFase, function(y, act){
        var dep = -1;
        if (act.dependency && act.dependency.length > 0){

        } 
        divFase += "<tr class='trAct'><td class='actid' style='display:none;'>"+act.id+"</td><td>"+act.actName+"</td><td>"+act.time+"</td><td><select class='actResponsable'><option>Michel</option><option>Alfredo</option></select></td><td><input class='checks checks-time' type='checkbox'/></td><td class='estimated-time'></td><td class='real-time'></td><td><textarea class='notesActivity'></textarea></td></tr>";
      });
      divFase += "</table></div>";
    });
    $(".accordion_timeline").append(divFase);
    
    $('.stDate').datepicker({
      "dateFormat": "dd/mm/yy",
      
      onSelect: function(dateText) {
        console.log("Selected date: " + dateText + "; input's current value: " + this.value);
        var projectStart = $(".stDate").datepicker("getDate").getTime();
        //Proyectos.update(Session.get("projectNumber"),{$set:{"fechaInicio":projectStart}});
        Meteor.call("updateDateProject",Session.get("projectNumber"),projectStart,function(error,result){
          if(error) console.log("No se pudo actualizar la fecha");
        });
        actualizaTimeline(projectStart);
      }
    });
    $(".accordion_timeline").accordion();

    $('.projectComments').on({
      "click": function() {
        console.log("CLICK( ",$(this));
        if ($(this).val().trim() != "") {
          console.log("entro2( ",$(this).val());
          $(this).tooltip({ items: ".projectComments", content: $(this).val()});
          console.log("open2 ");
          $(this).tooltip("open");
        }
      },
      "mouseout": function() {      
        if ($(this).val().trim() != "") {
          $(this).tooltip("disable");   
        }
      }
    });

    $('.notesActivity').on({
      "click": function() {
        console.log("CLICK( ",$(this));
        if ($(this).val().trim() != "") {
          console.log("entro( ",$(this).val());
          $(this).tooltip({ items: ".notesActivity", content: $(this).val()});
          console.log("open ");
          $(this).tooltip("open");
        }
      },
      "mouseout": function() {      
        if ($(this).val().trim() != "") {
          $(this).tooltip("disable");   
        }
      },
      "change":function(){
        var actid = parseInt($(this).parent().siblings(".actid").text());
        var reg = Status.find({project:Session.get("projectNumber"), "activity":actid}).fetch();
        try {
          //Status.update(reg[0]["_id"],{$set:{notes:$(this).val().trim()}});
          Meteor.call("updateNotesStatus",reg[0]["_id"],$(this).val().trim(),function(error,result){
            if(error) console.log("No se pudo actualizar notes en Status");
          });
        }catch(err){
          console.log("Update notes status: ",err);
        }
      }
    });

      
    $(".tabs").tabs();
    $(".tabs-device").tabs();

    if (!opts.np)
        $(".tabs-device").tabs( "disable", "#dtabs-4" );
        
    if (!opts.pp)
        $(".tabs-device").tabs( "disable", "#dtabs-3" );

    if (!opts.sp)
        $(".tabs-device").tabs( "disable", "#dtabs-6" );
      

    var listEquipos = Equipos.find({project:Session.get("projectNumber")}).fetch();
        console.log("Lista de Equipos ",listEquipos);
        var source ={
          datatype: "json",
          datafields: [
            { name: '_id', type: 'string' },
            { name: 'devName', type: 'string' },
            { name: 'devFamily', type: 'string' },
            { name: 'devModel', type: 'string' },
            { name: 'devTipo', type: 'string' },
            { name: 'devSite', type: 'string' }
          ],
          localdata: listEquipos
        };
    var dataAdapterDev = new $.jqx.dataAdapter(source);
        

    $(".deviceTable").jqxGrid({
      width: '80%',
      source: dataAdapterDev,                
      pageable: true,
      autoheight: true,
      filterable: true,
      //sortable: true,
      //altrows: true,
      enabletooltips: true,
      editable: false,
      //selectionmode: 'multiplecellsadvanced',
      columns: [
        { text: 'ID', datafield: '_id', width: 250, hidden:true },
        { text: 'NAME', datafield: 'devName', cellsalign: 'right', align: 'right', width: 200 },
        { text: 'FAMILY', datafield: 'devFamily', align: 'right', cellsalign: 'right', cellsformat: 'c2', width: 200 },
        { text: 'MODEL', datafield: 'devModel', cellsalign: 'right', width: 100 },
        { text: 'TIPO', datafield: 'devTipo' },
        { text: 'SITE', datafield: 'devSite', width: 200 }
      ]
    });

    $(".deviceTable").on('rowselect', function (event) {
      console.log("EVTS ",event.args);
      var dataEq = Equipos.find({_id:event.args.row._id}).fetch()[0];
      $(".devFamily").val(dataEq.devFamily);
      $(".devModel").val(dataEq.devModel);
      $(".devSite").val(dataEq.devSite);
      $(".tipoEq").val(dataEq.devTipo);
      $(".nombreEq").val(dataEq.devName);
      $(".snEq").val(dataEq.devSerial);
      $(".apertureEq").val(dataEq.devAperture);
      $(".invoiceEq").val(dataEq.devInvoice);
      $(".coorEq").val(dataEq.devCoord);
      $(".srEq").val(dataEq.devServReq);
      $(".notesEq").val(dataEq.devNotes);
      $(".devMC").val(dataEq.devMicro);
      $(".devCate").val(dataEq.devCate);
      $(".quantityPC").val(dataEq.devQuantPC);
      $(".connectorTypePC").val(dataEq.devConnTypePC);
      $(".fasesPC").val(dataEq.devPhasePC);
      $(".voltajePC").val(dataEq.devVoltPC);

      $.each(dataEq.power, function(){

          $(".quantityPP").val(this.quantityPP);
          $(".connectorTypePP").val(this.connectorTypePP);
          $(".fasesPP").val(this.fasesPP);
          $(".voltajePP").val(this.voltajePP);
        
      });

      $.each(dataEq.ips, function(){
        
          $(".devSubnet").val(this.devSubnet);
          $(".devIP").val(this.devIP);
          $(".devMask").val(this.devMask);
          $(".devGateway").val(this.devGateway);
          $(".devDns").val(this.devDns);
        
      });

      $.each(dataEq.cabling, function(){

          $(".quantityPC").val(this.quantityPC);
          $(".connTypePC").val(this.connTypePC);
          $(".cableTypePC").val(this.cableTypePC);
          $(".speedPC").val(this.speedPC);
          $(".lengthPC").val(this.lengthPC);
        
      });
      
      $.each(dataEq.storage, function(){

          $(".quantDisk").val(this.quantDisk);
          $(".typeDisk").val(this.typeDisk);
          $(".capDisk").val(this.capDisk);
          $(".raidDisk").val(this.raidDisk);

      });

    });
    
    Inputmask("numeric").mask(".numberMask");
    Inputmask("ip").mask(".ipMask");

    if (edicionProyecto){
      var edit = Proyectos.find({_id:Session.get("projectNumber")}).fetch();
      editarProyecto(edit[0]);
    }
    opts =  null; 



    });
  });

  Template.modalNuevo.onRendered(function(){
    $(".modalProject").animate({opacity:"1"},2000);
  });

  Template.header.events({
    'click #headerLogo': function(){
      if (Session.get("creatingProject")) {
        if(confirm("Dismiss project?")){
          Session.set("creatingProject");
          try {
            //Proyectos.remove({_id:Session.get("projectNumber")});
            Meteor.call("dismissProject",Session.get("projectNumber"),function(error,result){
              if(error) console.log("Error, no se pudo eliminar el proyecto");
            });
            Blaze.remove(newRequestView);
          } catch (err){
            alert("Oops, Something went wrong!");
          }
        }
      } else {
        Blaze.remove(viewVar);
      }
    }
  });

  Template.cuerpo.events({
    'click .nuevo-button':function(){
      console.log("viewVar ",viewVar);
      Blaze.remove(viewVar);
      modalView = Blaze.render(Template.modalNuevo, $("body").get(0));
     /* $(".divEquipos").empty();$(".divPP").empty();$('.div-sn').empty();$(".divPC").empty();
      $(".hdSumDiv").hide();
      $("#proyectos-container").hide();
      //$("#nuevo-proyecto").slimscroll({ height: 'auto' });
      $("#nuevo-proyecto").show();
      edicionProyecto=false;*/
    },

    'click .editar-button':function(){
      Session.set("creatingProject",true);
      var rowId = $("#proyectosGrid").jqxGrid('getselectedrowindex');
      
      var proyId = $("#proyectosGrid").jqxGrid('getrowdatabyid',rowId)._id
      var proyecto = Proyectos.find({_id:proyId}).fetch();
      Blaze.remove(viewVar);
      console.log("Edición del Proyecto: ",proyecto);
      Session.set("projectNumber",proyecto[0]["_id"]);
      Session.set("newRequestOpts",proyecto[0].opts);
      newRequestView = Blaze.render(Template.newRequest, $("body").get(0));
      edicionProyecto=true;
      //editarProyecto(proyecto[0]);


      /*$(".divEquipos").empty();$(".divPP").empty();$('.div-sn').empty();$(".divPC").empty();
      
      $("#proyectos-container").hide();
      //$("#nuevo-proyecto").slimscroll({ height: 'auto' });
      $(".hdSumDiv").show();
      $("#nuevo-proyecto").show();*/
    },

    'click .volver-proyectos':function(){
      $("#nuevo-proyecto").hide();
      $("#proyectos-container").show();
    },

    'click .agregarRequirement':function(){
      var textoReq = "<p class='texto-campo'>Description</p><input class='descReq valor-campo' type='text'/>"+
                      "<p class='texto-campo'>For</p><input class='forReq valor-campo' type='text'/>"+
                      "<p class='texto-campo'>Value</p><input class='valueReq valor-campo' type='text'/><br>";
      $(".divReq").append(textoReq);
    },

    'click .agregarProfile':function(){
      var textoProfile = "<br><br><p class='texto-campo'>Name</p><input class='profileName valor-campo' type='text'/>"+
                        "<p class='texto-campo'>Profile</p><select style='float:left;' class='profileValue'><option>Project Manager</option><option>Architect</option><option>Implement</option><option>Citi owner</option></select>"+
                        "<p class='texto-campo'>E-mail</p><input class='profileMail valor-campo' type='text'/>"+
                        "<p class='texto-campo'>Phone</p><input class='profileMail valor-campo' type='text'/><br><br>"+
                        "<p class='texto-campo'>Responsable</p><input class='respName valor-campo' type='text'/>"+
                        "<p class='texto-campo'>E-mail</p><input class='respMail valor-campo' type='text'/>"+
                        "<p class='texto-campo'>Phone</p><input class='respPhone valor-campo' type='text'/>";
      $(".projectTeam").append(textoProfile);
    },

    'click .agregarActividad':function(){
      var textoAct = "<p class='texto-campo'>Description</p><input class='tlDesc valor-campo' type='text'/>"+
                    "<p class='texto-campo'>Change</p><input class='actChng valor-campo' type='text'/>"+
                    "<p class='texto-campo'>Status</p><select style='float:left;' class='tlStatus'><option>Created</option><option>Approved</option></select>"+
                    "<p class='texto-campo'>Window start</p><input class='actWin valor-campo' type='text'/>"+
                    "<p class='texto-campo'>Time</p><input class='actTime valor-campo' type='text'/><br><br>"+
                    "<p class='texto-campo'>Timeline</p><div class='divbtn agregarTimeline'>Add activity</div><br><br><div class='actList'></div>";
      $(".activities").append(textoAct);
      $('.actWin').datepicker({"dateFormat": "dd/mm/yy"});
    },

    'click .agregarTimeline':function(){
      var textoActiv = "<p class='texto-campo'>Description</p><input class='actDesc valor-campo' type='text'/>"+
                      "<p class='texto-campo'>Status</p><input class='actStatus valor-campo' type='text'/><br><br>";
      $(".actList").append(textoActiv);
    },

    'click .agregarEquipo':function(){
      var textoEq = "";
      var tipoEq = "";//$(".equipo-select").val();
      var cantEq = 1//$(".cantidadEq").val();
      console.log("CANTEQ ",cantEq);
      for (var x=0;x<cantEq;x++) {
        textoEq += "<br/><div class='lineaSN'><p class='texto-campo'>Family</p><select class='select-proyecto equipo'><option value='VNX'>VNX</option><option value='VMAX'>VMAX</option><option value='CENTERA'>CENTERA</option><option value='DATA DOMAIN'>DATA DOMAIN</option><option value='CLARION'>CLARION</option><option value='SWITCHES'>SWITCHES</option></select>"+
        "<p class='texto-campo'>Model</p><select class='select-proyecto equipo'><option value='vnx5000'>vnx5000</option><option value='vnx40'>vnx40</option><option value='vnx100'>vnx100</option></select>"+
        "<p class='texto-campo' style='float:left;'>Site</p><select class='site' style='float:left;'><option value='jrdc'>JRDC</option><option value='qrdc'>QRDC</option></select><br/><br/>"+
        "<p class='texto-campo'>Tipo</p><input class='tipoEq valor-campo' type='text' value='"+tipoEq+"'/>"+
        "<p class='texto-campo'>Device Name</p><input class='nombreEq valor-campo' type='text'/>"+
        "<p class='texto-campo'>Serial Number</p><input class='snEq valor-campo' type='text'/>"+
        "<p class='texto-campo'>Aperture</p><input class='apertureEq valor-campo' type='text'/><br/><br/>"+
        "<p class='texto-campo'>Invoice</p><input class='invoiceEq valor-campo' type='text'/>"+
        "<p class='texto-campo'>Grid location</p><input class='coorEq valor-campo' type='text'/>"+
        "<p class='texto-campo'>Service Request</p><input class='srEq valor-campo' type='text'/>"+
        "<p class='texto-campo'>Notes</p><input class='notesEq valor-campo' type='text'/><br/><br/>"+
        "<div class='sub-seccion'><p class='titulo' style='float:left;'>Power Cabling</p><div class='divbtn agregarPC'>Add cabling</div><br/><br/><div class='divPC'></div></div>"+
        "<div class='sub-seccion div-network'><p class='titulo' style='float:left;'>Network</p><div class='divbtn agregar-network'>Add network</div><br><div class='campos-network'></div></div></div>";
      }
      //textoEq += "</div>";
      $(".divEquipos").append(textoEq);
    },

    'click .agregar-sn':function(){//alert("SHI");
      var textoSR = "<div class='lineaSN'><p class='texto-campo'>Service Now</p><input class='sn valor-campo' type='text'/><p class='texto-campo'>Incident</p><input class='incident valor-campo' type='text'/></div><br/>";
        $('.div-sn').append(textoSR);
    },

    'click .agregar-recurso':function(){
      if ($('.human-resources').val().indexOf($('.human-resource').val()) == -1){
        $('.human-resources').append($('.human-resource').val()+"\n");
      }
    },

    'click .agregarPP':function(){
      var textoPP = "<div class='lineaPP'><p class='texto-campo'>Site</p><input class='valor-campo modeloPP' type='text'/><select class='tipoPP'><option>Nuevo</option><option>Upgrade</option></select><p class='texto-campo'>Power consumption</p><input class='valor-campo consumptionPP' type='text'/><br/>";
      $(".divPP").append(textoPP);
    },

    'click .agregarPC':function(evt){
      var textoPC = "<div class='lineaPC'><p class='texto-campo'>Cantidad</p><input class='valor-campo cantidadPC' type='text'/><p class='texto-campo'>Tipo de conector</p><input class='valor-campo tipoPC' type='text'/><p class='texto-campo'>Fases</p><input class='valor-campo fasesPC' type='text'/><p class='texto-campo'>Voltaje</p><input class='valor-campo voltajePC' type='text'/></div><br/>";
      $(".divPC", $(evt.target).parent()).append(textoPC);
    },

    'click .agregar-network':function(evt){
      var cant = 1//$(".cantidad").val();
      var valor = $(".network-select").val();
      var divN = $(".campos-network", $(evt.target).parent());
      var campos = "";
      var descripcion = $(".descripcion-network").val();
      console.log("cant ",cant);
      console.log("valor ",valor);
      console.log("divn ",divN);
      if (cant!==""){
        /*if (descripcion !== ""){
          divN.append("<br/><p>"+valor+"</p>");
          divN.append("<p>"+descripcion+"</p><br/>");
        }*/
        campos += "<br><br><p class='texto-campo'>Description</p><input class='valor-campo descNw' type='text'/>"+
          "<p class='texto-campo'>Type</p><select style='float:left;' class='network-select'><option>UTP 1Gb</option><option>FIBRA 10Gb</option><option>VP LOGICS</option></select>"+
          "<p class='texto-campo'>Connector</p><input class='valor-campo tipoConector' type='text'/><br><br>"+
          "<p class='texto-campo'>Origin</p><input class='valor-campo origenCable' type='text'/>"+
          "<p class='texto-campo'>Destiny</p><input class='valor-campo destinoCable' type='text'/><br><br>"+
          "<div class='divbtn agregarIps'>Add IP</div><br/><br/><div class='ipDetails'></div>";
        /*if(valor.indexOf('FIBRA') != -1){
          campos += "<p class='texto-campo'>Description</p><input class='valor-campo descNw' type='text'/>"+
          "<select class='network-select'><option>UTP 1Gb</option><option>FIBRA 10Gb</option><option>VP LOGICS</option></select>"+
          "<p class='texto-campo'>Cable type</p><input class='valor-campo tipoCable' type='text'/>"+
          "<p class='texto-campo'>Connector type</p><input class='valor-campo tipoConector' type='text'/>"+
          "<p class='texto-campo'>Origin</p><input class='valor-campo origenCable' type='text'/>"+
          "<p class='texto-campo'>Destiny</p><input class='valor-campo destinoCable' type='text'/><br/>"+
          "<p class='texto-campo'>Subnet</p><input class='valor-campo subnet' type='text'/>"+
          "<p class='texto-campo'>IP</p><input class='valor-campo cableIp' type='text'/>"+
          "<p class='texto-campo'>Mask</p><input class='valor-campo mask' type='text'/>"+
          "<p class='texto-campo'>Default gateway</p><input class='valor-campo defGateway' type='text'/><br/>"+
          "<p class='texto-campo'>DNS details</p><input class='valor-campo dnsDetails' type='text'/><div class='divbtn agregarIps'>Add ips</div><br/><br/><div class='ipDetails'></div>";
        }else if(valor.indexOf('UTP')!= -1){
          campos += "<p class='texto-campo'>Origen</p><input class='valor-campo origen-fibra' type='text'/>"+
          "<p class='texto-campo'>Destino</p><input class='valor-campo destino-fibra' type='text'/>"+
          "<p class='texto-campo'>Zona</p><input class='valor-campo zona-fibra' type='text'/><br/>";
        }else if(valor.indexOf('VP LOGICS') != -1){
          campos += "<p class='texto-campo'>IP</p><input class='valor-campo ip-fibra' type='text'/>"+
          "<p class='texto-campo'>Subnet Mask</p><input class='valor-campo subnet-fibra' type='text'/>"+
          "<p class='texto-campo'>Gateway</p><input class='valor-campo gw-fibra' type='text'/><br/>";
        }*/
        
        for (var x=0;x<cant;x++) {
          divN.append(campos);
        }
      }
    },

    'click .agregarIps':function(evt){
      console.log("d ",$(evt.target).siblings(".ipDetails"));
      var textoIp = "<div class='divIp'><p class='texto-campo'>Subnet</p><input class='valor-campo subnet' type='text'/>"+
          "<p class='texto-campo'>IP</p><input class='valor-campo cableIp' type='text'/>"+
          "<p class='texto-campo'>Mask</p><input class='valor-campo mask' type='text'/><br><br>"+
          "<p class='texto-campo'>Default gateway</p><input class='valor-campo defGateway' type='text'/>"+
          "<p class='texto-campo'>DNS details</p><input class='valor-campo dnsDetails' type='text'/><br><br></div><br>";
      $(evt.target).siblings(".ipDetails").append(textoIp);
    },

    'click .guardar':function(){
      var proyectoNuevo = {};
      proyectoNuevo.id=$(".site").val()+"-"+$(".projectName").val()+"-"+$(".serialNumber").val();
      
      if ($(".projectName").val() !== "")
        proyectoNuevo.projectName= $(".projectName").val();
      if ($(".proyectManager").val() !== "")
        proyectoNuevo.proyectManager= $(".proyectManager").val();
      if ($(".plataforma").val() !== "")
        proyectoNuevo.plataforma= $(".plataforma").val();
      if ($(".equipo").val() !== "")
        proyectoNuevo.equipo= $(".equipo").val();
      if ($(".tipoProyecto").val() !== "")
        proyectoNuevo.tipoProyecto= $(".tipoProyecto").val();
      if ($(".cmu").val() !== "")
        proyectoNuevo.cmu= $(".cmu").val();
      if ($(".sirh").val() !== "")
        proyectoNuevo.sirh= $(".sirh").val();
      if ($(".iep").val() !== "")
        proyectoNuevo.iep= $(".iep").val();
      if ($(".goc").val() !== "")
        proyectoNuevo.gocCode= $(".gocCode").val();
      if ($(".cate").val() !== "")
        proyectoNuevo.cate= $(".cate").val();
      if ($(".packingList").val() !== "")
        proyectoNuevo.packingList= $(".packingList").val();
      if ($(".aperture").val() !== "")
        proyectoNuevo.aperture= $(".aperture").val();
      if ($(".deviceName").val() !== "")
        proyectoNuevo.deviceName= $(".deviceName").val();
      if ($(".serialNumber").val() !== "")
        proyectoNuevo.serialNumber= $(".serialNumber").val();
      if ($(".invoice").val() !== "")
        proyectoNuevo.invoice= $(".invoice").val();
      if ($(".site").val() !== "")
        proyectoNuevo.site= $(".site").val();
      if ($(".po").val() !== "")
        proyectoNuevo.po= $(".po").val();
      if ($(".so").val() !== "")
        proyectoNuevo.so= $(".so").val();
      if ($(".quote").val() !== "")
        proyectoNuevo.quote= $(".quote").val();
      if ($(".program-activities").val() !== "")
        proyectoNuevo.programActivities= $(".program-activities").val();
      if ($(".sr").val() !== "")
        proyectoNuevo.sr= $(".sr").val();
      if ($(".human-resources").val() !== "")
        proyectoNuevo.humanResource= $(".human-resources").val().split("\n");
      if ($(".fechaCompromiso").val() !== "")
        proyectoNuevo.fechaCompromiso= $(".fechaCompromiso").val();
      var pps=[];
      var pcs=[];
      var sns=[];
      $.each($(".lineaPP"), function(){
        var pp = $(".descPP", $(this)).val()+","+$(".valorPP", $(this)).val()+","+$(".tipoPP", $(this)).val();
        pps.push(pp);
      });
      $.each($(".lineaPC"), function(){
        var pc = $(".descPC", $(this)).val()+","+$(".valorPC", $(this)).val()+","+$(".tipoPC", $(this)).val();
        pcs.push(pc);
      });
      $.each($(".lineaSN"), function(){
        var sn = $(".sn", $(this)).val()+","+$(".incident", $(this)).val();
        sns.push(sn);
      });
      if (sns.length > 0)
        proyectoNuevo.sn = sns;
      if (pps.length > 0)
        proyectoNuevo.powerProfile = pps;
      if (pcs.length > 0)
        proyectoNuevo.powerCabling = pcs;
      if (edicionProyecto){
        console.log("EDITION ",proyectoNuevo);
        //Proyectos.update($(".id_").val(),{$set:proyectoNuevo});
        Meteor.call("updateProject",$(".id_").val(),proyectoNuevo,function(error,result){
          if(error) console.log("Error, no se pudo actualizar el Proyecto");
        });
      } else {
        proyectoNuevo.fechaInicio= formatoFecha(new Date());
        console.log("NUEVO!!!! ",proyectoNuevo);
        //Proyectos.insert(proyectoNuevo);
        Meteor.call("insertProject",proyectoNuevo,function(error,result){
          if(error) console.log("Error, no se pudo insertar el nuevo proyecto");
        });
      }
      actualizaGrid();
      $("#proyectos-container").show();
      $("#nuevo-proyecto").hide();
    }
  });
}


if (Meteor.isServer) {

  Meteor.publish('proyectos',function(){
    return Proyectos.find();
  });

  Meteor.publish('equipos',function(){
    return Equipos.find();
  });

  Meteor.publish('tiers',function(){
    return Tiers.find();
  });

  Meteor.publish('discos',function(){
    return Discos.find();
  });

  Meteor.publish('phases',function(){
    return Phases.find();
  });

  Meteor.publish('activities',function(){
    return Activities.find();
  });

   Meteor.publish('status',function(){
    return Status.find();
  });

  Meteor.methods({

    /*Operaciones sobre la colección Proyectos*/

    newProject: function(newRequestOpts){
      var idNuevoProyecto = Proyectos.insert({projectName:"Test2", "opts":newRequestOpts});
      return idNuevoProyecto;
    },

    insertProject: function(proyectoNuevo){
      Proyectos.insert(proyectoNuevo);
    },

    dismissProject: function(idProyecto){
      Proyectos.remove({_id:idProyecto});
    },

    updateProject: function(proyectoId,newObject){
      Proyectos.update(proyectoId,{$set:newObject});
    },

    updateDateProject: function(proyectoId,newDate){
      Proyectos.update(proyectoId,{$set:{"fechaInicio":newDate}});
    },

    /*Operaciones sobre la colección Equipos*/

    newEquipo: function(newDevice){
      Equipos.insert(newDevice);
    },

    /*Operaciones sobre la colección de Status*/
    insertStatus: function(proyectoId,actId,actStatus,actRes,date){
      Status.insert({project:proyectoId, activity:actId, status:actStatus, responsable:actRes, fechaAccomp:date});
    },

    updateStatus: function(proyectoId,actStatus,actRes){
      Status.update(proyectoId,{$set:{status:actStatus, responsable:actRes}});
    },

    updateDateStatus: function(proyectoId){
      Status.update(proyectoId,{$unset:{fechaAccomp:{$exists:true}}});
    },

    updateDateStatus2: function(proyectoId,estimated){
      Status.update(proyectoId,{$set:{fechaInicio:estimated}});
    },

    updateNewStatus: function(proyectoId,actStatus,actRes,date){
      Status.update(proyectoId,{$set:{status:actStatus, responsable:actRes, fechaAccomp:date}});
    },

    updateNotesStatus: function(proyectoId,newNote){
      Status.update(proyectoId,{$set:{notes:newNote}});
    },

    updateActivitiesStatus: function(proyectoId,idAct,actRes,estimated){
      Status.insert({project:proyectoId, activity:idAct, status:false, responsable:actRes, fechaEst: estimated});
    }

    /*Operaciones sobre la colección de Activities*/
   
      
  });
}
