// Initialize app
var myApp = new Framework7
({
    modalTitle: "Diceros",
    material: true,
    materialPageLoadDelay: 0,
    smartSelectBackText: "Atras",
    smartSelectPopupCloseText: "Cerrar",
    smartSelectPickerCloseText: "Hecho",
	modalPreloaderTitle: "Cargando..."
});


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var URLBASE = "http://192.168.20.250/Sistema";

// Add view
var mainView = myApp.addView('.view-main');

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
});


// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
myApp.onPageInit('about', function (page) {
    // Do something here for "about" page
})

// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;

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
		case 'about':
			break;
		case 'SearchTable':
			$$(".card-content").css("overflow","scroll");
			break;
		case "FormDataU":
			$$("div[data-page='FormDataU'] div.item-input input, div[data-page='FormDataU'] div.item-input select").each(function(i, ele)
			{
				var PrimaryKey = $$(ele).attr("name");
				if (PrimaryKey.indexOf("P") == 4)
					$$(ele).attr('disabled','disabled');
			});
			break;
	}
    /*if (page.name === 'about') {
        // Following code will be executed for page with data-page attribute equal to "about"
        myApp.alert('Here comes About page');
    }*/
});

function CallMantenimiento(p, o, url)
{
	var FullUrl = URLBASE.replace("Sistema","") + url;
	//console.log(FullUrl);
	myApp.showPreloader();
	
	$$.get(FullUrl,{},function(data)
	{
		//console.log(data);
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
			var listInput = $$("div[data-page='FormDataI'] div.item-input input, div[data-page='FormDataI'] div.item-input select");

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
				//mainView.router.loadContent(data);
				myApp.hidePreloader();	
			});
			break;
	}
}

function CallModRegTable(sWhere)
{
	var valorBusqueda = $$("#"+sWhere).val();

	myApp.showPreloader();

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
	mainView.router.back('MainMenu');
}

function LogOut()
{
	$$("#fLogin input[name='name']").val("");
	$$("#fLogin input[name='passwd']").val("");
	mainView.router.back('index');
	$$.get(URLBASE + "/UserProfile",
	{
		state: "10"
	},function (d)
	{
		mainView.router.loadPage('index');
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

function enviarMetodo(tipo)
{
	myApp.showPreloader();
	$$.post(URLBASE + "/repartidor",
	{
		enviar: tipo
	},function (data)
	{
		//console.log(data);
		mainView.router.load({
			content: data,
			animatePages: true
		});
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
				
				myApp.alert(salida);2
			}
			else
			{
				mainView.router.loadContent(data);
			}
			
			myApp.hidePreloader();
		});
    }	
};


