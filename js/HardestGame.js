/**
 * Created by jicemoon on 2015/9/1.
 */
(function () {
    //canvas宽度
    var CANVAS_WIDTH = window.innerWidth;
    //canvas高度
    var CANVAS_HEIGHT = window.innerHeight;
    CANVAS_WIDTH = CANVAS_WIDTH / CANVAS_HEIGHT>0.70?CANVAS_HEIGHT*0.70:CANVAS_WIDTH;
    //大圆半径, 旋转中心处的圆
    var RADIUS_BIG = 20;
    //小圆半径, 旋转周围及子弹圆形半径
    var RADIUS_SMALL = 10;
    //默认旋转速度, 弧度为单位
    var ROTATION_SPEED = 0.03;
    //旋转半径
    var ROTATION_RADIUS = Math.max(CANVAS_HEIGHT * 0.25, CANVAS_WIDTH * 0.5 - 40);
    //旋转中心
    var ROTATION_CENTER = {x: CANVAS_WIDTH * 0.5, y:ROTATION_RADIUS + RADIUS_SMALL + 10};
    //子弹发射速度
    var BULLET_SPEED = -12;
    //子弹之间的距离
    var BULLET_SPACE = 15 + RADIUS_SMALL * 2;
    //子弹最高处的y坐标, 实际坐标为此值减去子弹半径
    var BULLET_Y = ROTATION_CENTER.y + ROTATION_RADIUS + BULLET_SPACE + CANVAS_HEIGHT * 0.2;
    var FILL_STYLE = "#000000";
    var BULLET_TEXT_STYLE = "#ffffff";

    if(!window["extendClass"]){
        window["extendClass"] = function (sonClass, parentClass) {
            if (typeof parentClass === "function" && typeof sonClass === "function") {
                sonClass.prototype = new ((function () {}).prototype = parentClass.prototype).constructor();
                sonClass.prototype.constructor = sonClass;
                sonClass.prototype.super = parentClass;
            }
        }
    };
    /***各种圆形的基类**/
    function Circle(x, y, radius,fillStyle, strokeStyle) {
        if(fillStyle == undefined){
            fillStyle = "#000000";
        }
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.fillStyle = fillStyle;
        this.strokeStyle = strokeStyle;
    };
    Circle.prototype = {
        update:function (){

        },
        paint:function (context){
            context.save();
            if(this.strokeStyle){
                context.strokeStyle = this.strokeStyle;
                context.lineWidth = 1;
            }
            context.fillStyle = this.fillStyle;
            context.beginPath();
            context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
            context.fill();
            if(this.strokeStyle){
                context.stroke();
            }
            context.restore();
        }
    };
    /**中心大圆**/
    function CircleCenter(fillStyle, strokeStyle){
        this.super.call(this, ROTATION_CENTER.x,ROTATION_CENTER.y,RADIUS_BIG,fillStyle, strokeStyle);
    };
    extendClass(CircleCenter, Circle);
    CircleCenter.prototype.paint = function (context){
        this.super.prototype.paint.call(this, context);
    };
    /**跟随旋转的小圆**/
    function CircleRotation(angle,fillStyle, strokeStyle){
        this.super.call(this, 0,0,RADIUS_SMALL,fillStyle, strokeStyle);
        this.angle = angle;
        this.resetPosition();
    };
    extendClass(CircleRotation, Circle);
    CircleRotation.prototype.update = function (rs){
        this.angle += rs;
        this.resetPosition();
    };
    CircleRotation.prototype.resetPosition = function (){
        this.x = ROTATION_CENTER.x + ROTATION_RADIUS * Math.cos(this.angle);
        this.y = ROTATION_CENTER.y + ROTATION_RADIUS * Math.sin(this.angle);
    };
    CircleRotation.prototype.paint = function (context){
        context.save();
        context.strokeStyle = this.strokeStyle?this.strokeStyle:"#000000";
        context.lineWidth = 1;
        context.moveTo(ROTATION_CENTER.x, ROTATION_CENTER.y);
        context.lineTo(this.x, this.y);
        context.stroke();
        context.restore();
        this.super.prototype.paint.call(this, context);
    };
    /**用来发射的小圆, 即其他注释处所说的子弹**/
    function CircleBullet(y,index,fillStyle, strokeStyle){
        this.super.call(this, ROTATION_CENTER.x,y,RADIUS_SMALL,fillStyle, strokeStyle);
        this.index = index;
        this.newY = this.y;
    };
    extendClass(CircleBullet, Circle);
    CircleBullet.prototype.update = function (){
        if(this.y > this.newY)
        {
            this.y += BULLET_SPEED;
            this.y = this.y<this.newY?this.newY:this.y;
        }
    };
    CircleBullet.prototype.paint = function (context){
        this.super.prototype.paint.call(this, context);
        context.save();
        context.font = RADIUS_SMALL + "px";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = BULLET_TEXT_STYLE;
        context.fillText(this.index, this.x, this.y, RADIUS_SMALL * 2);
        context.restore();
    };

    /***
     * 初始化Game对象
     * @param canvas: 游戏所处的canvas画布元素;
     * @param levelArray: 关卡设置, 可以省略(省略后将使用默认设置),
     * 数组中每关有三个数字,分别表示当前关卡
     * 默认旋转轴上的圆形个数/子弹个数/旋转速度(弧度),
     * 其中前两个是必须的, 最后一个, 如果省略, 将用默认值0.03;
     * **/
    function Game(canvas, levelArray){
        if(!canvas || !canvas.getContext){
            throw new Error("参数canvas不能为空, 且必须为canvas元素");
        }
        this.canvas = canvas;
        if(!levelArray){
            levelArray = [
                [2,6,0.01],[2,8,0.01],[2,9,0.01],[2,10,0.01],[2,11,0.01],
                [2,12,0.02],[2,13,0.02],[2,14,0.02],[2,15,0.02],[2,16,0.02],
                [2,17],[2,18],[2,19],[2,20],[2,21],
                [2,22],[2,23],[2,24],[2,25]];
        }
        this.levelArray = levelArray;
    }
    Game.prototype = {
        level:1, /*游戏当前关卡*/
        isPause:false, /*游戏当前是否处于暂停状态, 可通过gamePause方法暂停, 只读*/
        isOver:true,/*当前游戏是否已经结束,只读*/
        isCanTap:true,/*当前游戏Canvas是否可以点击,只读*/
        centerCircle:null,
        rotationCircles:[],
        bulletCircles:[],
        rotationSpeed:0.03,
        mobileTouch:null,
        levelSpaceTime:1,
        init:function (){
            this.canvas.width = CANVAS_WIDTH;
            this.canvas.height = CANVAS_HEIGHT;
            this.context = this.canvas.getContext("2d");
            if(!this.centerCircle)
                this.centerCircle = new CircleCenter(FILL_STYLE);
            var self = this;
            this.mobileTouch = new JicemoonMobileTouch(this.canvas,{tap: function (evt){
                self.tapHandle.call(self, evt);
            }});
        },
        gameStart:function (){
            this.level = 1;
            this.isPause = false;
            this.isOver = false;
            this.isCanTap = true;
            this.levelChange.call(this);
            this.update.call(this);
        },
        gamePause:function (){
            this.isCanTap = false;
            this.isPause = true;
        },
        gameContinue:function(resetLevel){
            if (!this.isPause) return;
            this.isPause = false;
            this.isCanTap = true;
            if(this.isOver || resetLevel){
                this.levelChange.call(this);
                this.isOver = false;
            }
            this.update.call(this);
        },
        gameOver:function (){
            this.isOver = true;
            this.isCanTap = false;
            if(this.gameOverHandle){
                this.gameOverHandle.call(this,this.level);
            }
        },
        update:function (){
            if(!this.isPause&&!this.isOver){
                var i, lens;
                lens = this.rotationCircles.length;
                for(i = 0; i < lens; i++){
                    this.rotationCircles[i].update(this.rotationSpeed);
                }
                lens = this.bulletCircles.length;
                for(i = 0; i < lens; i++){
                    this.bulletCircles[i].update();
                }
                if(!this.isCanTap){
                    var tempBC = this.bulletCircles[lens - 1];
                    if(tempBC.y <=  ROTATION_CENTER.y + ROTATION_RADIUS + 2 * RADIUS_SMALL){
                        if(this.checkCollision.call(this,tempBC)){
                            this.gameOver.call(this);
                        }
                        else if(tempBC.y ==  ROTATION_CENTER.y + ROTATION_RADIUS){
                            this.bulletCircles.pop();
                            this.isCanTap = true;
                            this.rotationCircles.push(new CircleRotation(Math.PI * 0.5, FILL_STYLE));
                            if(this.bulletCircles.length <= 0){
                                this.nextLevel.call(this);
                            }
                        }
                    }
                }
                this.paint.call(this);
            }
        },
        paint:function (){
            var lens, i;
            this.context.clearRect(0,0,CANVAS_WIDTH, CANVAS_HEIGHT);
            lens = this.rotationCircles.length;
            for(i = 0; i < lens; i++){
                this.rotationCircles[i].paint(this.context);
            }
            lens = this.bulletCircles.length;
            for(i = 0; i < lens; i++){
                this.bulletCircles[i].paint(this.context);
            }
            this.centerCircle.paint(this.context);
            var self = this;
            window.requestAnimationFrame(function (){
                self.update.call(self);
            });
        },
        nextLevel:function (){
            var self = this;
            self.level++;
            self.gamePause.call(self);
            if(self.levelSuccessHandle){
                self.levelSuccessHandle(self.level)
            }
            else{
                setTimeout(function (){
                    self.gameContinue.call(self,true);
                },1000 * this.levelSpaceTime);
            }
        },
        levelChange:function (){
            this.rotationCircles = [];
            this.bulletCircles = [];
            var i,lens,levelA,tempCircle,ta;
            levelA = Math.min(this.level-1, this.levelArray.length - 1);
            lens = this.levelArray[levelA][0];
            ta = Math.PI * 2 / lens;
            for(i = 0; i < lens; i++){
                tempCircle = new CircleRotation(ta*i,FILL_STYLE);
                this.rotationCircles.push(tempCircle);
            }
            lens = this.levelArray[levelA][1];
            for(i = 0; i < lens; i++){
                tempCircle = new CircleBullet(BULLET_Y + (BULLET_SPACE) * (lens - i - 1),(i+1),FILL_STYLE);
                this.bulletCircles.push(tempCircle);
            }
            if(this.levelArray[levelA].length == 3){
                this.rotationSpeed = this.levelArray[levelA][2];
            }
            else{
                this.rotationSpeed = ROTATION_SPEED;
            }
        },
        checkCollision:function (circleBullet){
            var lens, i,dis,tx,ty,judge;
            lens = this.rotationCircles.length;
            judge = 4 * RADIUS_SMALL * RADIUS_SMALL;
            for(i = 0; i < lens; i++){
                tx = circleBullet.x - this.rotationCircles[i].x;
                ty = circleBullet.y - this.rotationCircles[i].y;
                dis = tx*tx + ty * ty;
                if(dis <= judge){
                    return true;
                }
            }
            return false;
        },
        tapHandle:function (evt){
            evt.stopPropagation();
            evt.preventDefault();
            if(this.isCanTap){
                this.isCanTap = false;
                var lens = this.bulletCircles.length;
                for(var i = 0; i < lens - 1; i++){
                    this.bulletCircles[i].newY = this.bulletCircles[i].y - BULLET_SPACE;
                }
                this.bulletCircles[lens - 1].newY = ROTATION_CENTER.y + ROTATION_RADIUS;
            }
        },
        levelSuccessHandle:null,
        gameOverHandle:null
    }
    window["HardestGame"] = Game;
})();