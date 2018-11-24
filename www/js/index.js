
var URLBASE = "http" + ((window.localStorage.getItem("HOST_SSL") == 1)?"s":"") + 
	"://" + window.localStorage.getItem("URL_HOST") + "/Sistema";
var _PW = "$marfil$";

var myApp = new Framework7
({
    modalTitle: "Diceros",
	material: true,
	fastClicks: false,
	animateNavBackIcon: true,
    materialPageLoadDelay: 0,
    smartSelectBackText: "Atras",
    smartSelectPopupCloseText: "Cerrar",
    smartSelectPickerCloseText: "Hecho",
	modalPreloaderTitle: "Cargando...",
	dynamicPageUrl: 'Pantalla-{{name}}',
	uniqueHistory: true,
	template7Pages: true,
	precompileTemplates: true,
	preloadPreviousPage: false,
	cacheIgnore:[URLBASE+"/MovilDiceros?t7html=1", URLBASE+"/MovilDiceros?t7html=2", URLBASE+"/MovilDiceros?js=1", URLBASE+"/MovilDiceros?js=2", , URLBASE+"/MovilDiceros?js=3"],
	cache:false
});

var $$ = Dom7;

var NoticeMeSempai = null;

var xDown = null;                                                        
var yDown = null;

window.addEventListener('touchstart', handleTouchStart, false);        
window.addEventListener('touchmove', handleTouchMove, false);

var mainView = myApp.addView('.view-main');

function PingServer()
{
	var p = new Ping();
	var url = "http" + ((window.localStorage.getItem("HOST_SSL") == 1)?"s":"") + "://" + window.localStorage.getItem("URL_HOST");
	p.ping(url, function(err, data)
	{
		if (err)
		{
			myApp.addNotification(
			{
				message: "Server NOT Reachable",
				button:
				{
					text: "close",
					color: "red",
					close: true
				}
			});
			$$("#btnLogIn").addClass("disabled");
			console.error('Could not ping remote URL', err);
			SetSessionValue("SERVER_CONN", 0);
		}
		else
		{
			myApp.addNotification(
			{
				message: "Server Reachable",
				hold: 3500,
				button:
				{
					text: "close",
					color: "green",
					close: true
				}
			});
	
			$$("#btnLogIn").removeClass("disabled");
			console.log('Ping time was ' + String(data) + ' ms');
			
			SetSessionValue("SERVER_CONN", 1);
		}
	});
}

/*	Template7 Helper */

var printWBObj = function(objList, index, options)
{
	console.log(typeof(objList[index]) + "; " + index);
	if (typeof(objList[index]) === "string")
	{
		objList[index] = JSON.parse(objList[index]);
		console.log(objList[index]);
	}
	console.log(objList[index]["name"] + "; " + index); /// AQUI
	var objP = objList[index]["name"].split("_");
	var ID = objList[index]["col_name"];
	var rawval = objList[index]["RawVal"];
	var Enabled = (objP[1] == 'N')?'disabled="disabled"':'';
	var dataType = objP[3];
	var htmlF7 = "";
	name = ' name="' + objList[index]["name"] + '" ';

	var textCT = "KPHZ";
	if (textCT.search(objList[index]["content_type"]) == -1)
	{
		if(objList[index]["visible"] == "S")
		{
			switch (objList[index]["content_type"]) 
			{
				case 'M':
					htmlF7 = '<textarea class="resizable" id="' + ID + '" ' + name + objList[index]["acction"] + '>' + objList[index]["defValue"] + '</textarea>';
					break;
				case 'D':
				case 'G':
					var temp = "";
					switch (dataType)
					{
						case "IN":
						case "DE":
							temp = "number";
							break;
						case "VA":
							temp = "text";
							break;
						case "DA":
							temp = "date";
							break;
						case "DT":
							temp = "datetime-local";
							break;
						default:
							temp = "text";
							break;
					}
					htmlF7 = '<input type="'+ temp + '" ' + Enabled + ' id="' + ID + '" value="' + objList[index]["defValue"] + 
										'" placeholder="' + objList[index]["label"] + '" ' + name + objList[index]["acction"] + ">";
					break;
				case 'C':
					htmlF7 = '<div class="item-input">'+
							'<label class="label-switch">'+
								'<input type="checkbox" id="' + ID + '" checked="' + ((objList[index]["defValue"] == 1)?'true':'false') + '" '+ name +' >'+
								'<div class="checkbox"></div>'+
							'</label></div>';
					/*htmlF7 = '<label class="label-switch">'+
								'<input type="checkbox" '+ Enabled +' id="' + ID + '" checked="' + (objList[index]["defValue"] == 1)?'true':'false' + 
								'"' + name + objList[index]["acction"] + '><div class="checkbox"></div></label>';*/
					break;
				case 'Q':
				case 'B':
				case 'E':
					htmlF7 = '<select data-defval="' + rawval + '" id="' + ID + '" ' + Enabled + ' placeholder="Please choose..." ' + name + objList[index]["acction"] + ' >'+
								'<option value="Empty">-- Vacio --</option>' + objList[index]["defValue"] + '</select>';
					break;
				default:
					htmlF7 = '';
					break;
			}
		}
		else
		{
			htmlF7 = '<input class="HidenParams" type="hidden" value="' + objList[index]["defValue"] + '"' + name + objList[index]["acction"] + "/>";
		}
	}
	else if (objList[index]["content_type"] == "H")
	{
		htmlF7 = objList[index]["data_s"];
	}
	
	return htmlF7;
}

