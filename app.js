window.onload = function() {
  var messageField = document.getElementById('message');
  var socketStatus = document.getElementById('status');
  var closeBtn = document.getElementById('close');
  var botonCon = document.getElementById('send');
  var base=new CBlockC('canvas');
  function InitSocet(socket_) {socket_ = new WebSocket('wss://api-sb.mstrade.org/realtime/');};
  var socket= new WebSocket('wss://api-sb.mstrade.org/realtime/');
  var subscribe={
    "op": "subscribe",
    "account": "demo.demo",
    "channels": "trade:btcusd",
    "schema": "margin1"
  };

  socket.onerror = function(error)          {console.log('WebSocket Error: ' + error);};
  closeBtn.onclick = function(e)            {socket.close(); return false;};

  socket.onopen = function(event) {
    socketStatus.innerHTML = 'Connected to: ' + event.currentTarget.URL;
    socketStatus.className = 'open';
    socket.send(JSON.stringify(subscribe));
  };

  socket.onmessage = function(newmessage) {
    let mess= JSON.parse(newmessage.data);
    if (mess.data!=undefined) base.Add(mess.data);
  };

  socket.onclose = function() {
    socketStatus.innerHTML = 'Disconnected from WebSocket.';
    socketStatus.className = 'closed';
  };

  botonCon.onclick = function(){
    if (subscribe.channels!="trade:"+messageField.value)  {socet.close();}
    if (socet.readyState()>=CLOSING)                      {socet.onopen();}
    socket.send(JSON.stringify(subscribe));
    return false;
  };

};//////////////////////////////////////////////////\\\\\\\\\\\\\\\\\\\\

class  CBlockC {  //в паланах сделаь это базовым классом по обработке данных под канвас - но пока что так
  data=[];                                      //дата обрабатываемая
  height=40; width=1100; minheight=100;         //временно
  gheight=540;
  price={'max':-Infinity ,'min':Infinity};
  elmax=200;
  canvas; element;                              //для обработки - ссылка на канвас с которым работаем и его окружение(статична)

  MaouseEvent(e)          {};// вызываеться при наведении мышиж
  constructor(canvas_)    {this.InitId(canvas_); this.Init()};
  SizeConrol()            {if (this.data.length>1000) this.data.splice(this.data.length/2);}
  InitId(element_)        {this.element=document.getElementById(element_); this.canvas=this.element.getContext('2d'); this.element.onmouseover= function(e) {};};
  Refresh()               {let b=this.HaveHeight()+this.gheight; this.element.height=b>0?b:this.minheight;  this.Rew();};
  Add(str)                {for (var i=0; i<str.length; i++) {this.data[++this.data.length-1]=str[i];} this.SizeConrol(); this.Refresh();}; //аналог push Тоотко тут нормально элдементы раставляються
  Init()                  {this.Refresh(); this.element.width=this.width; }


  InFinMax(a,b)           {if (a>b.max) b.max=a; if (a<b.min) b.min=a;}

  clrblock=['#fffcda','#ffffff'];
  clrblockother=['#ffa5a5','#b5ffb9','#000000'];
  RewBlok(element, x, y, other){
    y=y-this.height;
    this.canvas.font ='20px Arial';
    let w=0, ytext=y+(this.height)*(1)-12;
    var canvas=this.canvas;
    canvas.fillStyle=this.clrblock[other.clrbl];
    canvas.fillRect(x, y, this.width,this.height);

    w=400;                                          //time
    canvas.strokeText(String(element.time), x+20, ytext);

    x+=w;
    w=200;                                          //price
    canvas.fillRect(x, y, w,this.height);
    canvas.strokeText(String(element.price), x+20, ytext);

    x+=w;
    w=200;                                          //type
    canvas.fillStyle=this.clrblockother[other.typ];
    canvas.fillRect(x, y, w,this.height);
    canvas.strokeText(other.typ==1?"BUY":other.typ==0?"SELL":"Err", x+80, ytext);

    x+=w;                                         //volume
    canvas.strokeText(element.volume, x+20, ytext);
  };
  RewGrafC(element, x, y, volum){
    y+=30;
    x+=30;
    let height=this.gheight-120;
    let wight=this.width-60;
    let price=this.price;//max min
    let data=this.data;
    let poz=data.length>200?data.length-200:1;
    let timestart=data[poz].timestamp;
    let timeend  =data[data.length-1].timestamp;
    y+=Number((element.price-price.min)/(price.max-price.min)*height);
    x+=Number((element.timestamp-timestart)/(timeend-timestart)*wight);
    let v=Number(getBaseLog(10,volum+100));
    this.canvas.fillStyle=this.clrblockother[1];
  //  this.canvas.arc(x,y,v*4,0,2*Math.PI,true);
    drawCircle(this.canvas,x,y,v*4,'#37b049');
   // this.canvas.JSON.circle(x,y,v*4);
  };
  Rew(){
    var can=this.canvas;  can.shadowColor = "gray";  can.shadowOffsetX = 1;  can.shadowOffsetY = 1;  can.shadowBlur = 5;
    var d=this.data;
    let y=0,x=0,lasttype=0;
    can.clearRect(x,y,this.width,this.gheight);//для графика надо зачищать область
    let volume=0;
    this.price.max=-Infinity; this.price.min=Infinity;  for (let i=d.length-200>1?d.length-200:1; i<d.length; i++){ this.InFinMax(d[i].price,this.price);}
    for (let i=d.length-200>1?d.length-200:1; i<d.length; i++){
      if (d[i].price==d[i-1].price) {volume+=d[i].volume;} else {this.RewGrafC(d[i],x,y,volume); volume=0;}
    }
    //if (volume>0) this.RewGrafC(d[length-1],x,y,volume);//обнова последнего круга

    y=this.gheight;
    let other={'typ':0,'clrbl':0};
    for (let i=d.length-1; i>1 && i>d.length-200; i--){
      x=0;
      for (let k=1; i-k>0; k++) {if (d[i].price!=d[i-k].price) {lasttype=Number(d[i].price>d[i-k].price); break;}}
      other.typ=Number(lasttype); other.clrbl=i&1;

      this.RewBlok(d[i],x,y,other);
      y+=this.height;
      }
    };

  HaveHeight() {let a=this.height*this.data.length; return a>=this.height*this.elmax?this.height*this.elmax:a;};
  HaveWidth() {return width;};
};

class CBlockCNext extends CBlockC {
  Refresh() {this.element.height=this.HaveHeight();};
  //constructor(element_){InitId(element_);};
  HaveHeight() {return this.minheight*this.minheight;};
  HaveWidth() {return width;};
};


class CFSocet{
  socet;
  constructor(socet_) {this.socet=socet_;}

  Check() {};

};


function getBaseLog(x, y) {return Math.log(y) / Math.log(x);}
function drawCircle(canvas, xPos, yPos, radius, color)
{
  var startAngle = (Math.PI / 180) * 0;
  var endAngle = (Math.PI / 180) * 360;

  canvas.beginPath();
  canvas.arc(xPos, yPos, radius, startAngle, endAngle, false);
  canvas.fillStyle = color;
  canvas.fill();
}