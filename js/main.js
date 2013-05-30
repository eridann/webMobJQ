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

    })
    $('#orientation').on('pagebeforeshow', function(){
        if(window.DeviceOrientationEvent){
            console.log('tot');
            window.addEventListener('deviceorientation',function(e){
                console.log(e);
                var  gamma = e.gamma;
                beta = e.beta;
                $('.imgContainer').css('webkitTransform','rotate('+gamma+'deg) rotate3d(1,0,0,'+beta+'deg)');

            })
        }
    })

    function Meteo(date,tempMax,tempMin,desc,pix){
        that = this;
        that.date = date;
        that.tempMax = tempMax;
        that.tempMin = tempMin;
        that.desc = desc;
        that.pix = pix;

    }
    Meteo.prototype.print = function(){
        console.print('from print : ' +JSON.stringify(this))
    }
    $('#meteo').on('pagebeforeshow' ,function(){
        $('#dayMeteo').children().remove();
        if(Modernizr.indexeddb){
            window.indexedDb = window.indexedDB  || window.webkitIndexedDB || window.mozIndexedDB;
            var localDb = {
                open :function(v,callback){
                    var openDb  = window.indexedDb.open('meteoDb',v);
                    openDb.onsuccess = function(e){
                        var db = e.target.result;
                        localDb.db  = db;
                        console.log("Success open");
                        callback(db) ;
                    }
                    openDb.onupgradeneeded  = function(e){
                        var db = e.target.result;
                        localDb.db = db;
                        if(db.objectStoreNames.contains('itemMeteo')){
                            db.deleteObjectStore('itemMeteo');
                        }
                        var store = db.createObjectStore('itemMeteo',{keyPath : 'date'});

                    }
                    openDb.onerror = function(err){

                        console.log(err) ;
                    }
                },
                create : function(item,callback){

                    var transaction = localDb.db.transaction(['itemMeteo'],'readwrite');
                    console.log('success transaction');
                    var store = transaction.objectStore('itemMeteo');
                    console.log(store + 'success objectStore');
                    var request = store.add(item) ;
                    console.log('success store.add');
                    request.onsuccess = function(){
                        console.log('success');
                    }
                    request.error = function(){
                        console.log('error');
                        callback();
                    }
                },
                clean :  function(callback){

                },
                getById: function(id,callback){

                },
                getAll : function(callback){
                    var transaction = localDb.db.transaction(['itemMeteo'],'readwrite');
                    var store = transaction.objectStore('itemMeteo');
                    var cursorRequest = store.openCursor();
                    var results = [];
                    cursorRequest.onsuccess = function(e){

                        var result = e.target.result;

                        if(result){
                            console.log(e.target.value);
                            results.push(result.value);
                            result.continue();
                        } else {
                            callback(results);
                        }
                    }

                }
            }
        } else {
            //fallback ios

        }

        function displayMeteo(meteosArray){
            $.each(meteosArray, function(i,item){
                if(i==0){

                    $('#dayMeteo').append('<div><time datetime='+item.date+'>'+item.date+'</time></div><img src ='+ item.pix +' alt="meteo du jour" />' +
                        '<div><span>temp min : '+item.tempMin+'</span><span> Temp max : '+item.tempMax +'</span></div>');
                } else{
                    var lettre;
                    switch (i){
                        case  1:
                            lettre = "a";
                            break;
                        case  2:
                            lettre = "b";
                            break;
                        case  3:
                            lettre = "c";
                            break;

                    }
                    $('#weekMeteo').append('<section id="item-'+lettre+'" class="ui-block-' +lettre+'" ><div><time datetime='+item.date+'>'+item.date+'</time></div><img src ='+ item.pix +' alt="meteo du jour" />' +
                        '<div><span>temp min : '+item.tempMin+'</span><span> Temp max : '+item.tempMax +'</span></div></section>');
                    $('#item-'+lettre).addClass('animated bounceIn') ;
                }

            })
        }
        function onLineHandler(){
            if(navigator.geolocation){
                navigator.geolocation.getCurrentPosition(function(position){
                    var myPos = {
                        lat :  position.coords.latitude,
                        lng  : position.coords.longitude
                    }
                    var uri ="http://free.worldweatheronline.com/feed/weather.ashx?q="+myPos.lat+","+myPos.lng+"&format=json&num_of_days=4&key=d3978c7305211944131401";
                    $.get(uri,function(response){
                        if(response.data.error){
                            console.log(response.data.error);
                        }  else{
                            console.log(response);
                            var myMeteo =[]
                            $.each(response.data.weather, function(i,item){
                                var meteo = new Meteo(item.date,item.tempMaxC,item.tempMinC,item.weatherDesc[0].value,item.weatherIconUrl[0].value);
                                meteo.print;
                                myMeteo.push(meteo);
                                if(localDb){
                                    localDb.open(10,function(db){
                                        localDb.create(meteo,function(){
                                            console.log('ttt');

                                        })
                                    });

                                }
                            })
                            displayMeteo(myMeteo);

                        }

                    },'jsonp')

                })
            }
        }
        if(navigator.onLine){
            onLineHandler();

        } else {
            if(localDb){
                localDb.open(10,function(db){
                    localDb.getAll(function(data){
                        console.log("stored Data :" +data);
                         displayMeteo(data);
                    })
                });

            }
        }

        window.addEventListener('online',function(){
            onLineHandler();
            window.applicationCache.addEventListener('updateready',function(){
                if(window.applicationCache.status == window.applicationCache.UPDATEREADY){
                    window.applicationCache.swapCache();
                    if(confirm("nouvelle version mettre à jour ?")){
                        window.location.reload();
                    }
                }
            })
        })
    })
})