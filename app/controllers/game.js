$.win.onBack =  function() 
{
     $.win.close({activityEnterAnimation: Ti.Android.R.anim.slide_in_left,
                  activityExitAnimation: Ti.Android.R.anim.slide_out_right});
}


/*
 * Import Game level
 */
const GameLevel = require("gameLevel");
const gameLevel = new GameLevel($.tiglView);
