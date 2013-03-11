var docready = false;
var loginToken;
var tracking_data;
var serverurl = "/";//"http://croquelois.proxweet.jit.su/";

function reqPost(url,data,cb){
  $.ajax({ type: "POST", url: serverurl+url,data: data})
   .done(function(ret) { cb(null,ret); })
   .fail(function(err){ alert(err); cb(err,null); });
}
function ajaxLogin(user,pass,cb){
  reqPost("login",{user:user,pass:pass},cb);
}
function ajaxLogout(token,cb){
  reqPost("logout",{token:token},cb);
}
function ajaxGet(token,lng,lat,cb){
  reqPost("get",{token:token,lng:lng,lat:lat},cb);
}
function ajaxPost(token,lng,lat,text,cb){
  reqPost("post",{token:token,lng:lng,lat:lat,text:text},cb);
}
function ajaxSignup(user,pass,email,name,cb){
  reqPost("signup",{user:user,pass:pass,email:email,name:name},cb);
}
function ajaxParameter(token,pass,email,name,cb){
  reqPost("parameter",{token:token,pass:pass,email:email,name:name},cb);
}
function ajaxDelete(token,cb){
  reqPost("delete",{token:token},cb);
}
function ajaxReset(cb){
  reqPost("reset",{},cb);
}
function ajaxPartyNew(token,lng,lat,when,desc,cb){
  reqPost("party/new",{token:token,when:when.format("YYYYMMDD-hhmmss"),lng:lng,lat:lat,desc:desc},cb);
}
function ajaxPartyJoin(token,partyId,cb){
  reqPost("party/join",{token:token,partyId:partyId},cb);
}
function ajaxPartyLeave(token,partyId,cb){
  reqPost("party/leave",{token:token,partyId:partyId},cb);
}
function ajaxPartyDelete(token,partyId,cb){
  reqPost("party/del",{token:token,partyId:partyId},cb);
}
function ajaxPartyMembers(token,partyId,cb){
  reqPost("party/members",{token:token,partyId:partyId},cb);
}
function ajaxPartyOwner(token,partyId,cb){
  reqPost("party/owner",{token:token,partyId:partyId},cb);
}
function ajaxPartyGet(token,lng,lat,cb){
  reqPost("party/get",{token:token,lng:lng,lat:lat},cb);
}
function ajaxPartyOwned(token,cb){
  reqPost("party/getOwned",{token:token},cb);
}
function ajaxPartyJoined(token,cb){
  reqPost("party/getJoined",{token:token},cb);
}

// ------------------- Start of Cookie management -----------------------------

function setCookie(c_name,value,exdays)
{
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
}

function getCookie(c_name)
{
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++)
	{
		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		x=x.replace(/^\s+|\s+$/g,"");
		if (x==c_name)
		{
			return unescape(y);
		}
	}
}	
// ------------------- End of Cookie management -----------------------------

// [TODO] Change the messages de success delete and join parties

function unsubscribeparty(partyid) {
	if(docready)	{		
		ajaxPartyLeave(loginToken,partyid,function(e,o){
			if(e) return alert("party delete error : " + e.responseText);
			else location.reload();                  
        });			
		return(true);
	}
	else	{
		alert("Page not ready to delete this party id " + partyid);	
		return(false);
	}
}

function deleteparty(partyid) {
	if(docready)	{
		ajaxPartyDelete(loginToken,partyid,function(e,o){
			if(e) return alert("party delete error : " + e.responseText);
			else location.reload();                  
        });		
		return(true);
	}
	else	{
		alert("Page not ready to delete this party id " + partyid);	
		return(false);
	}
}

function joinparty(partyid) {
	if(docready)	{
		ajaxPartyJoin(loginToken,partyid,function(e,o){
			if(e) return alert("party join error : " + e.responseText);
			else location.reload();                 
        });		
		return(true);
	}
	else	{
		alert("Page not ready to join this party id " + partyid);	
		return(false);
	}
}

 
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
	document.addEventListener("deviceReady", deviceReady, false);
	function deviceReady() {				
			loginToken = getCookie("userid");
			var trackdata = getCookie("trackingdata");
			
			if(trackdata) {
				tracking_data = JSON.parse(trackdata);			
			}
			
			doWhenReady();	
			
			if(loginToken && tracking_data){
				$.mobile.changePage("#proxytweet", {transition: "none"});
			}
	}
} else {

	$(document).ready(function() {  
		docready = true;
		loginToken = getCookie("userid");
		var trackdata = getCookie("trackingdata");
		
		if(trackdata) {
			tracking_data = JSON.parse(trackdata);			
		}
		
		doWhenReady();	
		
		if(loginToken && tracking_data){
			$.mobile.changePage("#proxytweet", {transition: "none"});
		}		
	});	
}