Template7.registerHelper('ReportBM', function(s, p, t, options)
{
	$$("#DyScriptReport").remove();

	/*var url_CSS = URLBASE + "/MovilDiceros?css=1";
	var dyCss = document.createAttribute('link');
	dyCss.id = "dyCSSReprt";
	dyCss.rel="stylesheet";
	dyCss.href = url_CSS;

	document.body.appendChild(dyCss);*/

	var url_JS = URLBASE + "/MovilDiceros?js=3&t="+Date.now();
	var DyScript = document.createElement('script');
	DyScript.id = "DyScriptReport";
	DyScript.src = url_JS;

	//<link rel="stylesheet" href="css/styles.css">

	document.body.appendChild(DyScript);

	$$.post(URLBASE + "/" + s,
	{
		Template: p,
		ContentType: t,
		d:10
	},function(data)
	{
		$$("#divHolder").html(data);
	});
	return "<div id='divHolder'>Cargando Reporte...</div>";
});

Template7.registerHelper('getBarUI', function(RowStatus, options)
{
	var salida = "";
	if (RowStatus == 1)
	{
		salida = "<div class=\"speed-dial\" id=\"ObjSpeedIU\">"
				+ "<a href=\"#\" class=\"floating-button\">"
                + "<i class=\"icon f7-icons\">more_vertical</i>"
                + "<i class=\"icon f7-icons closeRed\">close</i>"
                + "</a><div class=\"speed-dial-buttons\">"
                + "<a href=\"javascript:{MotorMovil('NewReg');}\" class=\"link\"><i class=\"icon f7-icons\">compose</i></a>"
                + "<a href=\"javascript:{MotorMovil('Reload');}\" class=\"link\"><i class=\"icon f7-icons\">reload</i></a></div></div>";
	}
	else if( (RowStatus * 1) == -2)
	{
		salida = "<div class=\"speed-dial\" id=\"ObjSpeedIU\">"
		+ "<a href=\"#\" class=\"floating-button\">"
		+ "<i class=\"icon f7-icons\">more_vertical</i>"
		+ "<i class=\"icon f7-icons closeRed\">close</i>"
		+ "</a><div class=\"speed-dial-buttons\">"
		+ "<a href=\"javascript:{MotorMovil('Save');}\" class=\"link\"><i class=\"icon f7-icons\">compose</i></a>"
		+ "<a href=\"javascript:{MotorMovil('Nuevo');}\" class=\"link\"><i class=\"icon f7-icons\">document_text_fill</i></a>"
		+ "<a href=\"javascript:{MotorMovil('FReg');}\" class=\"link\"><i class=\"icon f7-icons\">rewind</i></a>"
		+ "<a href=\"javascript:{MotorMovil('LReg');}\" class=\"link\"><i class=\"icon f7-icons\">fastforward</i></a>"
		+ "<a href=\"javascript:{MotorMovil('Reload');}\" class=\"link\"><i class=\"icon f7-icons\">reload</i></a></div></div>";
	}
	else if (RowStatus == 2)
	{
		salida = "<div class=\"speed-dial\" id=\"ObjSpeedIU\">"
		+ "<a href=\"#\" class=\"floating-button\">"
		+ "<i class=\"icon f7-icons\">more_vertical</i>"
		+ "<i class=\"icon f7-icons closeRed\">close</i>"
		+ "</a><div class=\"speed-dial-buttons\">"
		+ "<a href=\"javascript:{MotorMovil('Buscar');}\" class=\"link\"><i class=\"icon f7-icons\">search</i></a>"
		+ "<a href=\"javascript:{MotorMovil('Nuevo');}\" class=\"link\"><i class=\"icon f7-icons\">document_text_fill</i></a>"
		+ "<a href=\"javascript:{MotorMovil('FReg');}\" class=\"link\"><i class=\"icon f7-icons\">rewind</i></a>"
		+ "<a href=\"javascript:{MotorMovil('LReg');}\" class=\"link\"><i class=\"icon f7-icons\">fastforward</i></a>"
		+ "<a href=\"javascript:{MotorMovil('Reload');}\" class=\"link\"><i class=\"icon f7-icons\">reload</i></a></div></div>";
	}
	else if (RowStatus == 5)
	{
		salida = "<div class=\"speed-dial\" id=\"ObjSpeedIU\">"
		+ "<a href=\"#\" class=\"floating-button\">"
		+ "<i class=\"icon f7-icons\">more_vertical</i>"
		+ "<i class=\"icon f7-icons closeRed\">close</i>"
		+ "</a><div class=\"speed-dial-buttons\">"
		+ "<a href=\"javascript:{MotorMovil('ViewReport');}\" class=\"link\"><i class=\"icon f7-icons\">list</i></a>"
		+ "<a href=\"javascript:{MotorMovil('Reload');}\" class=\"link\"><i class=\"icon f7-icons\">reload</i></a></div></div>";
	}

	return salida;

});

Template7.registerHelper('getObjectByColName', function(objList, name, options)
{
	var lenObjt = objList.length;
	var index = 0;
	
	for (var i=0; i < lenObjt; i++)
	{
		var tempObj = objList[i]["col_name"];
		if (name == tempObj)
		{
			index = i;
			break;
		}
	}

	return printWBObj (objList, index, null);
});

Template7.registerHelper('getObject',printWBObj);


