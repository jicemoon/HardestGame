/**
 * Created by jicemoon on 2015/9/2.
 */
window.onload = function (){
    var levelArray = [
        [2,6,0.01],[2,8,0.01],[2,9,0.01],[2,10,0.01],[2,11,0.01],
        [2,12,0.02],[2,13,0.02],[2,14,0.02],[2,15,0.02],[2,16,0.02],
        [2,17],[2,18],[2,19],[2,20],[2,21],
        [2,22],[2,23],[2,24],[2,25]];
    var hg = new HardestGame(document.getElementById("gameStage"), levelArray);
    hg.levelSuccessHandle = function (){
        document.getElementById("currentLevel").getElementsByTagName("span")[0].innerHTML = hg.level;
        var time = 3;
        document.getElementById("gameTip").innerHTML = "完美通过第" + (hg.level - 1) + "关, " + time + "秒后,开始第" + hg.level + "关";
        var interval = setInterval(function (){
            time--;
            document.getElementById("gameTip").innerHTML = "完美通过第" + (hg.level - 1) + "关, " + time + "秒后,开始<span>第" + hg.level + "关</span>";
            if(time <= 0){
                clearInterval(interval);
                document.getElementById("gameTip").innerHTML = "";
                hg.gameContinue(true);
            }
        },1000);
    }
    hg.gameOverHandle = function (){
        document.getElementById("currentLevel").getElementsByTagName("span")[0].innerHTML = hg.level;
        var time = 5;
        document.getElementById("gameTip").innerHTML = "游戏结束, " + time + "秒后,继续游戏";
        var interval = setInterval(function (){
            time--;
            document.getElementById("gameTip").innerHTML = "游戏结束, " + time + "秒后,继续游戏";
            if(time <= 0){
                clearInterval(interval);
                document.getElementById("gameTip").innerHTML = "";
                hg.gameContinue();
            }
        },1000);
    }
    hg.init();
    hg.canvas.parentNode.style.width = hg.canvas.width + "px";
    hg.canvas.parentNode.style.height = hg.canvas.height + "px";
    hg.gameStart();
    document.getElementById("currentLevel").getElementsByTagName("span")[0].innerHTML = hg.level;
}