function doWhenReady() {
// -----------------  Init ----------------------------------------	

	$.mobile.defaultPageTransition   = 'none'
	$.mobile.defaultDialogTransition = 'none'
	$.mobile.buttonMarkup.hoverDelay = 0
	
	var watch_id;
	var refreshIntervalId;

	// Init to increase speed
	var addtweetpage = $("#addtweetpage");
	var dialog 			= $("#addtweetpage");
	var addtweetdialog 	= $("#addtweetdialog");
	var loginstop 		= $("#login_stop");
	var tweetdiv = $("#tweetsdiv");			
	var partydiv = $("#partydiv");		
	var mypartiesdiv = $("#mypartiesdiv");
	var myjoinedpartiesdiv = $("#myjoinedpartiesdiv");		
	var mypartiespage = $("#mypartiespage");
	var joinpartypage = $("#joinpartypage");
	var currentdoc = $( document );
	
	var signup_btn = $("#signup_btn");
	var login_start = $("#login_start");
	var signup_start = $("#signup_start");
	var proxytweet = $("#proxytweet");
	var login_stop = $("#login_stop");
	var addtweetdialog = $("#addtweetdialog");
	var posttweet = $("#posttweet");
	var newpartypage = $("#newpartypage");
	var addpartybtn = $("#addpartybtn");
	var position_info = $("#position_info");
	var partiesjoinedpage = $("#partiesjoinedpage");
	var loginrightpanel = $( "#right-panel" );
	var loginleftpanel =$( "#left-panel" );
	var tweetrightpanel = $( "#right-panel-tweet" ); // loginrightpanel.panel( "open" );
	var tweetleftpanel =$( "#left-panel-tweet" );	
	
	// Add the position get periodic
	setupWatch(5000);
	initPanels();
	/*
	function DisplayMap(latitude,longitude){
		var mapOptions = {
			zoom: 4,
			center: new google.maps.LatLng(latitude, longitude),
			mapTypeId: google.maps.MapTypeId.ROADMAP
		}
		 
		var map = new google.maps.Map($("#map_canvas"), mapOptions);
		
		var mapBounds = new google.maps.LatLngBounds();
		 
		var latitudeAndLongitudeOne = new google.maps.LatLng(latitude,longitude);
		 
		var markerOne = new google.maps.Marker({
		position: latitudeAndLongitudeOne,
		map: map
		});
		 
		mapBounds.extend(latitudeAndLongitudeOne);
		 
		map.fitBounds(mapBounds);
	}
	*/
	function initPanels(){
		currentdoc.on( "swipeleft swiperight", "#login", function( e ) {
			// We check if there is no open panel on the page because otherwise
			// a swipe to close the left panel would also open the right panel (and v.v.).
			// We do this by checking the data that the framework stores on the page element (panel: open).	
			if ($.mobile.activePage.find('#left-panel').hasClass('ui-panel-closed') && e.type === "swipeleft") {
				loginrightpanel.panel( "open" ); 
				e.stopImmediatePropagation();
			}    

			if ($.mobile.activePage.find('#right-panel').hasClass('ui-panel-closed') &&  e.type === "swiperight") {
				loginleftpanel.panel( "open" );    
				e.stopImmediatePropagation();				
			}   			
		});	

		currentdoc.on( "swipeleft swiperight", "#proxytweet", function( e ) {
			
			if ($.mobile.activePage.find('#left-panel-tweet').hasClass('ui-panel-closed') && e.type === "swipeleft") {
				tweetrightpanel.panel( "open" ); 
				e.stopImmediatePropagation();
			}    
			
			if ($.mobile.activePage.find('#right-panel-tweet').hasClass('ui-panel-closed') &&  e.type === "swiperight") {
				tweetleftpanel.panel( "open" );  
				e.stopImmediatePropagation();
			}   
		});
	}
	
	function setupWatch(freq) {	    
	    refreshIntervalId = setInterval(getLocation, freq);
	}

// -----------------  End Init ----------------------------------------		

// -----------------  Utilities ----------------------------------------	
	// GetUrlParameter	
	function gup( name ){
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");  
		var regexS = "[\\?&]"+name+"=([^&#]*)";  
		var regex = new RegExp( regexS );  
		var results = regex.exec( window.location.href ); 
		 if( results == null )    return "";  
		else    return results[1];
	}
	
    function log(text){
		console.log(text); 	     
    }
    
    function alertuser(text){    
 		navigator.notification.alert(
			    text,  
			    alertdismissed,      
			    'Alert',            
			    'Done'              
			);     
    }   
    
    function alertdismissed() {
	        // [TODO]
	}
	
	// [TODO] change this function to save the tweets and return the formated html. Up to the calling method to add it in the page.
	function getTweets(){
		if(loginToken && tracking_data)
		{			
		    ajaxGet(loginToken,tracking_data.coords.latitude,tracking_data.coords.longitude,function(e,data){
		      if(e) return alertuser("get error : " + e.responseText + "Login Token " + loginToken + " Position " + tracking_data.coords.latitude + " - " + tracking_data.coords.longitude);
		      log("get ok, tweets: " + JSON.stringify(data));
		      						
				tweetdiv.empty();
									
				$.each(data,function(i){
					if(i < 10){
						var tweet = data[i];				
						tweetdiv
							.append($('<div class="ui-grid-a headertweet"/>')
								.append($('<div class="ui-block-a">').html(tweet.user))
								.append($('<div class="ui-block-b"/>').html(moment(tweet.date, "YYYYMMDD-hhmmss").format("dddd, MMMM Do YYYY, h:mm:ss a")))								
							).append($('<div class="ui-grid-solo">')							
								.append($('<a data-role="button" href="#tweet' + i +'" style="text-align:left" />').html(tweet.text.substring(0,100))
								)
							).trigger('create');						
					}
				});
     
		    });
	    }
	    else
	    {
	    	alertuser("No position! How is your network reception?!");
	    	$.mobile.changePage("#login", {transition: "none"});
	    }	
	}

	function getParties() {
		getCurrentParties(function(parties){			
			$.each(parties,function(i){
				if(i < 10){
					var party = parties[i];	
					ajaxPartyMembers(loginToken, party.id, function(e, members){
						if(e) return alert("Error when getting members of the party");
						
						ajaxPartyOwner(loginToken,party.id,function(err,owner){
						if(err) return alert("Error when getting the owner of the party");
						if(members.length ==0) {members = "Nobody joined yet";}
						partydiv
							.append($('<div class="ui-grid-b headertweet"/>')
								.append($('<div class="ui-block-a"/>').html('<a href="javascript:joinparty(\'' + party.id +'\');" >Join!</a>'))
								.append($('<div class="ui-block-b"/>').html(moment(party.when, "YYYYMMDD-hhmmss").format("dddd, MMMM Do YYYY, h:mm:ss a")))				// 20130310-120055																		
							).append($('<div class="ui-grid-solo">')							
							.append($('<a data-role="button" href="#party' + i +'" style="text-align:left" />').html(party.desc.substring(0,100))
								)
							).append($('<div class="ui-grid-solo" />')
								.append('$(<div/>').html("Members of this party are: " + members)
							).append($('<div class="ui-grid-solo" />')
								.append('$(<div/>').html("The creator of the party is "+owner)
							).append($("<br/>")).trigger('create');						  
						});	
						
					});						
				}
			});
		});	
	}
	
	function getMyParties() {	
		getUserParties(function(parties){			
			$.each(parties,function(i){			
				if(i < 10){				
					var party = parties[i];
					ajaxPartyMembers(loginToken, party.id, function(e, members){
						if(e) return alert("Error when getting members of the party");						
						if(members.length ==0) {members = "Nobody joined yet";}
						mypartiesdiv
							.append($('<div class="ui-grid-c headertweet"/>')
								.append($('<div class="ui-block-a"/>').html('<a href="javascript:deleteparty(\'' + party.id +'\');" ><img src="images/redcrossdelete.jpg" width="24" height="24"></img></a>'))							
								.append($('<div class="ui-block-b"/>').html(moment(party.when, "YYYYMMDD-hhmmss").format("dddd, MMMM Do YYYY, h:mm:ss a")))				// 20130310-120055				
								.append($('<div class="ui-block-c"/>').html("<a href=https://maps.google.com/maps?t=h&q=loc:"+ party.pos[0] +","+party.pos[1]+"&z=17>Display map</a>"))	
							).append($('<div class="ui-grid-solo" />')							
								.append($('<a data-role="button" href="javascript:deleteparty(\'' + party.id +'\');" style="text-align:left" />').html(party.desc.substring(0,100))
								)
							).append($('<div class="ui-grid-solo" />')
								.append('$(<div/>').html("Members of this party are: " + members)
							).append($("<br/>")).trigger('create');
					});			
				}
			});
		});	
	}
	
	function getMyJoinedParties() {	
		ajaxPartyJoined(loginToken, function(e,parties){	
			if(e) return alert("error " + e.responseText);		
			
			$.each(parties,function(i){				
				if(i < 10){
					var party = parties[i];				
					myjoinedpartiesdiv
						.append($('<div class="ui-grid-c headertweet"/>')
							.append($('<div class="ui-block-a"/>').html('<a href="javascript:unsubscribeparty(\'' + party.id +'\');" ><img src="images/redcrossdelete.jpg" width="24" height="24"></img></a>'))							
							.append($('<div class="ui-block-b"/>').html(moment(party.when, "YYYYMMDD-hhmmss").format("dddd, MMMM Do YYYY, h:mm:ss a")))				// 20130310-120055			
							.append($('<div class="ui-block-c"/>').html("<a href=https://maps.google.com/maps?t=h&q=loc:"+ party.pos[0] +","+party.pos[1]+"&z=17>Display map</a>"))	
						).append($('<div class="ui-grid-solo">')							
							.append($('<a data-role="button" href="javascript:deleteparty(\'' + party.id +'\');" style="text-align:left" />').html(party.desc.substring(0,100))
							)
						).trigger('create');	
				}
			});
		});	
	}	
	
	function getCurrentParties(cb) {
		if(loginToken && tracking_data) {
			ajaxPartyGet(loginToken,tracking_data.coords.latitude,tracking_data.coords.longitude,function(e,o){
				if(e) return alertuser("Get Party error : " + e.responseText + "Login Token " + loginToken + " Position " + tracking_data.coords.latitude + " - " + tracking_data.coords.longitude);
				log("party get " + JSON.stringify(o));
				cb(o);
			});
		}		
	}

	function getUserParties(cb) {
		if(loginToken && tracking_data) {
			ajaxPartyOwned(loginToken,function(e,o){
				if(e) return alertuser("Get user Party error : " + e.responseText + "Login Token " + loginToken + " Position " + tracking_data.coords.latitude + " - " + tracking_data.coords.longitude);
				log("party get " + JSON.stringify(o));
				cb(o);
			});
		}		
	}	
	
// -----------------  End of Utilities ----------------------------------------


	
// -----------------  Localisation ----------------------------------------
	function getLocation() {		
	   var selectedoption =	$("#howtogetpos")[0].selectedIndex;
	          	  
	   log("selected position option is: " + selectedoption);   
	   
	   if(selectedoption == 1)
	   	watch_id = navigator.geolocation.getCurrentPosition (successCallback, errorCallback, {timeout: 10000,enableHighAccuracy:true});		
	   else
	   	watch_id = navigator.geolocation.getCurrentPosition (successCallback, errorCallback, {timeout: 10000});
	}

    function successCallback(position){
        console.log("Success GetPosition" + position.coords.latitude + ' ' + position.coords.longitude );			  
     
		position_info.html('Your position \n\r Latitude: <strong>' + position.coords.latitude + '</strong> et Longitude <strong>' + position.coords.longitude + '</strong>');
						
		tracking_data=position;  	 

		setCookie("trackingdata",JSON.stringify(tracking_data),2);	
    }

    function errorCallback(error){
		console.log("Fail GetPosition" + error.code + ' ' + error.message );
    }
// -----------------  End Localisation ----------------------------------------	


// -----------------  Login page ----------------------------------------	
	login_start.on("vclick",function(){	
		var login = $("#login_id").val();
		var password = $("#password_id").val();
		
		// Force a getlocation in case of a change of network option that has not been taken into account
		getLocation();
		
       ajaxLogin(login,password,function(e,res){
            if(e) return alertuser("login error : " + e.responseText);
            log("login ok, token: " + res.token);
            loginToken = res.token;			  		
			setCookie("userid",loginToken,2);			  
			$.mobile.changePage("#proxytweet", {transition: "none"});
        });               
	});

	signup_btn.on("vclick",function(){				
		$.mobile.changePage("#signup", {transition: "none"});
	});	
// -----------------  End Login page ----------------------------------------	

// -----------------  SignUp page ----------------------------------------	
	signup_start.on("vclick",function(){		
		var login = $("#sign_login_id").val();
		var password = $("#sign_password_id").val();
		var mail = $("#sign_mail_id").val();
		var name = $("#sign_name_id").val();
				
		ajaxSignup(login,password,mail,name,function(e,o){
	        if(e) return alertuser("signup error : " + e.responseText);
	        log("signup ok");
	        alertuser("You are now registered! Please login.");
			$.mobile.changePage("#login", {transition: "none"});			
	       });
	});	        
// -----------------  End SignUp page ----------------------------------------	        

        	
// -----------------  ProxyTweet page ----------------------------------------
	// When the user views the Track Info page
	proxytweet.on("pageshow",function(){		
		getTweets();			
	});	
	
	login_stop.on("vclick",function(){	
		// Stop tracking the user
		navigator.geolocation.clearWatch(watch_id);	
		clearInterval(refreshIntervalId); // Stop the refresh
		
	 	ajaxLogout(loginToken,function(e,res){
            if(e) return alertuser("Logout error : " + e.responseText);
            alertuser("You are logged out!");
			$.mobile.changePage("#login", {transition: "none"});    					
			loginToken = null;	
			setCookie("trackingdata","",-1);
			setCookie("userid","",-1);
        });	  
	});
	
	addtweetdialog.on("vclick",function(){	
		
	    if (!dialog.hasClass('ui-dialog')) {
	        dialog.page();
	    }
		// disable buttons to avoid problems
		addtweetdialog.attr('disabled','disabled');
		loginstop.attr('disabled','disabled');
	    dialog.fadeIn(500);				         	
	});
	
	posttweet.on("vclick",function(){
		var tweetmessage = $("#tweet_message_id").val();

		log("post with Msg " + tweetmessage);
		
	 	ajaxPost(loginToken,tracking_data.coords.latitude,tracking_data.coords.longitude,tweetmessage,function(e){
            if(e) return alertuser("post error : " + e.responseText);
            log("post ok");
            $("#tweet_message_id").val("");    	
			getTweets();	
			
			// Activate buttons again
			addtweetdialog.removeAttr('disabled');
			loginstop.removeAttr('disabled');	

			
			addtweetpage.fadeOut(500);				
        });	                
	});		
	
// -----------------  End ProxyTweet page ----------------------------------------


// -----------------  New party page ----------------------------------------
	newpartypage.on("pageshow",function(){		
			
	});	
	
	addpartybtn.on("vclick",function(){	
		var partyname = $("#newpartytxt_id").val();		
		var partydate= $("#partydate").val();
		var partytime= $("#partytime").val();
		
		ajaxPartyNew(loginToken,tracking_data.coords.latitude,tracking_data.coords.longitude,moment(partydate+'-'+partytime),partyname,function(e,o){
			if(e) return log("party add error : " + e.responseText);
			log("party new success, id: " + o.id);
			$.mobile.changePage("#mypartiespage", {transition: "none"});
		});		           
	});			

// -----------------  End party page ----------------------------------------
	
// -----------------  Join party page ----------------------------------------
	
	joinpartypage.on("pageshow",function(){		
		getParties();
	});	
		
// ----------------- End Join party page ----------------------------------------
		
// -----------------  Join mypartiespage page ----------------------------------------
	
	mypartiespage.on("pageshow",function(){		
		getMyParties();
	});	
	
// ----------------- End Join mypartiespage page ----------------------------------------
	
// -----------------  Join partiesjoinedpage page ----------------------------------------
	
	partiesjoinedpage.on("pageshow",function(){		
		getMyJoinedParties();
	});	
	
// ----------------- End Join partiesjoinedpage page ----------------------------------------
		

	

}