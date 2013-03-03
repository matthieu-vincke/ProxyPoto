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
			
       ajaxLogin(login,password,function(e,res){
              if(e) return alertuser("login error : " + e.responseText);
              log("login ok, token: " + res.token);
              loginToken = res.token;
			  setupWatch(5000);
			  alertuser("Log in - Done");
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
	        alertuser("Sign up - Done");
	       });
	});	        
        
	function setupWatch(freq) {	    
	    refreshIntervalId = setInterval(getLocation, freq);
	}
	
	function getLocation() {		       	       
	   watch_id = navigator.geolocation.getCurrentPosition (successCallback, errorCallback, {timeout: 10000});		
	}

    function successCallback(position){
        console.log("Success GetPosition" + position.coords.latitude + ' ' + position.coords.longitude );			  
     
		$("#login_info").html('Your position \n\r Latitude: <strong>' + position.coords.latitude + '</strong> et Longitude <strong>' + position.coords.longitude + '</strong>');
						
		tracking_data=position;  	    		    
    }

    function errorCallback(error){
		console.log("Fail GetPosition" + error.code + ' ' + error.message );
    }
        

	$("#login_stop").live("click",function(){	
		// Stop tracking the user
		navigator.geolocation.clearWatch(watch_id);	
		clearInterval(refreshIntervalId); // Stop the refresh
		
		$("#login_info").html('Tracking stopped');
		
		loginToken = null;
		
		alertuser("Sign out - Done");
	});

	// When the user views the Track Info page
	$('#proxytweet').live("pageshow",function(){
		getTweets();
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
						$("#proxytweet_list").append($('<li/>').html('Tweet -' + i + '-' + tweet.date + '-' + tweet.user + '-' + tweet.text));
					}
				});
				$("#proxytweet_list").listview('refresh'); 	      
		    });
	    }
	    else
	    {
	    	alertuser("Not logged or no position");
	    }	
	}
}