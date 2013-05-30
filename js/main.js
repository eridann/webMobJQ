//Document ready = dom ready, window.load = avec images, etc...
$(function(){
    $('#canvas').on('pagebeforeshow',function(){
        var drawer = {
            preDraw : function(e){
                var pointers = e.getPointerList();
                $.each(pointers,function(i,pointer){

                    var id = pointer.identifier,
                        colors = ['red','purple','blue','brown'],
                        myColor = colors[Math.floor(Math.random()*colors.length)] ;

                    lines[id] = {
                        x : this.pageX - offset.left,
                        y : this.pageY - offset.top,
                        color : myColor
                    }
                    e.preventDefault();
                })
            },
            draw : function (e){
                var pointers = e.getPointerList();
                $.each(pointers, function(i,pointer){
                    var id = pointer.identifier,
                        moveX = this.pageX - offset.left - lines[id].x,
                        moveY = this.pageY - offset.top - lines[id].y ;

                    var pointMove = drawer.move(id,moveX,moveY);
                    lines[id].x = pointMove.x ;
                    lines[id].y = pointMove.y ;

                })
            },
            move : function(id, changeX, changeY){
                ctx.strokeStyle = lines[id].color;
                ctx.beginPath();
                ctx.moveTo(lines[id].x,lines[id].y);
                ctx.lineTo(lines[id].x + changeX, lines[id].y + changeY);
                ctx.stroke();
                ctx.closePath();

                return {x : lines[id].x + changeX, y : lines[id].y + changeY} ;
            }
        }

        var canvas = document.querySelector('#drawZone') ;
        var ctx = canvas.getContext('2d') ;
//        ctx.fillRect(10, 10, 200, 200) ;

        ctx.lineWidth = 35 ;
        ctx.lineCap = "round" ;
        var lines = [];
        var offset = $(canvas).offset();
        canvas.addEventListener('pointerdown', drawer.preDraw,false) ;
        canvas.addEventListener('pointermove', drawer.draw,false) ;
        $("#btnDel").on('tap', function(){
            ctx.clearRect(0,0,canvas.width, canvas.height);
        })
        $("#btnSave").on('tap', function(){
            localStorage.setItem('myPic',canvas.toDataURL());
        })
        $("#btnLoad").on('tap', function(){
            if(localStorage.getItem('myPic')){
                var myImg = new Image;
                myImg.src = localStorage.getItem('myPic');
                ctx.drawImage(myImg,0,0);
            } else {

            }
        })
        $('orientation').on('pagebeforeshow', function(){
            if(window.DeviceOrientationEvent){
                window.addEventListener('deviceorientation',function(e){
                    console.log(e);
                    var  gamma = e.gamma;
                    beta = e.beta;
                    $('.imgContainer').css('webkitTransform','rotate('+gamma+'deg) rotate3d(1,0,0,'+beta+'deg)');

                })
            }
        })
    })
})