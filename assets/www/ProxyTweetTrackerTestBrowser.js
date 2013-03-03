var deviceReadyDeferred = $.Deferred();
var jqmReadyDeferred = $.Deferred();

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

	var tracking_data;
	var watch_id;
	var refreshIntervalId;
	var loginToken;
	
    function log(text){
		navigator.notification.alert(
			    text,  
			    alertDismissed,      
			    'Alert',            
			    'Done'              
			);   	     

    }
    
    function alertDismissed() {
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
        
     function signupLoginDelete(){
      ajaxSignup("clientTest","clientPass","clientMail","clientName",function(e,o){
        if(e) return log("signup error : " + e.responseText);
        log("signup ok");
        ajaxLogin("clientTest","clientPass",function(e,token){
          if(e) return log("login error : " + e.responseText);
          log("login ok, token: " + token);
          ajaxDelete(token,function(e,o){
            if(e) return log("delete error : " + e.responseText);
            log("delete ok");          
          });
        });
      });
    }
    
    function signupLoginPostRetrieveDelete(){
      ajaxSignup("clientTest","clientPass","clientMail","clientName",function(e,o){
        if(e) return log("signup error : " + e.responseText);
        log("signup ok");
        ajaxLogin("clientTest","clientPass",function(e,res){
          if(e) return log("login error : " + e.responseText);
          log("login ok, token: " + res.token);
          var token = res.token;
          ajaxPost(token,5,5,"msgTest",function(e){
            if(e) return log("post error : " + e.responseText);
            log("post ok");
            ajaxGet(token,5,5,function(e,res){
              if(e) return log("get error : " + e.responseText);
              log("get ok, tweets: " + JSON.stringify(res));
              ajaxDelete(token,function(e,o){
                if(e) return log("delete error : " + e.responseText);
                log("delete ok");          
              });
            });
          });
        });
      });
    } 
                     	
	$("#login_start").live("click",function(){							
       ajaxLogin("clientTest","clientPass",function(e,res){
              if(e) return log("login error : " + e.responseText);
              log("login ok, token: " + res.token);
              loginToken = res.token;
			  setupWatch(5000);
        });
	});
	
	function setupWatch(freq) {	    
	    refreshIntervalId = setInterval(getLocation, freq);
	}
	
	function getLocation() {		       	       
	   watch_id = navigator.geolocation.getCurrentPosition (successCallback, errorCallback, {timeout: 10000, enableHighAccuracy: true });		
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
	});

	// When the user views the Track Info page
	$('#proxytweet').live("pageshow",function(){

			$.ajax({
				url:'https://api.twitter.com/1/statuses/user_timeline/BobLeponge.json',
				dataType:'jsonp',
				success:function(data){
					$("#proxytweet_list").empty();
					$.each(data,function(i){
						if(i < 5){
							var tweet = data[i];
							$("#proxytweet_list").append($('<li/>').html('<a href="https://twitter.com/'+tweet.user.screen_name+'/status/'+tweet.id_str+'" data-rel="external"><h4>'+tweet.text+'</h4><p>at '+tweet.created_at+'</p></a>'));
						}
					});
					$("#proxytweet_list").listview('refresh');  				
				},
				error: function()	{
					alert("Impossible to get Tweets");
				}
			}); 		
	});

}