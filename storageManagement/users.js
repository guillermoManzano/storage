if (Meteor.isClient) {

  //Session.setDefault('data', 0);

	Accounts._loginButtonsSession.set('dropdownVisible', true);
	
  window.onbeforeunload = function () {

    if(Meteor.userId()){
    /*Meteor.logout();*/

    return "Esta operación provocará el cierre de sesión";
    }
  }

	Accounts.ui.config({
    	passwordSignupFields: "USERNAME_ONLY"

  	});

	Template.header.events({
    	"click .logout": function(evt){
 		Meteor.logout();
      }
    });

	Template.header.onRendered(function () {
  	
  		view = Blaze.getView(document.getElementById('login-buttons'));
        console.log("VIEW ",view);
        Blaze.remove(view);
	});

  Template.menu.events({
      "click .addUser": function(evt){
         viewVar = Blaze.render(Template.agregarUsuario, $("body").get(0));
         console.log(viewVar);
      }
    });

  Template.agregarUsuario.events({
      "click .administrador": function(evt){
         var flag = $('input:checkbox[name=administrador]:checked').val();
         
         if (flag == 'on'){
           $('input:checkbox[name=project]').prop('checked',true);
           $('input:checkbox[name=breakFix]').prop('checked',true);
           $('input:checkbox[name=read]').prop('checked',true);
           $('input:checkbox[name=write]').prop('checked',true);
          
         }
         else{
            $('input:checkbox[name=project]').prop('checked',false);
            $('input:checkbox[name=breakFix]').prop('checked',false);
            $('input:checkbox[name=read]').prop('checked',false);
            $('input:checkbox[name=write]').prop('checked',false);
            
         }
      }
    });

  Template.agregarUsuario.events({

    "submit .agregarUser": function(event){

      event.preventDefault();
      var username = event.target.username.value;
      var password = event.target.password.value;
      var email = event.target.email.value;
      var profile = event.target.profile.value;
      var administrador = event.target.administrador.checked;
      var project = event.target.project.checked;
      var breakFix = event.target.breakFix.checked;
      var read = event.target.read.checked;
      var write = event.target.write.checked

      var idUser;

      console.log(username + "-" + password + "-" + email + "-" + profile + "-" + administrador + "-" + breakFix + "-" + project + "-" + read + "-" + write);

      Meteor.call('insertUser',username,password,email,profile,administrador,project,breakFix,read,write, function(err,result){
        if(err){ 
          console.log("ERROR");
          alert("No se pudo crear el usuario: " + username + ", puede que el nombre de usario o correo ya exista");
          }
        else { 
          //Session.set('data', result);
          alert("Se ha agregado el usuario: " + username);
          event.target.username.value = "";
          event.target.password.value="";
          event.target.email.value="";
          event.target.profile.value="";
        }
      });

    }

  }); 
}

if(Meteor.isServer){
  Meteor.startup(function(){
    Meteor.methods({

      insertUser: function(username,password,email,profile,administrador,project,breakFix,read,write){
        
        var id = Accounts.createUser({username:username,password:password,email:email,profile:profile});
        
        if(administrador) 
          Roles.addUsersToRoles(id, ['Administrador','Projects','Break & Fix'] );
        else{
          if(project) Roles.addUsersToRoles(id,"Projects");
          if(breakFix) Roles.addUsersToRoles(id,"Break & Fix");
        }

        if(read) Roles.addUsersToRoles(id,"Read");
        if(write) Roles.addUsersToRoles(id,"Write");

        return id;

      }
      
    });
  });
}