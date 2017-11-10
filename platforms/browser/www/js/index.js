// Initialize app
var myApp = new Framework7
({
    modalTitle: "Diceros",
    material: true,
    materialPageLoadDelay: 0,
    smartSelectBackText: "Atras",
    smartSelectPopupCloseText: "Cerrar",
    smartSelectPickerCloseText: "Hecho",
	modalPreloaderTitle: "Cargando... "
});


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

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

    if (page.name === 'about') {
        // Following code will be executed for page with data-page attribute equal to "about"
        myApp.alert('Here comes About page');
    }
});


function LogOut()
{
	$$("#fLogin input[name='name']").val("");
	$$("#fLogin input[name='passwd']").val("");
	mainView.router.back('index');
}

$$("#btnLogIn").click(function ()
{
	myApp.showPreloader();
	var nombreUser = $$("#fLogin input[name='name']").val();
    var pass = $$("#fLogin input[name='passwd']").val();
    
    if (nombreUser == "")
    {
        myApp.alert("El usuario es requerido");
    }
    else
    {
        $$.post("http://192.168.20.250/Sistema/DBConnMngr",
		{
			user: nombreUser,
			password: pass,
			maca01: "00:01:02:03",
			token: "token",
			movil: "android"
		},
		function (data)
		{
			mainView.router.loadContent(data);
			myApp.hidePreloader();
		});
    }	
});