Template7.registerHelper('objectBuilder', function(name, content_type, visible, label, defValue, acction, data_s, col_name, rawval ,options)
{
	var objP = name.split("_");
	var ID = col_name;
	var Enabled = (objP[1] == 'N')?'disabled="disabled"':'';
	var dataType = objP[3];
	var htmlF7 = "";
	name = ' name="' + name + '" ';

	var textCT = "KPHZ";

	if (textCT.search(content_type) == -1) // Son objecto para construir
	{
		if (visible == "S")
		{
			htmlF7 = "<li class=\"item-content\">"+
					"<div class=\"item-inner\">"+
					"<div class=\"item-title label\">"+label+"</div>";

			switch (content_type) 
			{
				case 'M':
					htmlF7 = '<textarea class="resizable" id="' + ID + '" ' + name + acction + '>' + defValue + '</textarea>';
					break;
				case 'G':
				case 'D':
					var temp = "";
					switch (dataType)
					{
						case "IN":
						case "DE":
							temp = "number";
							break;
						case "VA":
							temp = "text";
							break;
						case "DA":
							temp = "date";
							break;
						case "DT":
							temp = "datetime-local";
							break;
						default:
							temp = "text";
							break;
					}
					htmlF7 += '<div class="item-input">'+
										'<input type="'+ temp + '" ' + Enabled + ' id="' + ID + '" value="' + defValue + 
										'" placeholder="' + label + '" ' + name + acction + "></div>";
					break;
				case 'C':
					htmlF7 += '<div class="item-input">'+
								'<label class="label-switch">'+
									'<input type="checkbox" id="' + ID + '" checked="' + ((defValue == 1)?'true':'false') + '" >'+
									'<div class="checkbox"></div>'+
								'</label></div>'
					/*htmlF7 += '<div class="item-input"><label class="label-switch">'+
								'<input type="checkbox" '+ Enabled +' id="' + ID + '" checked="' + (defValue == 1)?'true':'false' + 
								'"' + name + acction + '><div class="checkbox"></div></label></div>';*/
					break;
				case 'Q':
				case 'B':
				case 'E':
					htmlF7 += '<div class="item-input">'+
								'<select data-defval="'+ rawval +'" id="' + ID + '" ' + Enabled + ' placeholder="Please choose..." ' + name + acction + ' >'+
								'<option value="Empty">-- Vacio --</option>' + defValue + '</select></div>';
					break;
				default:
					htmlF7 += '<div></div>';
					break;
			}

			htmlF7 += '</div></li>';
		}
		else
			htmlF7 += '<input class="HidenParams" type="hidden" value="' + defValue + '"' + name + acction + "/>";
	}
	else if (content_type == "H")
	{
		htmlF7 += data_s;
	}
	return htmlF7;
});

/*	Fin de Helper */

