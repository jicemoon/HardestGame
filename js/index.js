/**
 * Created by jicemoon on 2015/9/2.
 */
window.onload = function (){
    var levelArray = [
        [2,6,0.01],[2,8,0.01],[2,9,0.01],[2,10,0.01],[2,11,0.01],
        [2,12,0.02],[2,13,0.02],[2,14,0.02],[2,15,0.02],[2,16,0.02],
        [2,17],[2,18],[2,19],[2,20],[2,21],
        [2,22],[2,23],[2,24],[2,25]];
    //初始化游戏, 两个参数分别表示"游戏所处的canvas画布元素"和"关卡设置, 可以省略(省略后将使用默认设置)"
    var hg = new HardestGame(document.getElementById("gameStage"), levelArray);
    //游戏成功过关
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
    var overModel = document.getElementById('gameOverDialog');
    var btnContinue = document.getElementById('btnContinue');
    var btnReStart = document.getElementById('btnReStart');
    var overLevel = document.getElementById('overLevel');
    btnContinue.addEventListener('click', function () {
        overModel.style.display = 'none';
        hg.gameContinue();
    });
    btnReStart.addEventListener('click', function () {
        document.getElementById("currentLevel").getElementsByTagName("span")[0].innerHTML = hg.level;
        overModel.style.display = 'none';
        hg.gameStart();
    });
    //游戏失败结束
    hg.gameOverHandle = function (level){
        overLevel.innerHTML = level;
        overModel.style.display = 'block';
        // document.getElementById("currentLevel").getElementsByTagName("span")[0].innerHTML = hg.level;
        // var time = 5;
        // document.getElementById("gameTip").innerHTML = "游戏结束, " + time + "秒后,继续游戏";
        // var interval = setInterval(function (){
        //     time--;
        //     document.getElementById("gameTip").innerHTML = "游戏结束, " + time + "秒后,继续游戏";
        //     if(time <= 0){
        //         clearInterval(interval);
        //         document.getElementById("gameTip").innerHTML = "";
        //         // hg.gameContinue();
        //         hg.gameStart();
        //     }
        // },1000);
    }
    //初始化游戏
    hg.init();
    hg.canvas.parentNode.style.width = hg.canvas.width + "px";
    hg.canvas.parentNode.style.height = hg.canvas.height + "px";
    //游戏开始
    hg.gameStart();
    document.getElementById("currentLevel").getElementsByTagName("span")[0].innerHTML = hg.level;
}