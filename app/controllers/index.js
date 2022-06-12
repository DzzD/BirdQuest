
// $.index.open({activityEnterAnimation: Ti.Android.R.anim.fade_in,
//               activityExitAnimation: Ti.Android.R.anim.fade_out});
$.index.open();
         
function openGame()
{
    var view = Alloy.createController('game').getView();
	view.open({activityEnterAnimation: Titanium.App.Android.R.anim.slide_in_right,
               activityExitAnimation: Titanium.App.Android.R.anim.slide_out_left});
}


function openLevelSelection()
{
    var view = Alloy.createController('levelSelection').getView();
	view.open({activityEnterAnimation: Titanium.App.Android.R.anim.slide_in_right,
               activityExitAnimation: Titanium.App.Android.R.anim.slide_out_left});
}