var onSuccessShare = function(result) 
{
	alert("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
	console.log("Shared to app: " + result.app); // On Android result.app since plugin version 5.4.0 this is no longer empty. On iOS it's empty when sharing is cancelled (result.completed=false)
};
   
var onErrorShare = function(msg)
{
	alert("Sharing failed with message: " + msg);
};


function handleTouchStart(evt) 
{                                         
    xDown = evt.touches[0].clientX;                                      
    yDown = evt.touches[0].clientY;                                      
};

function handleTouchMove(evt)
{
	if ( ! xDown || ! yDown ) 
		return;
		
	var xUp = evt.touches[0].clientX;                                    
	var yUp = evt.touches[0].clientY;

	var xDiff = xDown - xUp;
	var yDiff = yDown - yUp;

	var swipeON = GetSValue("SWIPE_MODE");

	//alert (swipeON + ", ")

	if ( (Math.abs( xDiff ) > Math.abs( yDiff )) && swipeON == 1 )
	{
		if (xDiff > 0) // from rigth to Left Swipe
		{
			MotorMovil('LReg');
			//MotorMovil('Reload');
		}
		else	// from left to  Rigth Swipe
		{
			MotorMovil('FReg'); 
			//MotorMovil('Reload');
		}
	}
	/*else Up and down Swipe */
}

function savedPnU()
{
	var mp = window.localStorage.getItem("MP");
	var ALog = window.localStorage.getItem("ALogin");

	if (mp == 1)
	{
		$$("#fLogin input[name='passwd']").val(window.localStorage.getItem("pass"));
		$$("#fLogin input[name='name']").val(window.localStorage.getItem("usr"));

		$$("#fLogin input[name='passwd']").attr("disabled","disabled");
		$$("#fLogin input[name='name']").attr("disabled","disabled");

		$$("#cb_PASS").prop('checked', true);
	}

	if (ALog == 1)
	{
		$$("#cb_AutoLog").prop('checked', true);
		btn_click_btnLogIn();
	}
	else
		$$("#cb_AutoLog").prop('checked', false);
}

function QuitarPnU()
{

	if ($$("#cb_PASS").is(":checked"))
		$$("#cb_AutoLog").prop('checked', true);
	else
		$$("#cb_AutoLog").prop('checked', false);

	var mp = window.localStorage.getItem("MP");

	if (mp == 1 && !$$("#cb_PASS").is(":checked"))
	{
		$$("#fLogin input[name='passwd']").removeAttr("disabled");
		$$("#fLogin input[name='name']").removeAttr("disabled");

		$$("#fLogin input[name='passwd']").val("");
		$$("#fLogin input[name='name']").val("");

		window.localStorage.removeItem("pass");
		window.localStorage.removeItem("usr");
		window.localStorage.removeItem("MP");
	}
	
}

function ShareMSG(msg)
{
	var options = 
	{
		message: msg, // not supported on some apps (Facebook, Instagram)
		subject: 'Diceros Movil'
	};

	window.plugins.socialsharing.shareWithOptions(options, onSuccessShare, onErrorShare);
}

$$(document).on('deviceready', function() 
{
	try
	{
		console.log("cordova: "+device.cordova);
		console.log("model: "+device.model);
		console.log("platfrom: "+device.platform);
		console.log("UUID: "+device.uuid);
		console.log("version: "+device.version);
		console.log("manufacter: "+device.manufacturer);
		console.log("iV: "+device.isVirtual);
		console.log("serial: "+device.serial);

		var notificationOpenedCallback = function(jsonData) 
		{
			console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
		};

		window.plugins.OneSignal
			.startInit("6838c945-0d7c-446b-b96f-adae5eba6795")
			.handleNotificationOpened(notificationOpenedCallback)
			.endInit();

		console.log(AppVersion.version);
		$$("#chipVercion").html("Ver: " + AppVersion.version);
		
	}
	catch(error)
	{
		alert(error);
	}

	window.localStorage.setItem("URL_HOST", "diceros.ls-sys.com");
	window.localStorage.setItem("HOST_SSL", "1");

	URLBASE = "http" + ((window.localStorage.getItem("HOST_SSL") == 1)?"s":"") + 
	"://" + window.localStorage.getItem("URL_HOST") + "/Sistema";

	myApp.params.cacheIgnore = [URLBASE+"/MovilDiceros?t7html=1", URLBASE+"/MovilDiceros?t7html=2", URLBASE+"/MovilDiceros?js=1", URLBASE+"/MovilDiceros?js=2" , URLBASE+"/MovilDiceros?js=3"];

	console.log("Device is ready! " + URLBASE);
	
	document.addEventListener("backbutton", function(e)
	{
		var ap = GetSValue("ACTUAL_PAGE");
		if (ap == "index")
		{
			e.preventDefault();
			navigator.app.exitApp();
		}
		else
			backToMenu();
	}, false);

	PingServer();
	savedPnU();
});

$$(document).on('pageInit', function (e) 
{
	var page = e.detail.page;
	SetSessionValue ("ACTUAL_PAGE", page);
	SetSessionValue ("SWIPE_MODE", "0");
	window.sessionStorage.removeItem("ONCE_HIT");
	
	$$("#DyScriptAfter").remove();

	switch(page.name)
	{
		case 'settings':
			var sh = window.localStorage.getItem("URL_HOST");
			var ss = window.localStorage.getItem("HOST_SSL");

			$$("div[data-page='settings'] #hostURL").val(sh);
			if (ss == 1)
				$$("div[data-page='settings'] #SSLConn").prop('checked', true);
			else
				$$("div[data-page='settings'] #SSLConn").prop('checked', false);
			


			myApp.modalPassword('Administrator password:', 
			function (password) 
			{
				if (password === _PW)
				{
					$$("div[data-page='settings'] #hostURL").removeClass("disabled");
					$$("div[data-page='settings'] #SSLConn").removeClass("disabled");
					$$("div[data-page='settings'] #btn_save").removeClass("disabled");
				}
				else
				{
					myApp.alert("Incorrect password");
					mainView.router.back();
				}
			},
			function ()
			{
				mainView.router.back();
			});
			break;
		case 'index':
			if(GetSValue("SERVER_CONN") == 1)
				$$("#btnLogIn").removeClass("disabled");
			break;
		case 'MainMenu':

			$$.post( URLBASE + "/MovilDiceros",
			{
				cmd: "getUSRMenu"
			},
			function (dataRes)
			{
				if (dataRes == "NO_DEFAULT")
				{
					$$.post( URLBASE + "/MovilDiceros",
					{
						cmd: "Menu"
					},
					function (data)
					{
						$$("#CuerpoMenu").html(data);
						
						$$('.accordion-item').on('opened', function (e) {
							myApp.showPreloader();
							var projectIDObj = $$(this).children('.accordion-item-content').attr('id');
							var projectID = projectIDObj.replace("proy", "");
							
							$$.post(URLBASE + "/MovilDiceros",
							{
								cmd: "ItemsModulo",
								proy: projectID
							},
							function (htmlData)
							{
								var idMod = "#"+projectIDObj
								
								$$(idMod).html(htmlData);
								myApp.hidePreloader();
							});
							
						});
					});
				}
				else
				{
					var req = JSON.parse(dataRes);
					var tempUSR = window.localStorage.getItem("usr").toString().toUpperCase();

					req["USR"] = tempUSR;

					window.sessionStorage.setItem("REQ_HOME", JSON.stringify(req));

					CallMantenimiento(req["project"], req["object"], "NO_REPARTIR");
				}
			});


			
			break;
		case 'SearchTable':
			//$$(".card-content").css("overflow","scroll");
			break;
		case "FormDataI":
			//window.sessionStorage.clear();
			//clearTempVal();
			SetSessionValue ("SWIPE_MODE", "0");
			$$("div[data-page='FormDataI'] div.item-input input[name*='_'], div[data-page='FormDataI'] div.item-input select[name*='_']").each(function(i, ele)
			{
				saveTempVal(ele, 0);
				$$(ele).on("change", function(event){saveTempVal(this, 0);});
			});

			var url_JS = URLBASE + "/MovilDiceros?js=2&t="+Date.now();
			var DyScript = document.createElement('script');
			DyScript.id = "DyScriptAfter";
			DyScript.src = url_JS;

			document.body.appendChild(DyScript);
			break;
		case "FormDataU":
			var modoBusqueda = GetSValue("BTN_BUSQUEDA");
			
			//window.sessionStorage.clear();
			//clearTempVal();
			$$("div[data-page='FormDataU'] div.item-input input[name*='_'], div[data-page='FormDataU'] div.item-input select[name*='_']").each(function(i, ele)
			{
				saveTempVal(ele, 0);
				$$(ele).on("change", function(event){saveTempVal(this, 0);});
				if (modoBusqueda == null)
				{
					var PrimaryKey = $$(ele).attr("name");
					if (PrimaryKey.indexOf("P") == 4)
						$$(ele).attr('disabled','disabled');
				}
				else if (modoBusqueda == 2)
				{
					$$("div[data-page='FormDataU']").attr("data-page", "FormDataI");
				}

				if ($$(ele).attr("type") == "datetime-local")
				{
					$$(ele).val($$(ele).data("defval").replace(" ","T"));
				}
			});

			$$("div[data-page='FormDataI'] div.item-input input[type*='date']").each(function(i,ele)
			{
				console.log($$(ele).val());
			});
			
			$$("div.navbar div.navbar-inner div.left a.link span").text("Busqueda");
			//$$("div.navbar div.navbar-inner div.left a.link").attr("href", "javascript:{ForceBack('#Pantalla-FormDataI');}");
			SetSessionValue ("SWIPE_MODE", "1");
			$$("div[data-page='FormDataU'] div.item-input input[name*='_'], div[data-page='FormDataU'] div.item-input select[name*='_']").each(function (i,ele)
			{
				//saveTempVal(ele, 1);
				$$(ele).trigger("change");
			});

			var url_JS = URLBASE + "/MovilDiceros?js=2&t="+Date.now();
			var DyScript = document.createElement('script');
			DyScript.id = "DyScriptAfter";
			DyScript.src = url_JS;

			document.body.appendChild(DyScript);
			break;
	}
});

function clearTempVal()
{
	$$.each (Object.keys(window.sessionStorage), function (k, v)
	{
		console.log(k);
		if (k.indexOf("#") > 0)
		{
			window.sessionStorage.removeItem(k);
		}
	});
}

function ModificarAll()
{
	
	var ObjList = $$(".form-checkbox input[type='checkbox']:checked");
	var WL = "";

	for (var i = 0; i < ObjList.length; i++)
	{
		WL += ObjList[i].value + "|";
	}
	//alert (WL);

	window.sessionStorage.setItem("LP", 0);
	window.sessionStorage.setItem("Wlista", WL);
	myApp.showPreloader();

	$$.post(URLBASE + "/motor",
	{
		SubComando: "Modificar",
		nueva: "B",
		cmd: "MRes",
		where: WL,
		LP: 0
	},function (data)
	{
		data =  data.replace(/\r?\n|\r/g, " ") ;
		try
		{
			reloadT7Page(data, 1);
			//SetSessionValue ("SWIPE_MODE", "1");
		}
		catch( err)
		{
			alert(err);
		}
		myApp.hidePreloader();
	});

}

function TakePhotoMD(idImage)
{
	function onSuccess(imgData)
	{
		$$("#"+idImage).attr("src", imgData);
		myApp.hidePreloader();
		
	}
	function onFail(data)
	{
		myApp.alert(data);
		myApp.hidePreloader();
	}
	myApp.showPreloader();
	navigator.camera.getPicture(onSuccess, onFail, 
		{
			quality: 80,
			destinationType: Camera.DestinationType.FILE_URI,
			sourceType: Camera.PictureSourceType.CAMERA,
			allowEdit: true,
			encodingType: Camera.EncodingType.JPEG,
			saveToPhotoAlbum: false
		});
}

function ForceBack(namePageURL)
{ 
	mainView.router.back({
		url: namePageURL
	});
}

function reportFrontPage(request)
{
	try
	{
		$$.post(URLBASE + "/motor", 
		{
			"N_S_H_VO_ROW_STATUS": 5,
			"N_S_H_VO_INTERNAL_USER": request["USR"],
			"N_S_H_VO_PROJECT_ID": request["project"],
			"N_S_H_VO_OBJECT_ID": request["object"],
			"destino":"HTML"
		},
		function (data)
		{
			obj = JSON.parse(data);

			var url_JS = URLBASE + "/MovilDiceros?js=3&t="+Date.now();
			var DyScript = document.createElement('script');
			DyScript.id = "DyScriptReport";
			DyScript.src = url_JS;
			
			document.body.appendChild(DyScript);

			$$.post(URLBASE + "/" + obj.servlet,
			{
				Template: obj.template,
				ContentType: obj.type,
				d:10
			},
			function(dataHTML)
			{
				$$("#CuerpoMenu").html(dataHTML);
			});
			myApp.hidePreloader();
		});
	}
	catch(err1)
	{
		alert(err1);
	}
}

function CallMantenimiento(p, o, url)
{
	var FullUrl = "";
	if (url == "NO_USAR" || url == "NO_REPARTIR")
		FullUrl = URLBASE + "/repartidor?project=" + p + "&object=" + o + "&t="+Date.now();
	else
		FullUrl = URLBASE.replace("Sistema","") + url;

	myApp.showPreloader();
	
	$$("#DyScript").remove();

	$$.get(FullUrl,{},function(data)
	{
		var url_JS = URLBASE + "/MovilDiceros?js=1&t="+Date.now();
		var DyScript = document.createElement('script');
		if (url == "NO_REPARTIR")
		{
			var obj = JSON.parse(window.sessionStorage.getItem("REQ_HOME"));

			reportFrontPage(obj);
		}
		else
		{
			DyScript.onload = function ()
			{
				try
				{
					var textVal = "*T7Forms*";
					if (data.indexOf(textVal) != -1)
					{
						
						var tempData = data.split("~");
						var urlTemplate = tempData[0];
						var jsonDataTemplate = tempData[1];
						/*urlTemplate = urlTemplate.replace("*T7Forms*", "");
						urlTemplate = URLBASE + "/" + urlTemplate;*/
						var timestamp = Date.now();

						urlTemplate = URLBASE + "/MovilDiceros?t7html=1&t=" + timestamp;
						jsonDataTemplate = JSON.parse(jsonDataTemplate);
						
						mainView.router.load(
							{
								url: urlTemplate,
								context: jsonDataTemplate
							});				
					}
					else
						mainView.router.loadContent(data);
				}
				catch( err)
				{
					myApp.alert(err);
				}

				myApp.hidePreloader();	
			};
		}

		DyScript.id = "DyScript";
		DyScript.src = url_JS;

		document.body.appendChild(DyScript);
	});
}

function valOverNUnderFlow( x )
{
	var wl = window.sessionStorage.getItem("Wlista");
	var pl = window.sessionStorage.getItem("LP");

	pl = pl * 1;
	pl += (x == "LReg")?1:-1;
	
	wl = wl.slice(0, -1);
	var s = wl.split("|");
	console.log(wl)
	console.log(s)
	console.log(pl + ", " + s.length )

	console.log(pl < (s.length-1) & pl > -1);

	return pl < s.length & pl > -1
}

function getBase64Image(img) 
{
	var canvas = document.createElement("canvas");
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	var ctx = canvas.getContext("2d");
	ctx.scale(0.25,0.25);
	ctx.drawImage(img, 0, 0);
	var dataURL = canvas.toDataURL("image/png");

	return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  }

function MotorMovil(a)
{
	var playload = {};
	switch(a)
	{
		case "ViewReport":
			myApp.showPreloader();
			var listInput = $$("div[data-page='ReportForm'] div.item-input input[name*='_'], div[data-page='ReportForm'] div.item-input select[name*='_']");

			for (var i = 0; i < listInput.length; i++)
			{
				var ItemName = $$(listInput[i]).attr("name");
				var ItemVal  = $$(listInput[i]).val();
				playload[ItemName] = ItemVal; 
			}

			playload["destino"] = "HTML";

			if (typeof BeforeAction === "function")
				BeforeAction(a, playload);

			$$.post(URLBASE + "/motor", playload,
			function (data)
			{
				obj = JSON.parse(data);

				if (typeof AfterAction === "function")
					AfterAction(a, obj);
					
				mainView.router.load(
					{
						url: 'RHTML.html?t='+Date.now(),
						context: obj
					});
				myApp.hidePreloader();
			});

			break;
		case "Buscar":
			myApp.showPreloader();
			var listInput = $$("div[data-page='FormDataI'] div.item-input input[name*='_'], div[data-page='FormDataI'] div.item-input select[name*='_']");
			console.log(listInput.length);

			for (var i = 0; i < listInput.length; i++)
			{
				var ItemName = $$(listInput[i]).attr("name");
				var ItemVal  = $$(listInput[i]).val();
				playload[ItemName] = ItemVal; 
			}

			//console.log(playload);
			if (typeof BeforeAction === "function")
				BeforeAction(a, playload);

			$$.post(URLBASE + "/motor", playload,
			function (data)
			{
				if (typeof AfterAction === "function")
					AfterAction(a, data);

				mainView.router.loadContent(data);
				myApp.hidePreloader();	
			});
			break;
		case "Save":
		case "SaveT":
			myApp.showPreloader();

			$$("div[data-page='FormDataU'] input.HidenParams, div[data-page='FormDataU'] div.item-input input, div[data-page='FormDataU'] div.item-input select").each(function(i, ele)
			{
				var ItemName = $$(ele).attr("name");
				var tipoInput = $$(ele).attr("type");
				var ItemValue = $$(ele).val();

				if (tipoInput == "checkbox")
					ItemValue = ($$(ele).prop('checked'))?1:0;

				playload[ItemName] = ItemValue;
			});

			if (typeof BeforeAction === "function")
				BeforeAction(a, playload);

			$$.post(URLBASE + "/motor", playload,
			function (data)
			{
				if (data == "OK")
				{
					var SW = "";
					if (a == "SaveT")
					{
						SW = GetSValue("Wlista");
						var pl = GetSValue("LP");

						$$.post(URLBASE + "/motor",
						{
							SubComando: "Modificar",
							nueva: "B",
							cmd: "MRes",
							where: SW,
							LP: pl
						},function (data) 
						{
							data =  data.replace(/\r?\n|\r/g, "") ;
							var obj;
							try
							{
								obj = JSON.parse(data);

								if (typeof AfterAction === "function")
									AfterAction(a, obj);
								
								mainView.router.load(
									{
										template: Template7.templates.TListU,
										reload: true,
										context: obj
									});
							}
							catch( err)
							{
								alert(err);
							}
							myApp.hidePreloader();
						});
					}
					else
					{
						SW = GetSValue("LWhere");
					
						$$.post(URLBASE + "/motor",
						{
							SubComando: "Modificar",
							cmd: "PForm",
							where: SW,
							nueva: "B"
						},function (REdata)
						{
							if (typeof AfterAction === "function")
									AfterAction(a, REdata);

							mainView.router.reloadContent(REdata);
							myApp.hidePreloader();
						});
					}
				}
				else
				{
					myApp.alert(data);
					myApp.hidePreloader();	
				}
			});
			break;
		case "NewReg":
			myApp.showPreloader();
			
			$$("div[data-page='FormDataI'] input.HidenParams, div[data-page='FormDataI'] div.item-input input, div[data-page='FormDataI'] div.item-input select").each(function(i, ele)
			{
				var ItemName = $$(ele).attr("name");
				var ItemValue = $$(ele).val();
				playload[ItemName] = ItemValue;
			});

			if (typeof BeforeAction === "function")
				BeforeAction(a, playload);

			$$.post(URLBASE + "/motor", playload,
			function (data)
			{
				if (typeof AfterAction === "function")
					AfterAction(a, data);

				reloadT7Page(data, 0);
				myApp.hidePreloader();	
			});
			break;
		case "Reload":
			mainView.router.refreshPage();
			break;
		case "LReg":
		case "FReg":
			var wl = GetSValue("Wlista");
			var pl = GetSValue("LP");

			if (GetSValue("ONCE_HIT") == null)
			{
				SetSessionValue("ONCE_HIT", 1);
				if (valOverNUnderFlow(a) > 0)
				{
					if ((wl == null || pl == null))
					{
						//if ((wl == null || wl == '' || pl == null || pl == '') && valOverNUnderFlow())
						myApp.alert("No mas registros");
						//myApp.hidePreloader();
					}
					else
					{
						myApp.showPreloader();
						pl = pl * 1;
						pl += (a == "LReg")?1:-1;
						$$.post(URLBASE + "/motor",
						{
							SubComando: "Modificar",
							nueva: "B",
							cmd: "MRes",
							where: wl,
							LP: pl
						},function (data) 
						{
							data =  data.replace(/\r?\n|\r/g, " ");
							try
							{
								reloadT7Page(data, 2);
								SetSessionValue("LP", pl);
							}
							catch( err)
							{
								alert(err);
							}
							//mainView.router.refreshPage();
							window.sessionStorage.removeItem("ONCE_HIT");
							myApp.hidePreloader();
						});
					}
				}	
				else
				{
					SetSessionValue("ONCE_HIT", 1);
					myApp.alert("No mas registros");
					window.sessionStorage.removeItem("ONCE_HIT");
				}
			}
			
			break;
	}
}

function CallModRegTable(sWhere)
{
	var valorBusqueda = $$("#"+sWhere).val();

	myApp.showPreloader();

	window.sessionStorage.setItem("LWhere", valorBusqueda);

	$$.post(URLBASE + "/motor",
	{
		SubComando: "Modificar",
		cmd: "PForm",
		where: encodeURIComponent(valorBusqueda),
		nueva: "B"
	},function (data)
	{
		reloadT7Page(data, 1);
		myApp.hidePreloader();
	});
}

function FillChild(sender, hijos) 
{
	myApp.showPreloader();

	var valorPadre = $$(sender).val();
	var Np = $$(sender).attr("name");
	Np = Np.substring(6, Np.length);

	$$.post(URLBASE + "/MovilDiceros",
	{
		"cmd":"GetHijos",
		"NamePadre":Np,
		"valPadre": valorPadre,
		"idCKinde": hijos
	},function(data)
	{
		var HijosList = data.split("~");
		for (var i = 0; i < HijosList.length; i++)
		{
			if (HijosList[i].length > 0)
			{
				var temp = HijosList[i].split("|");
				var IdHijo = temp[0];
				var htmlHijo = temp[1];

				if (GetSValue("#"+IdHijo) == "Empty")
					SetSessionValue("#"+IdHijo, $$("#"+IdHijo).data("defval"));
				
				$$("#"+IdHijo).empty()
							  .append(htmlHijo)
							  .val(GetSValue("#"+IdHijo));
			}
		}
		myApp.hidePreloader();
	});
}

function checkAll(sender)
{
	$$(".form-checkbox input[type='checkbox']").each(function(i)
	{
		var t = $$(this).attr('checked');
		$$(this).attr('checked',!t);
	});
}

function backToMenu()
{
	try
	{
		mainView.router.back({
			url: "#Pantalla-MainMenu"
		});
	}
	catch(ext)
	{
		console.log(ext);
		console.log (mainView.history);

		//mainView.router.back();

		console.log (mainView.history);

	}
}

function LogOut()
{
	$$.get(URLBASE + "/UserProfile",
	{
		state: "10"
	},function (d)
	{
		try
		{
			window.localStorage.removeItem("ALogin");

			savedPnU();
			//mainView.router.reloadPage('#index');
		
			$$("#chipVercion").html("Ver: " + AppVersion.version);
		}
		catch(er)
		{}
		mainView.router.back({
			url:"#index"
		});
	});
}

function SetSessionValue(key, value)
{
	window.sessionStorage.setItem(key, value);	
}

function GetSValue(Key)
{
	return window.sessionStorage.getItem(Key);
}

function enviarMetodo(tipo, reload)
{
	myApp.showPreloader();
	$$.post(URLBASE + "/repartidor",
	{
		enviar: tipo
	},function (data)
	{
		/*if (reload == 'R')
			mainView.router.reloadContent(data);
		else
		{*/
		reloadT7Page(data, 0);//mainView.router.loadContent(data);
		//}
		myApp.hidePreloader();
	});
}

function reloadT7Page(data, type)
{
	var textVal = "*T7Forms*";
	try
	{
		if (data.indexOf(textVal) != -1)
		{
			var tempData = data.split("~");
			var urlTemplate = tempData[0];
			var jsonDataTemplate = tempData[1];

			/*urlTemplate = urlTemplate.replace("*T7Forms*", "");
			urlTemplate = URLBASE + "/" + urlTemplate;*/
			jsonDataTemplate =  jsonDataTemplate.replace(/\r?\n|\r/g, "");
			jsonDataTemplate = JSON.parse(jsonDataTemplate);

			var timestamp = Date.now();
		
			urlTemplate = URLBASE + "/MovilDiceros?t7html=" + jsonDataTemplate.ROWStatusVal + "&t=" + timestamp;

			SetSessionValue("BTN_BUSQUEDA",jsonDataTemplate.ROWStatusVal);

			switch(type)
			{
				case 0:
				case 2:
					mainView.router.load(
						{
							url: urlTemplate,
							reload: true,
							context: jsonDataTemplate
						});
					break;
				case 1:
					mainView.router.load(
						{
							url: urlTemplate,
							context: jsonDataTemplate
						});	
					break;
			}	
		}
		else 
		{
			if (type > 0)
			{
				try
				{
					var obj = data.replace(/\r?\n|\r/g, " ");
					obj = JSON.parse(obj);

					mainView.router.load(
						{
							template: Template7.templates.TListU,
							reload:((type == 1)?false:true),
							context: obj
						});
				}
				catch(er)
				{
					mainView.router.loadContent(data);
				}
			}
			else
				mainView.router.reloadContent(data);
		}
			
	}
	catch(err)
	{
		alert (err);
	}
}

function saveTempVal(sender, raw)
{
	var id = "#"+$$(sender).attr('id');
	var value = (raw === 1)?$$(sender).data("defval"):$$(sender).val();

	SetSessionValue(id, value);
}

//$$("#btnLogIn").click(function ()
function btn_click_btnLogIn()
{
	myApp.showPreloader();
	var nombreUser = $$("#fLogin input[name='name']").val();
    var pass = $$("#fLogin input[name='passwd']").val();
	
	if (nombreUser == "" || pass == "")
	{
		myApp.alert("Usuario y Contrase"+String.fromCharCode(241)+"a son requeridos! Verifique!");
		myApp.hidePreloader();
	}
    else
    {
        $$.post(URLBASE + "/DBConnMngr",
		{
			user: nombreUser,
			password: pass,
			maca01: "00:01:02:03",
			token: "token",
			movil: "android"
		},
		function (data)
		{
			if (data.indexOf("E101%") >= 0)
			{
				var errorStr = data.split("|");
				var salida = "";
				
				$$.each(errorStr, function(i, ele)
				{
					if (ele != "E101%")
						salida += ele + "\n";
				});
				
				myApp.alert(salida);
			}

			if (data.indexOf("Usuario no existe o esta bloqueado. Consulte con el Administrador") > 0)
			{
				myApp.alert("Error... \nRevise su nombre de usuario y clave de acceso y reintente de nuevo");
			}
			else
			{
				var mp = window.localStorage.getItem("MP");
				var ALog = window.localStorage.getItem("ALogin");

				
				if ($$("#cb_PASS").is(":checked") && mp != 1)
				{
					window.localStorage.setItem("pass", $$("#fLogin input[name='passwd']").val());
					window.localStorage.setItem("usr", $$("#fLogin input[name='name']").val());
					window.localStorage.setItem("MP", 1);
				}

				if ($$("#cb_AutoLog").is(":checked") && ALog != 1)
				{
					var u = $$("#fLogin input[name='passwd']").val();
					var p = $$("#fLogin input[name='name']").val();

					if (u.length > 0 && p.length >0)
					{
						window.localStorage.setItem("pass", $$("#fLogin input[name='passwd']").val());
						window.localStorage.setItem("usr", $$("#fLogin input[name='name']").val());
						window.localStorage.setItem("MP", 1);
						window.localStorage.setItem("ALogin", 1);
					}
					else
						myApp.alert("Usuario y Password Son campos requeridos");
				}
				mainView.router.loadContent(data);
				window.localStorage.setItem("usr", $$("#fLogin input[name='name']").val());
				
				try
				{
					window.plugins.OneSignal.getPermissionSubscriptionState(function(status) 
					{
						window.sessionStorage.setItem("FBT", status.subscriptionStatus.userId);
						//alert (status.subscriptionStatus.userId + "/" + status.subscriptionStatus.pushToken); 
						
						$$.post(URLBASE + "/MovilDiceros",
						{
							cmd: "saveMovilInfo",
							uuid: device.uuid,
							model: device.model,
							platform: device.platform,
							ver: device.version,
							serialNo: device.serial,
							FBMToken: status.subscriptionStatus.userId
						},
						function(responce)
						{
							if (responce.indexOf("OK") == 0)
							{
								var grupo = responce.split("|");
								window.plugins.OneSignal.sendTag("DM", "true");
								window.plugins.OneSignal.sendTag("Grupo", grupo[1]);
								window.plugins.OneSignal.sendTag("Sub_Grupo_1", "unico");
							}
							else
							{
								//myApp.alert(responce);
							}
						});
						
					});		
				}
				catch(ex)
				{
					alert(ex);
				}
			}
			
			myApp.hidePreloader();
		});
    }	
}

function btn_click_saveSettings()
{
	window.localStorage.setItem("URL_HOST", $$("div[data-page='settings'] #hostURL").val());
	window.localStorage.setItem("HOST_SSL", $$("div[data-page='settings'] #SSLConn").prop('checked')?"1":"0");

	URLBASE = "http" + ((window.localStorage.getItem("HOST_SSL") == 1)?"s":"") + 
	"://" + window.localStorage.getItem("URL_HOST") + "/Sistema";

	myApp.params.cacheIgnore = [URLBASE+"/MovilDiceros?t7html=1", URLBASE+"/MovilDiceros?t7html=2", URLBASE+"/MovilDiceros?js=1", URLBASE+"/MovilDiceros?js=2" , URLBASE+"/MovilDiceros?js=3"];

	PingServer();

	mainView.router.back();
}


