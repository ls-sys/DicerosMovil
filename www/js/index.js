var myApp = new Framework7
({
    modalTitle: "Diceros",
    material: true,
    materialPageLoadDelay: 0,
    smartSelectBackText: "Atras",
    smartSelectPopupCloseText: "Cerrar",
    smartSelectPickerCloseText: "Hecho",
	modalPreloaderTitle: "Cargando...",
	dynamicPageUrl: 'Pantalla-{{name}}'
	//uniqueHistory: true
});

var $$ = Dom7;

var histo = [];

var URLBASE = "http://192.168.20.250/Sistema";

var mainView = myApp.addView('.view-main');

$$(document).on('deviceready', function() {
    console.log("Device is ready!");
});

$$(document).on('pageInit', function (e) 
{
	var page = e.detail.page;
	
	histo.push(page.url);

	//console.log($$(page.container).html())

	switch(page.name)
	{
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
			$$(".card-content").css("overflow","scroll");
			break;
		case "FormDataI":
			/*if (mainView.history[mainView.history.length - 1] === undefined)
			{
				$$("div.navbar div.navbar-inner div.left a.link").click ();

				$$.each(mainView.history, function(i, ele)
				{
					console.log("*" + i + ": " + ele);
				});

				$$.each(mainView.contentCache, function(i, ele)
				{
					console.log(" * HistoCache: " + i)
				});
			}*/
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

/*function ForceBack(namePage)
{ 
	/*var temp = mainView.contentCache[namePage];
	var pos = mainView.history.indexOf(namePage);
	mainView.history.splice(pos, mainView.history.length - pos -1);

	$$.each(DicerosHistory, function(i, ele)
	{
		console.log(i + " => " + ele);
	});

	var last;
	for (var i = 0; i < DicerosHistory.length; i++)
	{
		if (DicerosHistory[DicerosHistory.length - 1] !== namePage)
			last = DicerosHistory.pop();
		else
		{
			DicerosHistory.push(last);
			break;
		}
	}
	
	var temp = mainView.history

	temp.splice(1, temp.length);
	mainView.history = temp.concat(DicerosHistory);

	$$.each(mainView.history, function(i, ele)
	{
		console.log(i + " N= " + ele);
	});

	

	mainView.router.back();/*{
		url: namePage,//mainView.contentCache[namePage],
		force: true
	});

	/*mainView.router.reloadContent(mainView.contentCache[namePage]);

}*/

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
	//alert("entra");
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
		where: valorBusqueda,
		nueva: "B"
	},function (data)
	{
		mainView.router.loadContent(data);
		myApp.hidePreloader();
	});
}

function checkAll(sender)
{
	alert("holaasd");
	//alert($$(sender).attr('checked'));
	$$(".form-checkbox input[type='checkbox']").each(function(i)
	{
		var t = $$(this).attr('checked');
		$$(this).attr('checked',!t);
	});
}


function backToMenu()
{
	$$.each(mainView.history, function(i, ele)
	{
		console.log(i + " N= " + ele);
	});

	mainView.router.reloadPage("#Pantalla-MainMenu");
	//mainView.router.back('MainMenu');
}

function LogOut()
{
	$$.get(URLBASE + "/UserProfile",
	{
		state: "10"
	},function (d)
	{
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
		//console.log(data);
		if (reload = 'R')
			mainView.router.reloadContent(data);
		else
			mainView.router.loadContent(data);
		//myApp.alert(data.length);
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
		myApp.alert("Usuario y Contraseña son requeridos! Verifique!");
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
				mainView.router.loadContent(data);
			}
			
			myApp.hidePreloader();
		});
    }	
};


