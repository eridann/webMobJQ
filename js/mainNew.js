/**
 * Created with JetBrains WebStorm.
 * User: ib
 * Date: 29/05/13
 * Time: 14:12
 * To change this template use File | Settings | File Templates.
 */
$(function(){
    $('#canvas').on('pagebeforeshow',function(){

        var drawer = {
            preDraw :function(e){
                var pointer = e.getPointerList();
                $.each(pointers,function(i,pointer){
                    var id = pointer.identifier,
                        colors = ['red','purple','blue','brown'],
                        myColor = colors[Math.floor(Math.random()*colors.length)];

                    lines[id] = {
                        x: this.pageX - offset.left,
                        y: this.pageY - offset.top,
                        color : myColor
                    }
                })
                e.preventDefault();
            },
            draw:function(e){
                var pointers = e.getPointerList();
                $.each(pointers,function(i,pointer){
                    var id = pointer.identifier,
                        moveX = this.pageX -offset.left - lines[id].x,
                        moveY = this.pageY - offset.top - lines[id].y;

                    var pointMove = drawer.move(id, moveX, moveY);
                    lines[id].x = pointMove.x;
                    lines[id].y = pointMove.y;
                })
            },
            move : function(id,changeX, changeY){
                ctx.storkeStyle = lines[id].color;
                ctx.beginPath();
                ctx.moveTo(lines[id],x,lines[id].y);

                ctx.lineTo(lines[id].x + changeX, lines[id].y+changeY);
                ctx.storke();
                ctx.closePath();

                return {x : lines[id].x + changeX, y :lines[id].y + changeY};
            }
        }
        var canvas = document.querySelector('#drawZone');
        var ctx = canvas.getContext("2d");
        //ctx.fillRect(10,10,200,200);
        ctx.lineWidth = 35; //Largeur du trait
        ctx.lineCap = "round";
        var offset = $(canvas).offset();
        var lines = [];
        canvas.addEventListener('pointerdown',drawer.preDraw,false);
        canvas.addEventListener('pointermove',drawer.draw,false);
    })
})