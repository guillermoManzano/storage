Proyectos = new Mongo.Collection("proyectos");
Equipos = new Mongo.Collection("equipos");
Tiers = new Mongo.Collection("tiers");
Discos = new Mongo.Collection("discos");  

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);


  $(document).ready(function() {
      $('#fullpage').fullpage({
        anchors: ['proys', 'fails', 'calc'],
        sectionsColor: ['rgb(233,233,233)', '#1BBC9B', '#7E8F7C'],
        css3: true,
        scrollOverflow: false
      });

      $("li.menu-link").click(function(){
        $("li.active").toggleClass("active");
        $(this).toggleClass("active");
      });

      edicionProyecto=false;
      proyects=[
      {
        id:'2015QRDC100',
        name:'upgrd vnx',
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

  Template.cuerpo.onRendered(function(){
    Meteor.call("listaProyectos",function(){
        console.log("LIsTO CALL12");
      });
    var listProyectos = Proyectos.find().fetch();
        console.log("kekek ",listProyectos);
        var source ={
          datatype: "json",
          datafields: [
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
        
        $("#proyectosGrid").jqxGrid(
            {
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

  Template.cuerpo.events({
    'click .nuevo-button':function(){
      $(".divEquipos").empty();$(".divPP").empty();$('.div-sn').empty();$(".divPC").empty();
      $(".hdSumDiv").hide();
      $("#proyectos-container").hide();
      //$("#nuevo-proyecto").slimscroll({ height: 'auto' });
      $("#nuevo-proyecto").show();
      edicionProyecto=false;
    },

    'click .editar-button':function(){
      $(".divEquipos").empty();$(".divPP").empty();$('.div-sn').empty();$(".divPC").empty();
      edicionProyecto=true;
      var rowId = $("#proyectosGrid").jqxGrid('getselectedrowindex');
      
      var proyId = $("#proyectosGrid").jqxGrid('getrowdatabyid',rowId).id
      var proyecto = Proyectos.find({id:proyId}).fetch();
      
      editarProyecto(proyecto[0]);
      $("#proyectos-container").hide();
      //$("#nuevo-proyecto").slimscroll({ height: 'auto' });
      $(".hdSumDiv").show();
      $("#nuevo-proyecto").show();
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
        textoEq += "<br/><div class='lineaSN'><p class='texto-campo'>Family</p><select class='select-proyecto equipo'><option value='vnx5000'>VNX</option><option value='vnx40'>VMAX</option><option value='vnx100'>CENTERA</option><option value='vnx100'>DATA DOMAIN</option><option value='vnx100'>CENTERA</option><option value='vnx100'>CLARION</option><option value='vnx100'>SWITCHES</option></select>"+
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
        Proyectos.update($(".id_").val(),{$set:proyectoNuevo});
      } else {
        proyectoNuevo.fechaInicio= formatoFecha(new Date());
        console.log("NUEVO!!!! ",proyectoNuevo);
        Proyectos.insert(proyectoNuevo);
      }
      actualizaGrid();
      $("#proyectos-container").show();
      $("#nuevo-proyecto").hide();
    }
  });
}


if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}