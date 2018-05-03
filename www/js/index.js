var myApp = new Framework7
({
    modalTitle: "Diceros",
    material: true,
    materialPageLoadDelay: 0,
    smartSelectBackText: "Atras",
    smartSelectPopupCloseText: "Cerrar",
    smartSelectPickerCloseText: "Hecho",
	modalPreloaderTitle: "Cargando...",
	dynamicPageUrl: 'Pantalla-{{name}}',
	uniqueHistory: true,
	template7Pages: true,
	precompileTemplates: true
});

var $$ = Dom7;

var URLBASE = "http://192.168.20.250/Sistema";

var mainView = myApp.addView('.view-main');

function savedPnU()
{
	var mp = window.localStorage.getItem("MP");

	if (mp == 1)
	{
		$$("#fLogin input[name='passwd']").val(window.localStorage.getItem("pass"));
		$$("#fLogin input[name='name']").val(window.localStorage.getItem("usr"));

		$$("#fLogin input[name='passwd']").attr("disabled","disabled");
		$$("#fLogin input[name='name']").attr("disabled","disabled");

		$$("#cb_PASS").attr('checked','checked');
	}
}

function QuitarPnU()
{
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

$$(document).on('deviceready', function() {
	console.log("Device is ready!");
	savedPnU();
});

$$(document).on('pageInit', function (e) 
{
	var page = e.detail.page;
	
	switch(page.name)
	{
		case 'index':
			break;
		case 'MainMenu':
			$$.post( URLBASE + "/MovilDiceros",
			{
				cmd: "Menu"
			},
			function (data)
			{
				$$("#CuerpoMenu").html(data)
				
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
			break;
		case 'SearchTable':
			//$$(".card-content").css("overflow","scroll");
			break;
		case "FormDataI":
			break;
		case "FormDataU":
			$$("div[data-page='FormDataU'] div.item-input input[name*='_'], div[data-page='FormDataU'] div.item-input select[name*='_']").each(function(i, ele)
			{
				var PrimaryKey = $$(ele).attr("name");
				if (PrimaryKey.indexOf("P") == 4)
					$$(ele).attr('disabled','disabled');
			});
			
			$$("div.navbar div.navbar-inner div.left a.link span").text("Busqueda");
			//$$("div.navbar div.navbar-inner div.left a.link").attr("href", "javascript:{ForceBack('#Pantalla-FormDataI');}");
			break;
	}
});

function ModificarAll()
{
	
	var ObjList = $$(".form-checkbox input[type='checkbox']:checked");
	var WL = "";

	for (var i = 0; i < ObjList.length; i++)
	{
		WL += ObjList[i].value + "|";
	}
	alert (WL);

	window.sessionStorage.setItem("LP", 1);
	window.sessionStorage.setItem("Wlista", WL);
	myApp.showPreloader();

	$$.post(URLBASE + "/motor",
	{
		SubComando: "Modificar",
		nueva: "B",
		cmd: "MRes",
		where: WL,
		LP: 1
	},function (data)
	{
		alert ("{" + data + "}");

		console.log("{" + data + "}");

		var obj = JSON.parse("{" + data + "}");
		alert (obj);
		/*mainView.router.load(
			{
				template: Template7.templates.TListU,
				context: {}
			});*/
		
		myApp.hidePreloader();
	});

}

function ForceBack(namePageURL)
{ 
	mainView.router.back({
		url: namePageURL
	});
}

function CallMantenimiento(p, o, url)
{
	var FullUrl = URLBASE.replace("Sistema","") + url;
	myApp.showPreloader();
	
	$$.get(FullUrl,{},function(data)
	{
		mainView.router.loadContent(data);
		myApp.hidePreloader();		
	});
}

function MotorMovil(a)
{
	var playload = {};
	switch(a)
	{
		case "Buscar":
			myApp.showPreloader();
			var listInput = $$("div[data-page='FormDataI'] div.item-input input[name*='_'], div[data-page='FormDataI'] div.item-input select[name*='_']");

			for (var i = 0; i < listInput.length; i++)
			{
				var ItemName = $$(listInput[i]).attr("name");
				var ItemVal  = $$(listInput[i]).val();
				playload[ItemName] = ItemVal; 
			}

			$$.post(URLBASE + "/motor", playload,
			function (data)
			{
				mainView.router.loadContent(data);
				myApp.hidePreloader();	
			});
			break;
		case "Save":
			myApp.showPreloader();

			$$("div[data-page='FormDataU'] div.item-input input, div[data-page='FormDataU'] div.item-input select").each(function(i, ele)
			{
				var ItemName = $$(ele).attr("name");
				var ItemValue = $$(ele).val();
				playload[ItemName] = ItemValue;
			});

			$$.post(URLBASE + "/motor", playload,
			function (data)
			{
				if (data == "OK")
				{
					$$.post(URLBASE + "/motor",
					{
						SubComando: "Modificar",
						cmd: "PForm",
						where: window.sessionStorage.getItem("LWhere"),
						nueva: "B"
					},function (REdata)
					{
						mainView.router.reloadContent(REdata);
						myApp.hidePreloader();
					});
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
			
			$$("div[data-page='FormDataI'] div.item-input input, div[data-page='FormDataI'] div.item-input select").each(function(i, ele)
			{
				var ItemName = $$(ele).attr("name");
				var ItemValue = $$(ele).val();
				playload[ItemName] = ItemValue;
			});

			$$.post(URLBASE + "/motor", playload,
			function (data)
			{
				mainView.router.reloadContent(data);
				myApp.hidePreloader();	
			});
			break;
		case "Reload":
		mainView.router.refreshPage();
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
		mainView.router.loadContent(data);
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
	mainView.router.back({
		url: "#Pantalla-MainMenu"
	});
}

function LogOut()
{
	$$.get(URLBASE + "/UserProfile",
	{
		state: "10"
	},function (d)
	{
		savedPnU();
		mainView.router.reloadPage('#index');
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
		if (reload = 'R')
			mainView.router.reloadContent(data);
		else
			mainView.router.loadContent(data);
		myApp.hidePreloader();
	});
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
			else
			{
				var mp = window.localStorage.getItem("MP");

				if ($$("#cb_PASS").is(":checked") && mp != 1)
				{
					window.localStorage.setItem("pass", $$("#fLogin input[name='passwd']").val());
					window.localStorage.setItem("usr", $$("#fLogin input[name='name']").val());
					window.localStorage.setItem("MP", 1);
				}
				mainView.router.loadContent(data);
			}
			
			myApp.hidePreloader();
		});
    }	
};


