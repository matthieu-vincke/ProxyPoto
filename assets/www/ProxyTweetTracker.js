document.addEventListener("deviceReady", deviceReady, false);

function deviceReady() {	
	if(navigator.network.connection.type == Connection.NONE){
			$("#home_network_button").text('No Internet Access')
									 .attr("data-icon", "delete")
									 .button('refresh');
		}
		
	doWhenReady();
}

function doWhenReady() {

	var tracking_data = null;
	var watch_id = null;
	var refreshIntervalId = null;
	var loginToken = null;
	
	// Init the position
	getLocation();
	
	// Add the position get periodic
	setupWatch(5000);
	
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
	
    function reqPost(url,data,cb){
      $.ajax({ type: "POST", url: "http://ec2-75-101-255-252.compute-1.amazonaws.com/"+url, data: data})
       .done(function(ret) { cb(null,ret); })
       .fail(function(err){ cb(err,null); });
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
                      	
	$("#login_start").live("click",function(){	
		var login = $("#login_id").val();
		var password = $("#password_id").val();
		
		// Force a getlocation in case of a change of network option that has not been taken into account
		getLocation();
		
       ajaxLogin(login,password,function(e,res){
              if(e) return alertuser("login error : " + e.responseText);
              log("login ok, token: " + res.token);
              loginToken = res.token;			  			  
			  $.mobile.changePage("#proxytweet", {transition: "slide"});
        });               
	});
	
	$("#signup_start").live("click",function(){		
		var login = $("#sign_login_id").val();
		var password = $("#sign_password_id").val();
		var mail = $("#sign_mail_id").val();
		var name = $("#sign_name_id").val();
				
		ajaxSignup(login,password,mail,name,function(e,o){
	        if(e) return alertuser("signup error : " + e.responseText);
	        log("signup ok");
	        alertuser("You are now registered! Please login.");
			$.mobile.changePage("#login", {transition: "slide"});			
	       });
	});	        
        
	function setupWatch(freq) {	    
	    refreshIntervalId = setInterval(getLocation, freq);
	}
	
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
     
		$("#position_info").html('Your position \n\r Latitude: <strong>' + position.coords.latitude + '</strong> et Longitude <strong>' + position.coords.longitude + '</strong>');
						
		tracking_data=position;  	    		    
    }

    function errorCallback(error){
		console.log("Fail GetPosition" + error.code + ' ' + error.message );
    }
        	
	$("#signup_btn").live("click",function(){				
		$.mobile.changePage("#signup", {transition: "slide"});
	});
	
	$("#login_stop").live("click",function(){	
		// Stop tracking the user
		navigator.geolocation.clearWatch(watch_id);	
		clearInterval(refreshIntervalId); // Stop the refresh
		
		$("#login_info").html('Tracking stopped');
		
		loginToken = null;
		
		alertuser("You are logged out!");
		$.mobile.changePage("#login", {transition: "slide"});
	});

	// When the user views the Track Info page
	$('#proxytweet').live("pageshow",function(){
		getTweets();
	});

	$('#login').live("pageshow",function(){
		
	});	

	$("#posttweet").live("click",function(){
		var tweetmessage = $("#tweet_message_id").val();

		log("post with Msg " + tweetmessage);
		
	 	ajaxPost(loginToken,tracking_data.coords.latitude,tracking_data.coords.longitude,tweetmessage,function(e){
            if(e) return alertuser("post error : " + e.responseText);
            log("post ok");
            $("#tweet_message_id").val("");            
            getTweets();
        });	                	
	});


	function getTweets(){
		if(loginToken && tracking_data)
		{
		    ajaxGet(loginToken,tracking_data.coords.latitude,tracking_data.coords.longitude,function(e,data){
		      if(e) return alertuser("get error : " + e.responseText + "Login Token " + loginToken + " Position " + tracking_data.coords.latitude + " - " + tracking_data.coords.longitude);
		      log("get ok, tweets: " + JSON.stringify(data));
		      
				$("#proxytweet_list").empty();
				$.each(data,function(i){
					if(i < 5){
						var tweet = data[i];
						var nb = 5-i;
						$("#proxytweet_list").append($('<li/>').html('Tweet -' +  nb + '-' + tweet.date + '-' + tweet.user + '-' + tweet.text));
					}
				});
				$("#proxytweet_list").listview('refresh'); 	      
		    });
	    }
	    else
	    {
	    	alertuser("No position! How is your network reception?!");
	    	$.mobile.changePage("#login", {transition: "slide"});
	    }	
	}
}