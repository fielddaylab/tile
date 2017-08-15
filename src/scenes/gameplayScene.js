
var TEXT = true;
var PERFECT = true;
var UNLOCKED = true;

//wiggle anger
var G = [];
G = [0.25, 0.15, 0.2, 0.08, 0.03, 0.01, 0.005, 0.002, 0.0];

var GamePlayScene = function(game, stage)
{
  var self = this;

  var canv = stage.drawCanv;
  var canvas = canv.canvas;
  var ctx = canv.context;

  var clicker;
  var dragger;

  //enums
  var ENUM = 0;

  var MODE_MENU   = ENUM; ENUM++;
  var MODE_GAME   = ENUM; ENUM++;
  var MODE_SUBMIT = ENUM; ENUM++;
  var MODE_INTRO  = ENUM; ENUM++;

  //params
  var shadow_dist = 8;
  var white = "#FFFFFF";
  var black = "#000000";
  var bounds_stroke  = white;
  var shadow_fill  = "rgba(0,0,0,.1)";
  var defect_fill  = "rgba(0,0,0,.7)";
  var block_fill   = "#F6F6F6";
  var block_stroke = "#E0E0E0";
  var seed_fill   = "#D6D6D6";
  var seed_stroke = "#C0C0C0";
  var scroll_fill = "rgba(0,0,0,0.3)";
  var bg_fill     = "rgba(24,162,182,0.4)";
  var grid_fill = "#1B5C72";
  var grid_stroke = "#327B8E";
  var charge_pos = "#22FF22";
  var charge_neg = "#FF2222";

  var cache_res = 400;
  var cache_cam_wres = 5;

  var star_outro_sub_slide = 40;
  var star_outro_sub_star = 100;
  var star_outro_sub_zoom = 200;

  //start at top, CW
  var no_charge  = [ 0, 0, 0, 0];
  var top_pos    = [ 1, 0, 0, 0];
  var bottom_pos = [ 0, 0, 1, 0];
  var left_pos   = [ 0, 0, 0, 1];
  var right_pos  = [ 0, 1, 0, 0];
  var top_neg    = [-1, 0, 0, 0];
  var bottom_neg = [ 0, 0,-1, 0];
  var left_neg   = [ 0, 0, 0,-1];
  var right_neg  = [ 0,-1, 0, 0];

  //simple state
  var n_ticks;
  var total_stars;
  var score;
  var submitting_t;

  //static state
  var levels;

  //obj state
  var score_board;
  var stamps;
  var molecules;
  var game_cam;
  var menu_cam;
  var cam;
  var bounds;

  //indexes
  var cur_level;
  var dragging_molecule;
  var mode;

  //viz obj
  var total_stars_disp;
  var outro;
  var scroll;
  var back_btn;
  var clear_btn;
  var submit_btn;

  //viz state
  var cur_stars_bounce;
  var score_bounce;

  //tmp state
  var tx;
  var ty;
  var dblock = {wx:0,wy:0,ww:1,wh:1,x:0,y:0,w:0,h:0};
  var cblock = {wx:0,wy:0,ww:cache_cam_wres,wh:cache_cam_wres,x:0,y:0,w:0,h:0};
  var w;
  var h;
  var in_r;
  var out_r;
  var theta;

  w = 100;
  h = 100;

  var lock_img = GenIcon(w,h)
  lock_img.context.strokeStyle = "#999999";
  lock_img.context.fillStyle = "#999900";
  lock_img.context.lineWidth = 6;
  lock_img.context.beginPath();
  lock_img.context.arc(w/2,h/2,w/3,0,2*Math.PI);
  lock_img.context.stroke();
  lock_img.context.fillRect(10,h/2,w-20,h/2-10);

  in_r = w/4;
  out_r = w/2-5;

  var star = GenIcon(w,h)
  theta = 0-halfpi;
  star.context.strokeStyle = "#000000";
  star.context.fillStyle = "#FFFFFF";
  star.context.lineWidth = 2;
  star.context.beginPath();
  star.context.moveTo(w/2+cos(theta)*out_r,h/2+sin(theta)*out_r);
  for(var i = 0; i < 5; i++)
  {
    theta = (i/5+1/10)*twopi-halfpi;
    star.context.lineTo(w/2+cos(theta)*in_r,h/2+sin(theta)*in_r);
    if(i != 4)
    {
      theta = (i/5+1/5)*twopi-halfpi;
      star.context.lineTo(w/2+cos(theta)*out_r,h/2+sin(theta)*out_r);
    }
  }
  star.context.closePath();
  star.context.fill();
  star.context.stroke();
  star = new Image();
  star.src = "assets/star.png";

  var star_full = GenIcon(w,h)
  theta = 0-halfpi;
  star_full.context.strokeStyle = "#000000";
  star_full.context.fillStyle = "#FFFF00";
  star_full.context.lineWidth = 2;
  star_full.context.beginPath();
  star_full.context.moveTo(w/2+cos(theta)*out_r,h/2+sin(theta)*out_r);
  for(var i = 0; i < 5; i++)
  {
    theta = (i/5+1/10)*twopi-halfpi;
    star_full.context.lineTo(w/2+cos(theta)*in_r,h/2+sin(theta)*in_r);
    if(i != 4)
    {
      theta = (i/5+1/5)*twopi-halfpi;
      star_full.context.lineTo(w/2+cos(theta)*out_r,h/2+sin(theta)*out_r);
    }
  }
  star_full.context.closePath();
  star_full.context.fill();
  star_full.context.stroke();
  star_full = new Image();
  star_full.src = "assets/star_full.png";

  var connection = new Image();
  connection.src = "assets/connection.png";

  var atoms = [];
  for(var i = 0; i < 5; i++)
  {
    var atom = GenIcon(w,h)
    switch(i)
    {
      case 0: atom.context.fillStyle = "#000000"; atom.context.strokeStyle = "#444444"; break;
      case 1: atom.context.fillStyle = "#444444"; atom.context.strokeStyle = "#888888"; break;
      case 2: atom.context.fillStyle = "#888888"; atom.context.strokeStyle = "#888888"; break;
      case 3: atom.context.fillStyle = "#BBBBBB"; atom.context.strokeStyle = "#BBBBBB"; break;
      case 4: atom.context.fillStyle = "#FFFFFF"; atom.context.strokeStyle = "#EEEEEE"; break;
      /*
      case 0: atom.context.fillStyle = "rgba(200,0,0,0.8)"; break;
      case 1: atom.context.fillStyle = "rgba(100,0,0,0.5)"; break;
      case 2: atom.context.fillStyle = "rgba(0,0,0,0.3)"; break;
      case 3: atom.context.fillStyle = "rgba(0,100,0,0.5)"; break;
      case 4: atom.context.fillStyle = "rgba(0,200,0,0.8)"; break;
      */
    }
    atom.context.lineWidth = 4;
    atom.context.beginPath();
    atom.context.arc(w/2,h/2,2*w/7,0,2*Math.PI);
    atom.context.closePath();
    atom.context.fill();
    atom.context.stroke();
    //atom.context.fillText(i,w/2,h/2);
    atoms.push(atom);
  }

  var loadLevelStars = function()
  {
    for(var i = 0; i < levels.length; i++)
    {
      var c = parseInt(getCookie("lvl"+i));
      if(!isNaN(c)) levels[i].stars = c;
    }
    countLevelStars();
  }
  var countLevelStars = function()
  {
    total_stars = 0;
    for(var i = 0; i < levels.length; i++)
    {
      setCookie("lvl"+i,""+levels[i].stars,99);
      var c = parseInt(getCookie("lvl"+i));
      total_stars += levels[i].stars;
    }
    if(UNLOCKED) total_stars += 1000;
  }

  var totalStarsDisplay = function()
  {
    var self = this;
    self.wx = 0;
    self.wy = 0;
    self.ww = 0;
    self.wh = 0;
    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.draw = function()
    {
      ctx.drawImage(star_full,self.x,self.y,40,40);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("X"+total_stars,self.x+45,self.y+30);
    }
  }

  var level = function(id)
  {
    var self = this;
    self.id = id;
    self.available_templates = [];
    self.seed = [];
    self.defect = [];
    self.scale = 1;
    self.repeat_x = 10;
    self.repeat_y = 10;
    self.bounds_x = 16;
    self.bounds_y = 0;
    self.bounds_w = 10;
    self.bounds_h = 10;
    self.scroll_w = 2;
    self.stars = 0;
    self.cur_stars = 0;
    self.cur_stars_t = 0; //t since new cur_stars rating
    self.lock_stars = 0;
    self.best = -99999;
    self.star_req_score = [];
    for(var i = 0; i < 3; i++)
      self.star_req_score.push(0);

    //intro
    self.has_intro = false;
    self.intro = true;
    self.shouldClick = function(evt){ return false; }
    self.click = function(evt){};
    self.introtick = function(){ return self.intro; }
    self.introdraw = function(){}
  }

  var level_button = function(wx,wy,ww,wh,level)
  {
    var self = this;
    self.level = level;
    self.bounces = [];
    for(var i = 0; i < 3; i++)
      self.bounces[i] = new bounce();
    self.wx = wx;
    self.wy = wy;
    self.ww = ww;
    self.wh = wh;

    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.rotoff = rand()*6;

    self.draw = function()
    {
      ctx.beginPath();
      ctx.arc(self.x+self.w/2,self.y+self.h/2,2*self.w/5,0,2*Math.PI);
      ctx.stroke();
      draw_blocks(self.wx,self.wy,self.level.available_templates[0].cx,self.level.available_templates[0].cy,0,0,self.rotoff+n_ticks/100,0.5,0,0,0,self.level.available_templates[0]);

      var x = self.x+self.w/2;
      var y = self.y+self.h/2;
      var s = self.w/3;
      var theta;
      var offx;
      var offy;
      var t = n_ticks%200;
      var p;
      for(var i = 0; i < 3; i++)
      {
        theta = quarterpi+(i/2)*halfpi;
        offx = cos(theta)*self.w/3;
        offy = sin(theta)*self.h/3;
        switch(i)
        {
          case 0: if(t == 90) self.bounces[i].vel = 2; break;
          case 1: if(t == 60) self.bounces[i].vel = 2; break;
          case 2: if(t == 30) self.bounces[i].vel = 2; break;
        }
        var bs = s;
        self.bounces[i].tick();
        bs += self.bounces[i].v;
        if(self.level.stars > 2-i)
          ctx.drawImage(star_full,x+offx-bs/2,y+offy-bs/2,bs,bs);
        else
          ctx.drawImage(star,x+offx-bs/2,y+offy-bs/2,bs,bs);
      }

      if(total_stars < self.level.lock_stars)
      {
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.beginPath();
        ctx.arc(self.x+self.w/2,self.y+self.h/2,2*self.w/4,0,2*Math.PI);
        ctx.fill();

        ctx.drawImage(lock_img,self.x+20,self.y+20,self.w-40,self.h-40);
        ctx.drawImage(star_full,self.x+10,self.y+self.h/2-10,40,40);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("X"+self.level.lock_stars,self.x+50,self.y+self.h/2+20);
      }
    }

    self.click = function(evt)
    {
      if(total_stars < self.level.lock_stars) return;
      set_level(self.level.id);
      mode = MODE_INTRO;
    }
  }

  var star_outro = function(wx,wy,ww,wh)
  {
    var self = this;

    self.wx = wx;
    self.wy = wy;
    self.ww = ww;
    self.wh = wh;

    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.start_ticks = 0;

    self.bounces = [];
    for(var i = 0; i < 3; i++)
      self.bounces[i] = new bounce();

    self.click = function(evt)
    {
      mode = MODE_MENU;
      countLevelStars();
    }

    self.draw = function()
    {
      ctx.beginPath();
      ctx.arc(self.x+self.w/2,self.y+self.h/2,2*self.w/5,0,2*Math.PI);
      ctx.stroke();
      //draw_blocks(self.wx,self.wy,cur_level.available_templates[0].cx,cur_level.available_templates[0].cy,0,0,n_ticks/100,1,0,0,0,cur_level.available_templates[0]);

      var x = self.x+self.w/2;
      var y = self.y+self.h/2;
      var s = self.w/3;
      var theta;
      var offx;
      var offy;
      var t = (n_ticks-self.start_ticks)%200;
      var p;
      for(var i = 0; i < 3; i++)
      {
        theta = quarterpi+(i/2)*halfpi;
        offx = cos(theta)*self.w/3;
        offy = sin(theta)*self.h/3;
        switch(i)
        {
          case 0: if(t == 90) self.bounces[i].vel = 2; break;
          case 1: if(t == 60) self.bounces[i].vel = 2; break;
          case 2: if(t == 30) self.bounces[i].vel = 2; break;
        }
        var bs = s;
        self.bounces[i].tick();
        bs += self.bounces[i].v;
        if(cur_level.cur_stars > 2-i && n_ticks-self.start_ticks > 30*(3-i))
          ctx.drawImage(star_full,x+offx-bs/2,y+offy-bs/2,bs,bs);
        else
          ctx.drawImage(star,x+offx-bs/2,y+offy-bs/2,bs,bs);
      }
    }
  }

  var init_levels = function()
  {
    levels = [];
    var n_rows = 3;
    var n_cols = 4;
    var i = 0;
    var j;

    function lvlx(i)
    {
      var x = i%n_cols;
      return menu_cam.wx-menu_cam.ww/2+(x+1.5)/(n_cols+2)*menu_cam.ww;
    }
    function lvly(i)
    {
      var y = floor(i/n_cols);
      return menu_cam.wy+menu_cam.wh/2-(y+.5)/(n_rows)*menu_cam.wh;
    }
    function lvlw(i)
    {
      return menu_cam.ww/(n_cols+2);
    }
    function lvlh(i)
    {
      return menu_cam.wh/(n_cols+2)*2;
    }

    //domino- no charge
    levels.push(new level(i));
    levels[i].scale = 1;
    levels[i].repeat_x = 6;
    levels[i].repeat_y = 4;
    levels[i].bounds_w = 6;
    levels[i].bounds_h = 4;
    levels[i].scroll_w = 2.5;
    if(PERFECT)
    levels[i].scroll_w = (levels[i].bounds_h+2)*2-(levels[i].bounds_w+2);
    levels[i].lock_stars = 0;
    levels[i].star_req_score[0] = 22;
    levels[i].star_req_score[1] = 30;
    levels[i].star_req_score[2] = 36;
    j = 0;
    levels[i].available_templates[j++] = new template(0,0.5,[{cx:0,cy:0,c:[0,0,0,0]},{cx:0,cy:1,c:[0,0,0,0]}]);
    levels[i].button = new level_button(lvlx(i),lvly(i),lvlw(i),lvlh(i),levels[i]);
    levels[i].has_intro = true && TEXT;
    levels[i].shouldClick = function(evt) { return true; }
    levels[i].click = function(evt) { cur_level.intro = false; }
    levels[i].introtick = function() { return cur_level.intro; }
    levels[i].introdraw = function() { ctx.fillStyle = white; ctx.fillText("<- This is a molecule",bounds.x-110,150); ctx.fillText("Stack 'em here \\/",bounds.x+50,100); }
    i++;

    //tetris s- no charge
    levels.push(new level(i));
    levels[i].scale = 1;
    levels[i].repeat_x = 6;
    levels[i].repeat_y = 4;
    levels[i].bounds_w = 6;
    levels[i].bounds_h = 4;
    levels[i].scroll_w = 3.5;
    if(PERFECT)
    levels[i].scroll_w = (levels[i].bounds_h+2)*2-(levels[i].bounds_w+2);
    levels[i].lock_stars = levels[i-1].lock_stars+3;
    levels[i].star_req_score[0] = 13;
    levels[i].star_req_score[1] = 20;
    levels[i].star_req_score[2] = 30;
    j = 0;
    levels[i].available_templates[j++] = new template(0,0.5,[{cx:0,cy:0,c:[0,0,0,0]},{cx:0,cy:1,c:[0,0,0,0]},{cx:-1,cy:0,c:[0,0,0,0]},{cx:1,cy:1,c:[0,0,0,0]}]);
    levels[i].button = new level_button(lvlx(i),lvly(i),lvlw(i),lvlh(i),levels[i]);
    levels[i].has_intro = true && TEXT;
    levels[i].shouldClick = function(evt) { return true; }
    levels[i].click = function(evt) { cur_level.intro = false; }
    levels[i].introtick = function() { return cur_level.intro; }
    levels[i].introdraw = function() { ctx.fillStyle = white; ctx.fillText("Some patterns can",bounds.x+50,100); ctx.fillText("fill the space completely.",bounds.x+50,130); ctx.fillText("Others don't.",bounds.x+50,200); }
    i++;

    //tetris T- no charge
    levels.push(new level(i));
    levels[i].scale = 1;
    levels[i].repeat_x = 6;
    levels[i].repeat_y = 4;
    levels[i].bounds_w = 6;
    levels[i].bounds_h = 4;
    levels[i].scroll_w = 3.5;
    if(PERFECT)
    levels[i].scroll_w = (levels[i].bounds_h+2)*2-(levels[i].bounds_w+2);
    levels[i].lock_stars = levels[i-1].lock_stars+3;
    levels[i].star_req_score[0] = 8;
    levels[i].star_req_score[1] = 17;
    levels[i].star_req_score[2] = 30;
    j = 0;
    levels[i].available_templates[j++] = new template(0,0.5,[{cx:0,cy:0,c:[0,0,0,0]},{cx:0,cy:1,c:[0,0,0,0]},{cx:-1,cy:0,c:[0,0,0,0]},{cx:1,cy:0,c:[0,0,0,0]}]);
    levels[i].button = new level_button(lvlx(i),lvly(i),lvlw(i),lvlh(i),levels[i]);
    levels[i].has_intro = true && TEXT;
    levels[i].shouldClick = function(evt) { return true; }
    levels[i].click = function(evt) { cur_level.intro = false; }
    levels[i].introtick = function() { return cur_level.intro; }
    levels[i].introdraw = function() { ctx.fillStyle = white; ctx.fillText("Double click",bounds.x+50,100); ctx.fillText("to rotate",bounds.x+50,130); }
    i++;

    //domino- flip charge
    levels.push(new level(i));
    levels[i].scale = 1;
    levels[i].repeat_x = 6;
    levels[i].repeat_y = 4;
    levels[i].bounds_w = 6;
    levels[i].bounds_h = 4;
    levels[i].scroll_w = 2.5;
    if(PERFECT)
    levels[i].scroll_w = (levels[i].bounds_h+2)*2-(levels[i].bounds_w+2);
    levels[i].lock_stars = levels[i-1].lock_stars+2;
    levels[i].star_req_score[0] = 36;
    levels[i].star_req_score[1] = 37;
    levels[i].star_req_score[2] = 84;
    j = 0;
    levels[i].available_templates[j++] = new template(0,0.5,[{cx:0,cy:0,c:right_pos},{cx:0,cy:1,c:left_neg}]);
    levels[i].button = new level_button(lvlx(i),lvly(i),lvlw(i),lvlh(i),levels[i]);
    levels[i].has_intro = true && TEXT;
    levels[i].shouldClick = function(evt) { return true; }
    levels[i].click = function(evt) { cur_level.intro = false; }
    levels[i].introtick = function() { return cur_level.intro; }
    levels[i].introdraw = function() { ctx.fillStyle = white; ctx.fillText("Some molecules have charges.",bounds.x+50,100); ctx.fillText("opposites attract.",bounds.x+50,130); }
    i++;

    //L- hard charge
    levels.push(new level(i));
    levels[i].scale = 1;
    levels[i].repeat_x = 8;
    levels[i].repeat_y = 4;
    levels[i].bounds_w = 8;
    levels[i].bounds_h = 4;
    levels[i].scroll_w = 3.5;
    if(PERFECT)
    levels[i].scroll_w = (levels[i].bounds_h+2)*2-(levels[i].bounds_w+2);
    levels[i].lock_stars = levels[i-1].lock_stars+2;
    levels[i].star_req_score[0] = 48;
    levels[i].star_req_score[1] = 61;
    levels[i].star_req_score[2] = 90;
    j = 0;
    levels[i].available_templates[j++] = new template(0.5,1,[{cx:0,cy:0,c:[0,0,0,1]},{cx: 0,cy: 1,c:[0,0,0,0]},{cx: 0,cy:2,c:[-1,0,0,-1]},{cx: 1,cy:0,c:[1,1,0,0]}]); //L
    levels[i].button = new level_button(lvlx(i),lvly(i),lvlw(i),lvlh(i),levels[i]);
    levels[i].has_intro = true && TEXT;
    levels[i].shouldClick = function(evt) { return true; }
    levels[i].click = function(evt) { cur_level.intro = false; }
    levels[i].introtick = function() { return cur_level.intro; }
    levels[i].introdraw = function() { ctx.fillStyle = white; ctx.fillText("Try different patterns",bounds.x+50,100); ctx.fillText("to get 3 stars.",bounds.x+50,130); }
    i++;

    //square- hard charge
    levels.push(new level(i));
    levels[i].scale = 1;
    levels[i].repeat_x = 10;
    levels[i].repeat_y = 6;
    levels[i].bounds_w = 10;
    levels[i].bounds_h = 6;
    levels[i].scroll_w = 2.5;
    if(PERFECT)
    levels[i].scroll_w = (levels[i].bounds_h+2)*2-(levels[i].bounds_w+2);
    levels[i].lock_stars = levels[i-1].lock_stars+1;
    levels[i].star_req_score[0] = 60;
    levels[i].star_req_score[1] = 70;
    levels[i].star_req_score[2] = 108;
    j = 0;
    levels[i].available_templates[j++] = new template(0.5,0.5,[{cx:0,cy:0,c:bottom_pos},{cx: 0,cy: 1,c:left_neg  },{cx: 1,cy:0,c:right_neg },{cx: 1,cy:1,c:top_pos   }]); //box
    levels[i].button = new level_button(lvlx(i),lvly(i),lvlw(i),lvlh(i),levels[i]);
    i++;

    //domino- flip charge defect
    levels.push(new level(i));
    levels[i].scale = 1;
    levels[i].repeat_x = 6;
    levels[i].repeat_y = 4;
    levels[i].bounds_w = 6;
    levels[i].bounds_h = 4;
    levels[i].scroll_w = 2.5;
    if(PERFECT)
    levels[i].scroll_w = (levels[i].bounds_h+2)*2-(levels[i].bounds_w+2);
    levels[i].lock_stars = levels[i-1].lock_stars+2;
    levels[i].star_req_score[0] = 37;
    levels[i].star_req_score[1] = 61;
    levels[i].star_req_score[2] = 70;
    j = 0;
    levels[i].available_templates[j++] = new template(0,0.5,[{cx:0,cy:0,c:right_pos},{cx:0,cy:1,c:left_neg}]);
    j = 0;
    levels[i].defect[j++] = new defect(16,0,new template(0.5,0.5,[{cx:0,cy:0,c:no_charge}]));
    levels[i].button = new level_button(lvlx(i),lvly(i),lvlw(i),lvlh(i),levels[i]);
    levels[i].has_intro = true && TEXT;
    levels[i].shouldClick = function(evt) { return true; }
    levels[i].click = function(evt) { cur_level.intro = false; }
    levels[i].introtick = function() { return cur_level.intro; }
    levels[i].introdraw = function() { ctx.fillStyle = white; ctx.fillText("There's a defect in this crystal...",bounds.x+30,100); }
    i++;

    //L- hard charge seed
    levels.push(new level(i));
    levels[i].scale = 1;
    levels[i].repeat_x = 21;
    levels[i].repeat_y = 14;
    levels[i].bounds_w = 21;
    levels[i].bounds_h = 14;
    levels[i].scroll_w = 9;
    //if(PERFECT)
    //levels[i].scroll_w = (levels[i].bounds_h+2)*2-(levels[i].bounds_w+2);
    levels[i].lock_stars = levels[i-1].lock_stars+2;
    levels[i].star_req_score[0] = 335;
    levels[i].star_req_score[1] = 335;
    levels[i].star_req_score[2] = 336;
    j = 0;
    levels[i].available_templates[j++] = new template(0.5,0.5,
      [
        {cx: 1,cy: 0,c:[0,0,0,0]},
        {cx: 2,cy: 0,c:[0,0,0,0]},
        {cx: 1,cy: 1,c:[0,0,0,0]},
        {cx: 0,cy: 0,c:[0,0,0,0]},
        {cx: 1,cy:-1,c:[0,0,0,0]},
        {cx:-1,cy: 0,c:[0,0,0,0]},
        {cx:-1,cy: 1,c:[0,0,0,0]},
      ]); //L

    j = 0;
    levels[i].seed[j] = new molecule();
    levels[i].seed[j].cx = 15;
    levels[i].seed[j].cy =  -3;
    levels[i].seed[j].wx = levels[i].seed[j].cx-0.5;
    levels[i].seed[j].wy = levels[i].seed[j].cy-0.5;
    levels[i].seed[j].template = new template(0.5,0.5,
      [
        {cx: 1,cy: 0,c:[0,0,0,0]},
        {cx: 2,cy: 0,c:[0,0,0,0]},
        {cx: 1,cy: 1,c:[0,0,0,0]},
        {cx: 0,cy: 0,c:[0,0,0,0]},
        {cx: 1,cy:-1,c:[0,0,0,0]},
        {cx:-1,cy: 0,c:[0,0,0,0]},
        {cx:-1,cy: 1,c:[0,0,0,0]},
      ]); //L
    j++;
    levels[i].seed[j] = new molecule();
    levels[i].seed[j].cx = levels[i].seed[j-1].cx+4;
    levels[i].seed[j].cy = levels[i].seed[j-1].cy+1;
    levels[i].seed[j].wx = levels[i].seed[j].cx-0.5;
    levels[i].seed[j].wy = levels[i].seed[j].cy-0.5;
    levels[i].seed[j].template = new template(0.5,0.5,
      [
        {cx: 1,cy: 0,c:[0,0,0,0]},
        {cx: 2,cy: 0,c:[0,0,0,0]},
        {cx: 1,cy: 1,c:[0,0,0,0]},
        {cx: 0,cy: 0,c:[0,0,0,0]},
        {cx: 1,cy:-1,c:[0,0,0,0]},
        {cx:-1,cy: 0,c:[0,0,0,0]},
        {cx:-1,cy: 1,c:[0,0,0,0]},
      ]); //L
    rotate_template(levels[i].seed[j].template);
    rotate_template(levels[i].seed[j].template);
    j++;

    levels[i].seed[j] = new molecule();
    levels[i].seed[j].cx = levels[i].seed[j-2].cx-1;
    levels[i].seed[j].cy = levels[i].seed[j-2].cy+2;
    levels[i].seed[j].wx = levels[i].seed[j].cx-0.5;
    levels[i].seed[j].wy = levels[i].seed[j].cy-0.5;
    levels[i].seed[j].template = new template(0.5,0.5,
      [
        {cx: 1,cy: 0,c:[0,0,0,0]},
        {cx: 2,cy: 0,c:[0,0,0,0]},
        {cx: 1,cy: 1,c:[0,0,0,0]},
        {cx: 0,cy: 0,c:[0,0,0,0]},
        {cx: 1,cy:-1,c:[0,0,0,0]},
        {cx:-1,cy: 0,c:[0,0,0,0]},
        {cx:-1,cy: 1,c:[0,0,0,0]},
      ]); //L
    j++;
    levels[i].seed[j] = new molecule();
    levels[i].seed[j].cx = levels[i].seed[j-2].cx-1;
    levels[i].seed[j].cy = levels[i].seed[j-2].cy+2;
    levels[i].seed[j].wx = levels[i].seed[j].cx-0.5;
    levels[i].seed[j].wy = levels[i].seed[j].cy-0.5;
    levels[i].seed[j].template = new template(0.5,0.5,
      [
        {cx: 1,cy: 0,c:[0,0,0,0]},
        {cx: 2,cy: 0,c:[0,0,0,0]},
        {cx: 1,cy: 1,c:[0,0,0,0]},
        {cx: 0,cy: 0,c:[0,0,0,0]},
        {cx: 1,cy:-1,c:[0,0,0,0]},
        {cx:-1,cy: 0,c:[0,0,0,0]},
        {cx:-1,cy: 1,c:[0,0,0,0]},
      ]); //L
    rotate_template(levels[i].seed[j].template);
    rotate_template(levels[i].seed[j].template);
    j++;

    levels[i].seed[j] = new molecule();
    levels[i].seed[j].cx = levels[i].seed[j-2].cx-1;
    levels[i].seed[j].cy = levels[i].seed[j-2].cy+2;
    levels[i].seed[j].wx = levels[i].seed[j].cx-0.5;
    levels[i].seed[j].wy = levels[i].seed[j].cy-0.5;
    levels[i].seed[j].template = new template(0.5,0.5,
      [
        {cx: 1,cy: 0,c:[0,0,0,0]},
        {cx: 2,cy: 0,c:[0,0,0,0]},
        {cx: 1,cy: 1,c:[0,0,0,0]},
        {cx: 0,cy: 0,c:[0,0,0,0]},
        {cx: 1,cy:-1,c:[0,0,0,0]},
        {cx:-1,cy: 0,c:[0,0,0,0]},
        {cx:-1,cy: 1,c:[0,0,0,0]},
      ]); //L
    j++;
    levels[i].seed[j] = new molecule();
    levels[i].seed[j].cx = levels[i].seed[j-2].cx-1;
    levels[i].seed[j].cy = levels[i].seed[j-2].cy+2;
    levels[i].seed[j].wx = levels[i].seed[j].cx-0.5;
    levels[i].seed[j].wy = levels[i].seed[j].cy-0.5;
    levels[i].seed[j].template = new template(0.5,0.5,
      [
        {cx: 1,cy: 0,c:[0,0,0,0]},
        {cx: 2,cy: 0,c:[0,0,0,0]},
        {cx: 1,cy: 1,c:[0,0,0,0]},
        {cx: 0,cy: 0,c:[0,0,0,0]},
        {cx: 1,cy:-1,c:[0,0,0,0]},
        {cx:-1,cy: 0,c:[0,0,0,0]},
        {cx:-1,cy: 1,c:[0,0,0,0]},
      ]); //L
    rotate_template(levels[i].seed[j].template);
    rotate_template(levels[i].seed[j].template);
    j++;


    levels[i].button = new level_button(lvlx(i),lvly(i),lvlw(i),lvlh(i),levels[i]);
    levels[i].has_intro = true && TEXT;
    levels[i].shouldClick = function(evt) { return true; }
    levels[i].click = function(evt) { cur_level.intro = false; }
    levels[i].introtick = function() { return cur_level.intro; }
    levels[i].introdraw = function() { ctx.fillStyle = white; ctx.fillText("Here is a seed pattern",bounds.x+30,60); ctx.fillText("Use it as a template.",bounds.x+30,90); }
    i++;

    //free play
    levels.push(new level(i));
    levels[i].scale = 2;
    levels[i].repeat_x = 18;
    levels[i].repeat_y = 10;
    levels[i].bounds_w = 18;
    levels[i].bounds_h = 10;
    levels[i].scroll_w = 3;
    if(PERFECT)
    levels[i].scroll_w = (levels[i].bounds_h+2)*2-(levels[i].bounds_w+2);
    levels[i].lock_stars = levels[i-1].lock_stars+1;
    levels[i].star_req_score[0] = 0;
    levels[i].star_req_score[1] = 0;
    levels[i].star_req_score[2] = 0;
    j = 0;
      //1-no
    levels[i].available_templates[j++] = new template(0,0,[{cx:0,cy:0,c:top_pos   }]);
      //2-no
    levels[i].available_templates[j++] = new template(0,0.5,[{cx:0,cy:0,c:left_neg  },{cx:0,cy:1,c:no_charge }]);
      //3-no
    levels[i].available_templates[j++] = new template(0,0,[{cx:0,cy:0,c:no_charge },{cx:0,cy:1,c:left_neg  },{cx:0,cy:-1,c:right_pos }]); //line
    levels[i].available_templates[j++] = new template(0.5,0.5,[{cx:0,cy:0,c:no_charge },{cx:0,cy:1,c:right_pos },{cx:1,cy: 0,c:top_neg   }]); //crook
      //4-no
    levels[i].available_templates[j++] = new template(0,0.5,[{cx:0,cy:0,c:left_pos  },{cx: 0,cy:-1,c:left_pos  },{cx: 0,cy:1,c:right_neg },{cx: 0,cy:2,c:no_charge }]); //line
    levels[i].available_templates[j++] = new template(0.5,1,[{cx:0,cy:0,c:no_charge },{cx: 0,cy: 1,c:no_charge },{cx: 0,cy:2,c:right_neg },{cx: 1,cy:0,c:top_neg   }]); //L
    levels[i].available_templates[j++] = new template(-0.5,1,[{cx:0,cy:0,c:bottom_neg},{cx: 0,cy: 1,c:no_charge },{cx: 0,cy:2,c:no_charge },{cx:-1,cy:0,c:bottom_pos}]); //J
    levels[i].available_templates[j++] = new template(0,0.5,[{cx:0,cy:0,c:bottom_pos},{cx:-1,cy: 1,c:left_pos  },{cx: 0,cy:1,c:no_charge },{cx: 1,cy:0,c:no_charge }]); //Z
    levels[i].available_templates[j++] = new template(0,0.5,[{cx:0,cy:0,c:no_charge },{cx:-1,cy: 0,c:bottom_neg},{cx: 0,cy:1,c:no_charge },{cx: 1,cy:1,c:bottom_pos}]); //S
    levels[i].available_templates[j++] = new template(0,0.5,[{cx:0,cy:0,c:no_charge },{cx: 0,cy: 1,c:no_charge },{cx:-1,cy:0,c:top_pos   },{cx: 1,cy:0,c:right_neg }]); //T
    levels[i].available_templates[j++] = new template(0.5,0.5,[{cx:0,cy:0,c:bottom_pos},{cx: 0,cy: 1,c:left_neg  },{cx: 1,cy:0,c:right_neg },{cx: 1,cy:1,c:top_pos   }]); //box
    levels[i].button = new level_button(lvlx(i),lvly(i),lvlw(i),lvlh(i),levels[i]);
    i++;

  }

  var set_level = function(i)
  {
    cur_level = levels[i];

    cur_level.intro = cur_level.has_intro;

    stamps = [];
    molecules = [];

    for(var i = 0; i < cur_level.seed.length; i++)
    {
      var s = new molecule();
      s.locked = true;
      s.cx = cur_level.seed[i].cx;
      s.cy = cur_level.seed[i].cy;
      s.wx = cur_level.seed[i].wx;
      s.wy = cur_level.seed[i].wy;
      s.setTemplate(cur_level.seed[i].template);
      s.up = false;
      s.up_ticks = 0;
      bring_to_bottom(s);
      molecules[molecules.length] = s;
    }

    dragging_molecule = 0;

    bounds = {wx:cur_level.bounds_x, wy:cur_level.bounds_y, ww:cur_level.bounds_w, wh:cur_level.bounds_h, x:0,y:0,w:0,h:0 };
    game_cam = {wx:cur_level.bounds_x-cur_level.scroll_w/2, wy:cur_level.bounds_y, ww:cur_level.bounds_w+2+cur_level.scroll_w, wh:cur_level.bounds_h+2 };

    scroll = new scroller();
    scroll.scroll_wy_min -= 0.2;
    scroll.scroll_wy_max += 0.2;

    for(var i = 0; i < cur_level.available_templates.length; i++)
    {
      stamps[i] = new stamp();
      stamps[i].wx = scroll.wx;
      stamps[i].wy = game_cam.wy+game_cam.wh/2-2.-4*i;
      if(stamps[i].wy < scroll.scroll_wy_min) scroll.scroll_wy_min = stamps[i].wy;
      if(stamps[i].wy > scroll.scroll_wy_max) scroll.scroll_wy_max = stamps[i].wy;
      copy_template(cur_level.available_templates[i],stamps[i].template);
    }

    score_board.reset();
  }

  var copy_template = function(from,to)
  {
    to.cx = from.cx;
    to.cy = from.cy;
    to.blocks = [];
    for(var i = 0; i < from.blocks.length; i++)
    {
      to.blocks[i] = {cx:from.blocks[i].cx,cy:from.blocks[i].cy,c:[]};
      for(var j = 0; j < 4; j++)
        to.blocks[i].c[j] = from.blocks[i].c[j];
    }
    to.tcache = from.tcache;
    to.rotation = from.rotation;
  }
  var rotate_template = function(t)
  {
    for(var i = 0; i < t.blocks.length; i++)
    {
      var tmp = t.blocks[i].cy;
      t.blocks[i].cy = -t.blocks[i].cx;
      t.blocks[i].cx = tmp;
      var last = t.blocks[i].c[3];
      for(var j = 3; j > 0; j--)
        t.blocks[i].c[j] = t.blocks[i].c[j-1];
      t.blocks[i].c[0] = last;
    }
    var tx = t.cx;
    t.cx = t.cy;
    t.cy = -tx;
    t.rotation = (t.rotation+1)%4;
  }
  var draw_blocks = function(wx,wy,offx,offy,bounces,happys,rot,scale,shadow,defect,seed,template)
  {
    var blocks = template.blocks;

    if(!template.tcache[template.rotation].cached)
    {
      template.tcache[template.rotation].cached = true;

      var top_left;
      var cur;
      var leftmost = 100;
      var topmost = -100;

      var tcam = { wx:0, wy:0, ww:cache_cam_wres, wh:cache_cam_wres };
      var tcanv = template.tcache[template.rotation].cache;
      var tctx = tcanv.context;
      var scanv = template.tcache[template.rotation].shadow_cache;
      var sctx = scanv.context;

      tctx.clearRect(0, 0, cache_res, cache_res);
      sctx.clearRect(0, 0, cache_res, cache_res);

      screenSpace(tcam,tcanv,dblock);

      for(var i = 0; i < blocks.length; i++)
        if(blocks[i].cx < leftmost) leftmost = blocks[i].cx;
      for(var i = 0; i < blocks.length; i++)
        if(blocks[i].cx == leftmost && blocks[i].cy > topmost)
        {
          topmost = blocks[i].cy;
          top_left = i;
        }

      var xb = dblock.ww*3/8;
      var yb = dblock.wh*3/8;
      var start;
      var done;
      var found;

      tctx.fillStyle = block_fill;
      tctx.strokeStyle = block_stroke;
      if(seed)
      {
        tctx.fillStyle = seed_fill;
        tctx.strokeStyle = seed_stroke;
      }
      sctx.fillStyle = shadow_fill;
      if(defect) sctx.fillStyle = defect_fill;

      cur = top_left;

      tctx.beginPath();
      sctx.beginPath();

      dblock.wx = blocks[cur].cx-xb;
      dblock.wy = blocks[cur].cy+yb;
      screenSpace(tcam,tcanv,dblock);
      tctx.moveTo(dblock.x+dblock.w/2,dblock.y+dblock.h/2);
      sctx.moveTo(dblock.x+dblock.w/2,dblock.y+dblock.h/2);

      start = 0;
      done = 0;
      while(!done)
      {
        found = false;
        for(var i = 0; !found && !done && i < 4; i++) //start at top, CW
        {
          switch((i+start)%4)
          {
            case 0: //check top
            {
              for(var j = 0; !found && j < blocks.length; j++)
              {
                if(cur != j &&
                  blocks[j].cx == blocks[cur].cx   &&
                  blocks[j].cy == blocks[cur].cy+1)
                {
                  found = true;
                  cur = j;

                  dblock.wx = blocks[cur].cx-xb;
                  dblock.wy = blocks[cur].cy-yb;
                  screenSpace(tcam,tcanv,dblock);
                  tctx.lineTo(dblock.x+dblock.w/2,dblock.y+dblock.h/2);
                  sctx.lineTo(dblock.x+dblock.w/2,dblock.y+dblock.h/2);

                  start = 3;
                }
              }
              if(!found)
              {
                dblock.wx = blocks[cur].cx+xb;
                dblock.wy = blocks[cur].cy+yb;
                screenSpace(tcam,tcanv,dblock);
                tctx.lineTo(dblock.x+dblock.w/2,dblock.y+dblock.h/2);
                sctx.lineTo(dblock.x+dblock.w/2,dblock.y+dblock.h/2);
              }
            }
            break;
            case 1: //check right
            {
              for(var j = 0; !found && j < blocks.length; j++)
              {
                if(cur != j &&
                  blocks[j].cx == blocks[cur].cx+1 &&
                  blocks[j].cy == blocks[cur].cy)
                {
                  found = true;
                  cur = j;

                  dblock.wx = blocks[cur].cx-xb;
                  dblock.wy = blocks[cur].cy+yb;
                  screenSpace(tcam,tcanv,dblock);
                  tctx.lineTo(dblock.x+dblock.w/2,dblock.y+dblock.h/2);
                  sctx.lineTo(dblock.x+dblock.w/2,dblock.y+dblock.h/2);

                  start = 0;
                }
              }
              if(!found)
              {
                dblock.wx = blocks[cur].cx+xb;
                dblock.wy = blocks[cur].cy-yb;
                screenSpace(tcam,tcanv,dblock);
                tctx.lineTo(dblock.x+dblock.w/2,dblock.y+dblock.h/2);
                sctx.lineTo(dblock.x+dblock.w/2,dblock.y+dblock.h/2);
              }
            }
            break;
            case 2: //check bottom
            {
              for(var j = 0; !found && j < blocks.length; j++)
              {
                if(cur != j &&
                  blocks[j].cx == blocks[cur].cx   &&
                  blocks[j].cy == blocks[cur].cy-1)
                {
                  found = true;
                  cur = j;

                  dblock.wx = blocks[cur].cx+xb;
                  dblock.wy = blocks[cur].cy+yb;
                  screenSpace(tcam,tcanv,dblock);
                  tctx.lineTo(dblock.x+dblock.w/2,dblock.y+dblock.h/2);
                  sctx.lineTo(dblock.x+dblock.w/2,dblock.y+dblock.h/2);

                  start = 1;
                }
              }
              if(!found)
              {
                dblock.wx = blocks[cur].cx-xb;
                dblock.wy = blocks[cur].cy-yb;
                screenSpace(tcam,tcanv,dblock);
                tctx.lineTo(dblock.x+dblock.w/2,dblock.y+dblock.h/2);
                sctx.lineTo(dblock.x+dblock.w/2,dblock.y+dblock.h/2);
              }
            }
            break;
            case 3: //check left
            {
              for(var j = 0; !found && j < blocks.length; j++)
              {
                if(cur != j &&
                  blocks[j].cx == blocks[cur].cx-1 &&
                  blocks[j].cy == blocks[cur].cy)
                {
                  found = true;
                  cur = j;

                  dblock.wx = blocks[cur].cx+xb;
                  dblock.wy = blocks[cur].cy-yb;
                  screenSpace(tcam,tcanv,dblock);
                  tctx.lineTo(dblock.x+dblock.w/2,dblock.y+dblock.h/2);
                  sctx.lineTo(dblock.x+dblock.w/2,dblock.y+dblock.h/2);

                  start = 2;
                }
              }
              if(!found)
              {
                dblock.wx = blocks[cur].cx-xb;
                dblock.wy = blocks[cur].cy+yb;
                screenSpace(tcam,tcanv,dblock);
                tctx.lineTo(dblock.x+dblock.w/2,dblock.y+dblock.h/2);
                sctx.lineTo(dblock.x+dblock.w/2,dblock.y+dblock.h/2);
              }
            }
            break;
          }

          if(!found && cur == top_left && (i+start)%4 == 3) done = 1;
        }
      }
      tctx.fill();
      sctx.fill();
      tctx.stroke();

      //charges
      for(var i = 0; i < blocks.length; i++)
      {
        dblock.wx = blocks[i].cx;
        dblock.wy = blocks[i].cy;
        screenSpace(tcam,tcanv,dblock);

        var d = dblock.w/8;
        tctx.strokeStyle = block_stroke;
        tctx.lineWidth = 4;
        for(var j = 0; j < 4; j++)
        {
               if(blocks[i].c[j] > 0) tctx.strokeStyle = charge_pos;
          else if(blocks[i].c[j] < 0) tctx.strokeStyle = charge_neg;
          else continue;
          switch(j)
          {
            case 0: tctx.beginPath(); tctx.moveTo(dblock.x         +d,dblock.y         +d); tctx.lineTo(dblock.x+dblock.w-d,dblock.y         +d); tctx.stroke(); break;
            case 1: tctx.beginPath(); tctx.moveTo(dblock.x+dblock.w-d,dblock.y         +d); tctx.lineTo(dblock.x+dblock.w-d,dblock.y+dblock.h-d); tctx.stroke(); break;
            case 2: tctx.beginPath(); tctx.moveTo(dblock.x         +d,dblock.y+dblock.h-d); tctx.lineTo(dblock.x+dblock.w-d,dblock.y+dblock.h-d); tctx.stroke(); break;
            case 3: tctx.beginPath(); tctx.moveTo(dblock.x         +d,dblock.y         +d); tctx.lineTo(dblock.x         +d,dblock.y+dblock.h-d); tctx.stroke(); break;
          }
        }
        tctx.lineWidth = 2;
      }

    }

    tx = screenSpaceX(cam,canv,wx);
    ty = screenSpaceY(cam,canv,wy);
    screenSpace(cam,canv,dblock);

    ctx.save();
    ctx.translate(tx,ty);
    ctx.rotate(rot);
    ctx.translate(-offx*dblock.w*scale,offy*dblock.h*scale);
    ctx.scale(scale,scale);

    screenSpace(cam,canv,cblock);
    if(shadow || defect)
      ctx.drawImage(template.tcache[template.rotation].shadow_cache, -cblock.w/2, -cblock.h/2, cblock.w, cblock.h);
    else
      ctx.drawImage(template.tcache[template.rotation].cache, -cblock.w/2, -cblock.h/2, cblock.w, cblock.h);

    ctx.restore();

    if(!shadow && !defect)
    {
      var c = cos(-rot);
      var s = sin(-rot);
      var rx;
      var ry;
      var oldww;
      var oldwh;
      for(var i = 0; i < blocks.length; i++)
      {
        rx = blocks[i].cx-offx;
        ry = blocks[i].cy-offy;

        dblock.wx = rx*c - ry*s;
        dblock.wy = rx*s + ry*c;

        dblock.wx *= scale;
        dblock.wy *= scale;

        dblock.wx += wx;
        dblock.wy += wy;

        oldww = dblock.ww;
        oldwh = dblock.wh;
        dblock.ww *= scale;
        dblock.wh *= scale;
        screenSpace(cam,canv,dblock);
        dblock.ww = oldww;
        dblock.wh = oldwh;

        if(happys)
        {
          var happy = clamp(-2,2,happys[i]);
          if(bounces)
            ctx.drawImage(atoms[happy+2], dblock.x+bounces[i].vx, dblock.y+bounces[i].vy, dblock.w, dblock.h);
          else
            ctx.drawImage(atoms[happy+2], dblock.x, dblock.y, dblock.w, dblock.h);
        }
        else
        {
          if(bounces)
            ctx.drawImage(atoms[2], dblock.x+bounces[i].vx, dblock.y+bounces[i].vy, dblock.w, dblock.h);
          else
            ctx.drawImage(atoms[2], dblock.x, dblock.y, dblock.w, dblock.h);
        }
      }
    }

  }

  var board = function()
  {
    var self = this;
    self.cells = [];

    var boardi = function(x,y) { return ((1+y)*(cur_level.repeat_x+2))+(x+1); }

    self.reset = function()
    {
      self.cells = [];
      for(var i = -1; i < cur_level.repeat_y+1; i++)
        for(var j = -1; j < cur_level.repeat_x+1; j++)
        {
          self.cells[boardi(j,i)] =
          {
            cx:j+1+bounds.wx-bounds.ww/2,
            cy:i+1+bounds.wy-bounds.wh/2,
            c:[0,0,0,0],
            molecule_id: 0,
            block_id: 0,
            present:0,
            present_t:0,
            score_up:0,
            score_right:0,
          };
        }
    }

    self.clear = function()
    {
      var cell;
      for(var i = 0; i < molecules.length; i++)
      {
        molecules[i].total_happy = 0;
        for(var j = 0; j < molecules[i].happys.length; j++)
          molecules[i].happys[j] = 0;
      }
      for(var i = -1; i < cur_level.repeat_y+1; i++)
      {
        for(var j = -1; j < cur_level.repeat_x+1; j++)
        {
          cell = self.cells[boardi(j,i)];
          for(var k = 0; k < 4; k++)
            cell.c[k] = 0;
          cell.present = 0;
          cell.molecule_id = 0;
          cell.block_id = 0;
          cell.score_up = 0;
          cell.score_right = 0;
        }
      }
    }

    self.stampCell = function(block,x,y,molecule_id,block_id)
    {
      var cell;
      if(x == clamp(-1,cur_level.repeat_x,x) && y == clamp(-1,cur_level.repeat_y,y))
      {
        cell = self.cells[boardi(x,y)];
        for(var k = 0; k < 4; k++) cell.c[k] = block.c[k];
        cell.present = 1;
        cell.molecule_id = molecule_id;
        cell.block_id = block_id;
      }
    }

    self.stampMolecule = function(molecule,id)
    {
      var block;
      var x;
      var y;
      for(var i = 0; i < molecule.template.blocks.length; i++)
      {
        block = molecule.template.blocks[i];
        x = molecule.cx+block.cx-bounds.wx+floor(bounds.ww/2-0.1);
        y = molecule.cy+block.cy-bounds.wy+floor(bounds.wh/2-0.1);
        self.stampCell(block,x                   ,y                   , id, i);
        self.stampCell(block,x+cur_level.repeat_x,y                   , id, i);
        self.stampCell(block,x-cur_level.repeat_x,y                   , id, i);
        self.stampCell(block,x                   ,y+cur_level.repeat_y, id, i);
        self.stampCell(block,x                   ,y-cur_level.repeat_y, id, i);
        self.stampCell(block,x+cur_level.repeat_x,y+cur_level.repeat_y, id, i);
        self.stampCell(block,x+cur_level.repeat_x,y-cur_level.repeat_y, id, i);
        self.stampCell(block,x-cur_level.repeat_x,y+cur_level.repeat_y, id, i);
        self.stampCell(block,x-cur_level.repeat_x,y-cur_level.repeat_y, id, i);
      }
    }

    self.populate = function()
    {
      self.clear();
      for(var i = 0; i < molecules.length; i++)
      {
        if(!molecules[i].up)
          self.stampMolecule(molecules[i],i);
      }
    }

    self.score = function()
    {
      var cell;
      var neighbor;
      var cell_score;
      var score = 0;
      for(var i = -1; i < cur_level.repeat_y-1; i++)
      {
        for(var j = -1; j < cur_level.repeat_x-1; j++)
        {
          cell = self.cells[boardi(j,i)];
          if(cell.present)
          {
            neighbor = self.cells[boardi(j+1,i)]; //check right
            if(neighbor.present && cell.molecule_id != neighbor.molecule_id)
            {
              cell_score = (cell.c[1]*neighbor.c[3]*-1)*5;
              if(cell_score == 0) cell_score = 1;
              score            += cell_score;
              cell.score_right += cell_score;
              if(j < cur_level.repeat_x-1) //otherwise can get counted twice (which is good for score- not for happy)
              {
                molecules[cell.molecule_id].happys[cell.block_id] += cell_score;
                molecules[cell.molecule_id].total_happy += cell_score;
                molecules[neighbor.molecule_id].happys[neighbor.block_id] += cell_score;
                molecules[neighbor.molecule_id].total_happy;
              }
            }

            neighbor = self.cells[boardi(j,i+1)]; //check up
            if(neighbor.present && cell.molecule_id != neighbor.molecule_id)
            {
              cell_score = (cell.c[0]*neighbor.c[2]*-1)*5;
              if(cell_score == 0) cell_score = 1;
              score         += cell_score;
              cell.score_up += cell_score;
              if(i < cur_level.repeat_y-1) //otherwise can get counted twice (which is good for score- not for happy)
              {
                molecules[cell.molecule_id].happys[cell.block_id] += cell_score;
                molecules[cell.molecule_id].total_happy += cell_score;
                molecules[neighbor.molecule_id].happys[neighbor.block_id] += cell_score;
                molecules[neighbor.molecule_id].total_happy;
              }
            }
          }
        }
      }
      return score;
    }

  }

  var bring_to_top = function(molecule)
  {
    var found = false;
    for(var i = 0; !found && i < molecules.length; i++)
    {
      if(molecules[i] == molecule)
      {
        for(var j = i-1; j >= 0; j--)
          molecules[j+1] = molecules[j];
        molecules[0] = molecule;
        found = true;
        for(var j = 1; j < molecules.length; j++)
          molecules[j].snap();
      }
    }
  }
  var bring_to_bottom = function(molecule)
  {
    var found = false;
    for(var i = 0; !found && i < molecules.length; i++)
    {
      if(molecules[i] == molecule)
      {
        var j = i;
        while(j < molecules.length-1 && molecules[j+1].up)
        {
          molecules[j] = molecules[j+1];
          j++;
        }
        molecules[j] = molecule;
        found = true;
      }
    }
  }
  var remove_molecule = function(molecule)
  {
    var found = false;
    for(var i = 0; !found && i < molecules.length; i++)
    {
      if(molecules[i] == molecule)
      {
        molecules.splice(i,1);
        found = true;
      }
    }
  }

  var scroller = function()
  {
    var self = this;
    self.ww = cur_level.scroll_w;
    self.wh = game_cam.wh;
    self.wx = game_cam.wx-game_cam.ww/2+self.ww/2;
    self.wy = game_cam.wy-game_cam.wh/2+self.wh/2;
    self.x = 0;
    self.y = 0;
    self.w = 0;
    self.h = 0;

    self.scroll_wy_min = 9999999;
    self.scroll_wy_max = -999999;
    self.scroll_wyv = 0;
    self.scroll_wy = 0;

    self.shouldClick = function(evt)
    {
      if(dragging_molecule || evt.hitUI) return false;
      worldevt.wx = worldSpaceX(cam,canv,evt.doX);
      worldevt.wy = worldSpaceY(cam,canv,evt.doY);
      var hit = worldPtWithin(self.wx,self.wy,self.ww,self.wh,worldevt.wx,worldevt.wy);
      if(hit)
      {
        evt.hitUI = true;
      }
      return hit;
    }
    self.click = function(evt){}

    var last_drag_wevt = {wx:0,wy:0};
    var worldevt = {wx:0,wy:0};
    self.shouldDrag = function(evt)
    {
      if(dragging_molecule || evt.hitUI) return false;
      worldevt.wx = worldSpaceX(cam,canv,evt.doX);
      worldevt.wy = worldSpaceY(cam,canv,evt.doY);
      var hit = worldPtWithin(self.wx,self.wy,self.ww,self.wh,worldevt.wx,worldevt.wy);
      if(hit)
      {
        evt.hitUI = true;
      }
      return hit;
    }
    self.dragStart = function(evt)
    {
      worldevt.wx = worldSpaceX(cam,canv,evt.doX);
      worldevt.wy = worldSpaceY(cam,canv,evt.doY);
      last_drag_wevt.wx = worldevt.wx;
      last_drag_wevt.wy = worldevt.wy;
      self.scroll_wyv = 0.;
    }
    self.drag = function(evt)
    {
      worldevt.wx = worldSpaceX(cam,canv,evt.doX);
      worldevt.wy = worldSpaceY(cam,canv,evt.doY);
      var x_toward_board = worldevt.wx-last_drag_wevt.wx;
      var stamp_hit = 0;
      for(var i = 0; !stamp_hit && i < stamps.length; i++)
      {
        if(stamps[i].ptWithin(worldevt.wx,worldevt.wy))
          stamp_hit = stamps[i];
      }

      if(
        stamp_hit &&
        x_toward_board > abs(worldevt.wy-last_drag_wevt.wy) &&
        x_toward_board > 0.02
      )
      {
        self.dragging = false;
        var s = new molecule();
        s.wx = stamp_hit.wx;
        s.wy = stamp_hit.wy-self.scroll_wy;
        s.setTemplate(stamp_hit.template);
        s.dragging = true;
        dragging_molecule = s;
        molecules[molecules.length] = s;
        bring_to_top(s);
      }
      else
      {
        self.scroll_wy -= worldevt.wy-last_drag_wevt.wy;
        self.scroll_wy = clamp(self.scroll_wy_min,self.scroll_wy_max,self.scroll_wy);
        self.scroll_wyv -= (worldevt.wy-last_drag_wevt.wy)*0.1;
      }
      last_drag_wevt.wx = worldevt.wx;
      last_drag_wevt.wy = worldevt.wy;
    }
    self.dragFinish = function(evt)
    {
    }

    self.tick = function(evt)
    {
      if(!self.dragging)
      {
        self.scroll_wy += self.scroll_wyv;
        self.scroll_wy = clamp(self.scroll_wy_min,self.scroll_wy_max,self.scroll_wy);
        self.scroll_wyv *= 0.8;
      }
      self.scroll_wyv *= 0.99;
    }
  }

  var molecule = function()
  {
    var self = this;

    self.template = new template();
    self.bounces = [];
    self.happys = [];
    self.total_happy = 0;
    self.locked = false;

    self.setTemplate = function(t)
    {
      copy_template(t,self.template);
      self.bounces = [];
      for(var i = 0; i < self.template.blocks.length; i++)
        self.bounces.push(new bounce2());
      self.happys = [];
      for(var i = 0; i < self.template.blocks.length; i++)
        self.happys.push(0);
    }

    self.wx  = 0;
    self.wy  = 0;

    self.base_rot = 0;
    self.rot = 0;
    self.tmp_target_rot = 0;
    self.target_rot = 0;
    self.rot_ticks = 10000000;
    self.click_ticks = 1000000;
    self.up_ticks = 1000000;
    self.up = true;
    self.cx = 0;
    self.cy = 0;

    var worldevt = {wx:0,wy:0};
    var worldoff = {wx:0,wy:0};
    self.shouldClickOff = function(evt,woffx,woffy)
    {
      if(self.locked) return false;
      var hit = false
      for(var i = 0; !hit && i < self.template.blocks.length; i++)
        hit = worldPtWithin(self.wx+self.template.blocks[i].cx,self.wy+self.template.blocks[i].cy,1.,1.,worldevt.wx+woffx,worldevt.wy+woffy);
      return hit;
    }
    self.shouldClick = function(evt)
    {
      if(self.locked) return false;
      if(evt.hitUI) return false;
      if(self.up)
      {
        worldevt.wx = worldSpaceX(cam,canv,evt.doX-shadow_dist);
        worldevt.wy = worldSpaceY(cam,canv,evt.doY-shadow_dist);
      }
      else
      {
        worldevt.wx = worldSpaceX(cam,canv,evt.doX);
        worldevt.wy = worldSpaceY(cam,canv,evt.doY);
      }
      return (
        self.shouldClickOff(evt,                  0,                  0) ||
        self.shouldClickOff(evt, cur_level.repeat_x,                  0) ||
        self.shouldClickOff(evt,-cur_level.repeat_x,                  0) ||
        self.shouldClickOff(evt,                  0, cur_level.repeat_y) ||
        self.shouldClickOff(evt,                  0,-cur_level.repeat_y) ||
        self.shouldClickOff(evt, cur_level.repeat_x, cur_level.repeat_y) ||
        self.shouldClickOff(evt, cur_level.repeat_x,-cur_level.repeat_y) ||
        self.shouldClickOff(evt,-cur_level.repeat_x, cur_level.repeat_y) ||
        self.shouldClickOff(evt,-cur_level.repeat_x,-cur_level.repeat_y)
      );
    }
    self.click = function(evt)
    {
      if(self.click_ticks < 20 && self.target_rot == 0)
      {
        self.base_rot = self.rot;
        self.target_rot += halfpi;
        if(self.target_rot >= twopi-0.001) self.target_rot = 0;
        self.rot_ticks = 0;
        evt.hitUI = true;
      }
      self.click_ticks = 0;
    }

    self.shouldDragOff = function(evt, woffx, woffy)
    {
      if(self.locked) return false;
      var hit = false
      for(var i = 0; !hit && i < self.template.blocks.length; i++)
        hit = worldPtWithin(self.wx+self.template.blocks[i].cx,self.wy+self.template.blocks[i].cy,1.,1.,worldevt.wx+woffx,worldevt.wy+woffy);
      if(hit)
      {
        self.wx -= woffx;
        self.wy -= woffy;
      }
      return hit;
    }
    self.shouldDrag = function(evt)
    {
      if(self.locked) return false;
      if(dragging_molecule || evt.hitUI) return false;
      if(self.up)
      {
        worldevt.wx = worldSpaceX(cam,canv,evt.doX-shadow_dist);
        worldevt.wy = worldSpaceY(cam,canv,evt.doY-shadow_dist);
      }
      else
      {
        worldevt.wx = worldSpaceX(cam,canv,evt.doX);
        worldevt.wy = worldSpaceY(cam,canv,evt.doY);
      }
      var hit = (
        self.shouldDragOff(evt,                  0,                  0) ||
        self.shouldDragOff(evt, cur_level.repeat_x,                  0) ||
        self.shouldDragOff(evt,-cur_level.repeat_x,                  0) ||
        self.shouldDragOff(evt,                  0, cur_level.repeat_y) ||
        self.shouldDragOff(evt,                  0,-cur_level.repeat_y) ||
        self.shouldDragOff(evt, cur_level.repeat_x, cur_level.repeat_y) ||
        self.shouldDragOff(evt, cur_level.repeat_x,-cur_level.repeat_y) ||
        self.shouldDragOff(evt,-cur_level.repeat_x, cur_level.repeat_y) ||
        self.shouldDragOff(evt,-cur_level.repeat_x,-cur_level.repeat_y)
      );
      if(hit)
      {
        evt.hitUI = true;
        self.up = true;
        bring_to_top(self);
        dragging_molecule = self;
      }
      return hit;
    }
    self.dragStart = function(evt)
    {
      worldevt.wx = worldSpaceX(cam,canv,evt.doX);
      worldevt.wy = worldSpaceY(cam,canv,evt.doY);
      worldoff.wx = worldevt.wx-self.wx;
      worldoff.wy = worldevt.wy-self.wy;
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      worldevt.wx = worldSpaceX(cam,canv,evt.doX);
      worldevt.wy = worldSpaceY(cam,canv,evt.doY);
      self.wx = worldevt.wx-worldoff.wx;
      self.wy = worldevt.wy-worldoff.wy;
    }
    self.dragFinish = function(evt)
    {
      if(self.wx < scroll.wx+scroll.ww/2)
        remove_molecule(self);
      self.snap();
      if(dragging_molecule == self) dragging_molecule = 0;
    }

    var blocks_collide = function(x0,y0,x1,y1)
    {
      return (x0 == x1 && y0 == y1);
    }
    self.snap = function()
    {
      var was_up = self.up; //not much, was up with you?
      var molecule;
      var cx = round(self.wx+0.5);
      var cy = round(self.wy+0.5);
      self.up = false;
      for(var i = 0; !self.up && i < molecules.length; i++)
      {
        molecule = molecules[i];
        if(molecule == self || molecule.up) continue;
        for(var j = 0; !self.up && j < self.template.blocks.length; j++)
          for(var k = 0; !self.up && k < molecule.template.blocks.length; k++)
          {
            if(
              blocks_collide(cx+self.template.blocks[j].cx,                    cy+self.template.blocks[j].cy,                    molecule.cx+molecule.template.blocks[k].cx, molecule.cy+molecule.template.blocks[k].cy) ||
              blocks_collide(cx+self.template.blocks[j].cx+cur_level.repeat_x, cy+self.template.blocks[j].cy,                    molecule.cx+molecule.template.blocks[k].cx, molecule.cy+molecule.template.blocks[k].cy) ||
              blocks_collide(cx+self.template.blocks[j].cx-cur_level.repeat_x, cy+self.template.blocks[j].cy,                    molecule.cx+molecule.template.blocks[k].cx, molecule.cy+molecule.template.blocks[k].cy) ||
              blocks_collide(cx+self.template.blocks[j].cx,                    cy+self.template.blocks[j].cy+cur_level.repeat_y, molecule.cx+molecule.template.blocks[k].cx, molecule.cy+molecule.template.blocks[k].cy) ||
              blocks_collide(cx+self.template.blocks[j].cx,                    cy+self.template.blocks[j].cy-cur_level.repeat_y, molecule.cx+molecule.template.blocks[k].cx, molecule.cy+molecule.template.blocks[k].cy) ||
              blocks_collide(cx+self.template.blocks[j].cx+cur_level.repeat_x, cy+self.template.blocks[j].cy+cur_level.repeat_y, molecule.cx+molecule.template.blocks[k].cx, molecule.cy+molecule.template.blocks[k].cy) ||
              blocks_collide(cx+self.template.blocks[j].cx+cur_level.repeat_x, cy+self.template.blocks[j].cy-cur_level.repeat_y, molecule.cx+molecule.template.blocks[k].cx, molecule.cy+molecule.template.blocks[k].cy) ||
              blocks_collide(cx+self.template.blocks[j].cx-cur_level.repeat_x, cy+self.template.blocks[j].cy+cur_level.repeat_y, molecule.cx+molecule.template.blocks[k].cx, molecule.cy+molecule.template.blocks[k].cy) ||
              blocks_collide(cx+self.template.blocks[j].cx-cur_level.repeat_x, cy+self.template.blocks[j].cy-cur_level.repeat_y, molecule.cx+molecule.template.blocks[k].cx, molecule.cy+molecule.template.blocks[k].cy)
            )
              self.up = true;
          }
      }
      for(var i = 0; !self.up && i < cur_level.defect.length; i++)
      {
        molecule = cur_level.defect[i];
        for(var j = 0; !self.up && j < self.template.blocks.length; j++)
          for(var k = 0; !self.up && k < molecule.template.blocks.length; k++)
          {
            if(
              blocks_collide(cx+self.template.blocks[j].cx,                    cy+self.template.blocks[j].cy,                    molecule.cx+molecule.template.blocks[k].cx, molecule.cy+molecule.template.blocks[k].cy) ||
              blocks_collide(cx+self.template.blocks[j].cx+cur_level.repeat_x, cy+self.template.blocks[j].cy,                    molecule.cx+molecule.template.blocks[k].cx, molecule.cy+molecule.template.blocks[k].cy) ||
              blocks_collide(cx+self.template.blocks[j].cx-cur_level.repeat_x, cy+self.template.blocks[j].cy,                    molecule.cx+molecule.template.blocks[k].cx, molecule.cy+molecule.template.blocks[k].cy) ||
              blocks_collide(cx+self.template.blocks[j].cx,                    cy+self.template.blocks[j].cy+cur_level.repeat_y, molecule.cx+molecule.template.blocks[k].cx, molecule.cy+molecule.template.blocks[k].cy) ||
              blocks_collide(cx+self.template.blocks[j].cx,                    cy+self.template.blocks[j].cy-cur_level.repeat_y, molecule.cx+molecule.template.blocks[k].cx, molecule.cy+molecule.template.blocks[k].cy) ||
              blocks_collide(cx+self.template.blocks[j].cx+cur_level.repeat_x, cy+self.template.blocks[j].cy+cur_level.repeat_y, molecule.cx+molecule.template.blocks[k].cx, molecule.cy+molecule.template.blocks[k].cy) ||
              blocks_collide(cx+self.template.blocks[j].cx+cur_level.repeat_x, cy+self.template.blocks[j].cy-cur_level.repeat_y, molecule.cx+molecule.template.blocks[k].cx, molecule.cy+molecule.template.blocks[k].cy) ||
              blocks_collide(cx+self.template.blocks[j].cx-cur_level.repeat_x, cy+self.template.blocks[j].cy+cur_level.repeat_y, molecule.cx+molecule.template.blocks[k].cx, molecule.cy+molecule.template.blocks[k].cy) ||
              blocks_collide(cx+self.template.blocks[j].cx-cur_level.repeat_x, cy+self.template.blocks[j].cy-cur_level.repeat_y, molecule.cx+molecule.template.blocks[k].cx, molecule.cy+molecule.template.blocks[k].cy)
            )
              self.up = true;
          }
      }
      if(was_up && !self.up)
      {
        self.cx = cx;
        self.cy = cy;
        self.wx = cx-0.5;
        self.wy = cy-0.5;
        self.up_ticks = 0;
        bring_to_bottom(self);
      }
      if(!was_up && self.up)
      {
        bring_to_top(self);
      }
    }

    self.tick = function()
    {
      self.click_ticks++;
      self.rot_ticks++;
      if(self.up) self.up_ticks++;
      var t;
      var n_min = 0;
      var n_max = 0;

      //windup
      n_min = n_max+1;
      n_max = 8;
      if(self.rot_ticks == n_min) self.tmp_target_rot = self.base_rot - 0.2*(self.target_rot - self.base_rot);
      if(self.rot_ticks >= n_min && self.rot_ticks < n_max)
        self.rot = lerp(self.rot,self.tmp_target_rot,0.4);

      //overshoot
      n_min = n_max+1;
      n_max = 15;
      if(self.rot_ticks == n_min) self.tmp_target_rot = self.target_rot + 0.1*(self.target_rot - self.base_rot);
      if(self.rot_ticks >= n_min && self.rot_ticks < n_max)
        self.rot = lerp(self.rot,self.tmp_target_rot,0.5);

      //relax
      n_min = n_max+1;
      n_max = 20;
      if(self.rot_ticks == n_min) self.tmp_target_rot = self.target_rot;
      if(self.rot_ticks >= n_min && self.rot_ticks < n_max)
        self.rot = lerp(self.rot,self.tmp_target_rot,0.5);

      if(self.rot_ticks == n_max)
      {
        if(abs(self.target_rot-halfpi) < 0.001)
          rotate_template(self.template);
        self.base_rot       = 0;
        self.rot            = 0;
        self.tmp_target_rot = 0;
        self.target_rot     = 0;
        self.snap();
      }


      for(var i = 0; i < self.bounces.length; i++)
      {
        if(rand() < 0.1)
        {
          var s = 3;

               if(self.happys[i] < -5)  s = 0;
          else if(self.happys[i] < -4)  s = 1;
          else if(self.happys[i] <  0)  s = 2;
          else if(self.happys[i] <  1)  s = 3;
          else if(self.happys[i] <  2)  s = 4;
          else if(self.happys[i] <  3)  s = 5;
          else if(self.happys[i] <  6)  s = 6;
          else if(self.happys[i] <  10) s = 7;
          else                          s = 8;

          s = G[s];

          self.bounces[i].velx += rand0()*s*10;
          self.bounces[i].vely += rand0()*s*10;
        }
        self.bounces[i].tick();
      }
    }

    self.draw_off_up = function(woffx,woffy)
    {
      draw_blocks(self.wx+woffx,self.wy+woffy,0,0,self.bounces,self.happys,self.rot,1,1,0,0,self.template);
      var t = (clamp(0,10,self.up_ticks-5)/10)*0.2;
      draw_blocks(self.wx+t+woffx,self.wy-t+woffy,0,0,self.bounces,self.happys,self.rot,1,0,0,0,self.template);
    }
    self.draw_off_down = function(woffx,woffy)
    {
      draw_blocks(self.wx+woffx,self.wy+woffy,0,0,self.bounces,self.happys,self.rot,1,0,0,self.locked,self.template);
    }
    self.draw_front_up = function()
    {
      if(self.up) self.draw_off_up(0,0);
    }
    self.draw_front_down = function()
    {
      if(!self.up) self.draw_off_down(0,0);
    }
    self.draw_behind_up = function(n)
    {
      if(self.up)
      {
        var ox = cur_level.repeat_x;
        var oy = cur_level.repeat_y;
        var x;
        var y;

        //top left
        for(x = 0; x < n; x++)
          for(y = 0; y < n; y++)
            self.draw_off_up((-n+x)*ox,(-n+y)*oy);

        //top
        for(y = 0; y < n; y++)
          self.draw_off_up(0,(-n+y)*oy);

        //top right
        for(x = 0; x < n; x++)
          for(y = 0; y < n; y++)
            self.draw_off_up((x+1)*ox,(-n+y)*oy);

        //right
        for(x = 0; x < n; x++)
          self.draw_off_up((x+1)*ox,0);

        //bottom right
        for(x = 0; x < n; x++)
          for(y = 0; y < n; y++)
            self.draw_off_up((x+1)*ox,(y+1)*oy);

        //bottom
        for(y = 0; y < n; y++)
          self.draw_off_up(0,(y+1)*oy);

        //bottom left
        for(x = 0; x < n; x++)
          for(y = 0; y < n; y++)
            self.draw_off_up((-n+x)*ox,(y+1)*oy);

        //left
        for(x = 0; x < n; x++)
          self.draw_off_up((-n+x)*ox,0);
      }
    }
    self.draw_behind_down = function(n)
    {
      if(!self.up)
      {
        var ox = cur_level.repeat_x;
        var oy = cur_level.repeat_y;
        var x;
        var y;

        //top left
        for(x = 0; x < n; x++)
          for(y = 0; y < n; y++)
            self.draw_off_down((-n+x)*ox,(-n+y)*oy);

        //top
        for(y = 0; y < n; y++)
          self.draw_off_down(0,(-n+y)*oy);

        //top right
        for(x = 0; x < n; x++)
          for(y = 0; y < n; y++)
            self.draw_off_down((x+1)*ox,(-n+y)*oy);

        //right
        for(x = 0; x < n; x++)
          self.draw_off_down((x+1)*ox,0);

        //bottom right
        for(x = 0; x < n; x++)
          for(y = 0; y < n; y++)
            self.draw_off_down((x+1)*ox,(y+1)*oy);

        //bottom
        for(y = 0; y < n; y++)
          self.draw_off_down(0,(y+1)*oy);

        //bottom left
        for(x = 0; x < n; x++)
          for(y = 0; y < n; y++)
            self.draw_off_down((-n+x)*ox,(y+1)*oy);

        //left
        for(x = 0; x < n; x++)
          self.draw_off_down((-n+x)*ox,0);
      }
    }
  }

  var tcache = function()
  {
    var self = this;
    self.cache = GenIcon(cache_res,cache_res);
    self.shadow_cache = GenIcon(cache_res,cache_res);
    self.cached = false;
  }

  var template = function(cx,cy,blocks)
  {
    var self = this;
    self.cx = cx;
    self.cy = cy;
    self.blocks = blocks;
    self.rotation = 0;

    self.tcache = [];
    if(blocks) //else will get copied
    {
      for(var i = 0; i < 4; i++)
      self.tcache[i] = new tcache();
    }
  }

  var defect = function(cx,cy,template)
  {
    var self = this;
    self.template = template;
    self.cx = cx;
    self.cy = cy;
    self.wx = cx-0.5;
    self.wy = cy-0.5;
  }

  var stamp = function()
  {
    var self = this;

    self.template = new template();

    self.wx  = 0;
    self.wy  = 0;

    self.base_rot = 0;
    self.rot = 0;
    self.tmp_target_rot = 0;
    self.target_rot = 0;
    self.rot_ticks = 10000000;
    self.click_ticks = 1000000;

    self.ptWithin = function(wx,wy)
    {
      if(self.target_rot != 0) return false;
      var hit = false
      hit = worldPtWithin(self.wx-self.template.cx,self.wy-template.cy-scroll.scroll_wy,1.,1.,wx,wy);
      for(var i = 0; !hit && i < self.template.blocks.length; i++)
        hit = worldPtWithin(self.wx-self.template.cx+self.template.blocks[i].cx,self.wy-self.template.cy+self.template.blocks[i].cy-scroll.scroll_wy,1.,1.,wx,wy);
      return hit;
    }

    var worldevt = {wx:0,wy:0};
    self.shouldClick = function(evt)
    {
      worldevt.wx = worldSpaceX(cam,canv,evt.doX);
      worldevt.wy = worldSpaceY(cam,canv,evt.doY);
      return self.ptWithin(worldevt.wx,worldevt.wy);
    }
    self.click = function(evt)
    {
      if(self.click_ticks < 20 && self.target_rot == 0)
      {
        self.base_rot = self.rot;
        self.target_rot += halfpi;
        if(self.target_rot >= twopi-0.001) self.target_rot = 0;
        self.rot_ticks = 0;
      }
      self.click_ticks = 0;
    }

    self.tick = function()
    {
      self.click_ticks++;
      self.rot_ticks++;
      var t;
      var n_min = 0;
      var n_max = 0;

      //windup
      n_min = n_max+1;
      n_max = 8;
      if(self.rot_ticks == n_min) self.tmp_target_rot = self.base_rot - 0.2*(self.target_rot - self.base_rot);
      if(self.rot_ticks >= n_min && self.rot_ticks < n_max)
        self.rot = lerp(self.rot,self.tmp_target_rot,0.4);

      //overshoot
      n_min = n_max+1;
      n_max = 15;
      if(self.rot_ticks == n_min) self.tmp_target_rot = self.target_rot + 0.1*(self.target_rot - self.base_rot);
      if(self.rot_ticks >= n_min && self.rot_ticks < n_max)
        self.rot = lerp(self.rot,self.tmp_target_rot,0.5);

      //relax
      n_min = n_max+1;
      n_max = 20;
      if(self.rot_ticks == n_min) self.tmp_target_rot = self.target_rot;
      if(self.rot_ticks >= n_min && self.rot_ticks < n_max)
        self.rot = lerp(self.rot,self.tmp_target_rot,0.5);

      if(self.rot_ticks == n_max)
      {
        if(abs(self.target_rot-halfpi) < 0.001)
          rotate_template(self.template);
        self.base_rot       = 0;
        self.rot            = 0;
        self.tmp_target_rot = 0;
        self.target_rot     = 0;
      }
    }

    self.draw = function()
    {
      draw_blocks(self.wx,self.wy-scroll.scroll_wy,self.template.cx,self.template.cy,0,0,self.rot,1,0,0,0,self.template);
    }
  }

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});
    dragger = new Dragger({source:stage.dispCanv.canvas});

    n_ticks = 0;
    total_stars = 0;
    score = 0;
    submitting_t = -1;

    score_board = new board();
    stamps = [];
    molecules = [];

    game_cam = { wx:-20, wy:0, ww:12, wh:6 };
    menu_cam = { wx:-20, wy:0, ww:12, wh:6 };
    cam = { wx:menu_cam.wx, wy:menu_cam.wy, ww:menu_cam.ww, wh:menu_cam.wh };
    bounds = {wx:0, wy:0, ww:0, wh:0, x:0,y:0,w:0,h:0 };

    init_levels();
    loadLevelStars();
    set_level(0);

    mode = MODE_MENU;

    total_stars_disp = new totalStarsDisplay();
    total_stars_disp.wx = -25;
    total_stars_disp.wy =   2;
    total_stars_disp.ww = 1;
    total_stars_disp.wh = 1;
    screenSpace(cam,canv,total_stars_disp);

    outro = new star_outro();

    back_btn = {wx:0,wy:0,ww:0,wh:0,x:0,y:0,w:0,h:0};
    back_btn.click = function(evt) { mode = MODE_MENU; countLevelStars(); evt.hitUI = true; }
    back_btn.ww = game_cam.ww/10;
    back_btn.wh = game_cam.wh/10;
    back_btn.wx = game_cam.wx-game_cam.ww/2+back_btn.ww/2;
    back_btn.wy = game_cam.wy+game_cam.wh/2-back_btn.wh/2;
    screenSpace(cam,canv,back_btn);

    clear_btn = {wx:0,wy:0,ww:0,wh:0,x:0,y:0,w:0,h:0};
    clear_btn.click = function(evt)
    {
      for(var i = 0; i < molecules.length ;)
      {
        if(molecules[i].locked) i++;
        else molecules.splice(i,1);
        dragging_molecule = 0;
      }
    }
    clear_btn.ww = game_cam.ww/10;
    clear_btn.wh = game_cam.wh/10;
    clear_btn.wx = game_cam.wx-game_cam.ww/2+clear_btn.ww/2;
    clear_btn.wy = game_cam.wy+game_cam.wh/2-back_btn.wh-clear_btn.wh/2;
    screenSpace(cam,canv,clear_btn);

    submit_btn = {wx:0,wy:0,ww:0,wh:0,x:0,y:0,w:0,h:0};
    submit_btn.click = function(evt) { mode = MODE_SUBMIT; submitting_t = 0; evt.hitUI = true; }
    submit_btn.ww = game_cam.ww/5;
    submit_btn.wh = game_cam.wh/10;
    submit_btn.wx = game_cam.wx+game_cam.ww/2-submit_btn.ww/2;
    submit_btn.wy = game_cam.wy+game_cam.wh/2-submit_btn.wh/2;
    screenSpace(cam,canv,submit_btn);


    cur_stars_bounce = new bounce();
    score_bounce = new bounce();
  }

  self.tick = function()
  {
    n_ticks++;

    //lerp cam
    if(mode == MODE_MENU)
    {
      cam.wx = lerp(cam.wx,menu_cam.wx,0.1);
      cam.wy = lerp(cam.wy,menu_cam.wy,0.1);
      cam.ww = lerp(cam.ww,menu_cam.ww,0.1);
      cam.wh = lerp(cam.wh,menu_cam.wh,0.1);
    }
    if(mode == MODE_GAME || mode == MODE_INTRO)
    {
      cam.wx = lerp(cam.wx,game_cam.wx,0.1);
      cam.wy = lerp(cam.wy,game_cam.wy,0.1);
      cam.ww = lerp(cam.ww,game_cam.ww,0.1);
      cam.wh = lerp(cam.wh,game_cam.wh,0.1);
    }
    if(mode == MODE_SUBMIT)
    {
      cam.wx = lerp(cam.wx,game_cam.wx,0.1);
      cam.wy = lerp(cam.wy,game_cam.wy,0.1);
      var t = min(1,submitting_t/(star_outro_sub_slide+star_outro_sub_star+star_outro_sub_zoom));
      cam.ww = lerp(cam.ww,game_cam.ww*(1+t*3),0.1);
      cam.wh = lerp(cam.wh,game_cam.wh*(1+t*3),0.1);
    }

    //screen space based on new cam
    screenSpace(cam,canv,bounds);
    screenSpace(cam,canv,scroll);
    screenSpace(cam,canv,total_stars_disp);

    for(var i = 0; i < levels.length; i++)
    {
      screenSpace(cam,canv,levels[i].button);
    }
    screenSpace(cam,canv,bounds);
    screenSpace(cam,canv,scroll);

    back_btn.ww = game_cam.ww/10;
    back_btn.wh = game_cam.wh/10;
    back_btn.wx = game_cam.wx-game_cam.ww/2+back_btn.ww/2;
    back_btn.wy = game_cam.wy+game_cam.wh/2-back_btn.wh/2;
    screenSpace(cam,canv,back_btn);

    clear_btn.ww = game_cam.ww/10;
    clear_btn.wh = game_cam.wh/10;
    clear_btn.wx = game_cam.wx-game_cam.ww/2+clear_btn.ww/2;
    clear_btn.wy = game_cam.wy+game_cam.wh/2-back_btn.wh-clear_btn.wh/2;
    screenSpace(cam,canv,clear_btn);

    submit_btn.ww = game_cam.ww/5;
    submit_btn.wh = game_cam.wh/10;
    submit_btn.wx = game_cam.wx+game_cam.ww/2-submit_btn.ww/2;
    submit_btn.wy = game_cam.wy+game_cam.wh/2-submit_btn.wh/2;
    screenSpace(cam,canv,submit_btn);

    //resolve input
    if(mode == MODE_INTRO)
    {
      clicker.filter(cur_level);
      if(!cur_level.introtick()) mode = MODE_GAME;
    }

    if(mode == MODE_GAME)
    {
      clicker.filter(back_btn);
      clicker.filter(clear_btn);
      clicker.filter(submit_btn);
      for(var i = 0; i < stamps.length; i++)
        clicker.filter(stamps[i]);
      dragger.filter(scroll);
      clicker.filter(scroll);
      for(var i = 0; i < molecules.length; i++)
        clicker.filter(molecules[i]);
      for(var i = 0; i < molecules.length; i++)
        dragger.filter(molecules[i]);
    }
    else if(mode == MODE_MENU)
    {
      for(var i = 0; i < levels.length; i++)
        clicker.filter(levels[i].button);
    }
    else if(mode == MODE_SUBMIT)
    {
      if(submitting_t > star_outro_sub_slide+star_outro_sub_star+star_outro_sub_zoom)
        clicker.filter(outro);
    }

    clicker.flush();
    dragger.flush();

    //tick data
    for(var i = 0; i < molecules.length; i++)
      molecules[i].tick();
    for(var i = 0; i < stamps.length; i++)
      stamps[i].tick();
    scroll.tick();

    var old_score = score;
    score_board.populate();
    score = score_board.score();
    if(score != old_score)
      score_bounce.vel = 1;

    if(submitting_t != -1)
    {
      if(submitting_t == 0) outro.start_ticks = n_ticks+40;
      var t_into_outro = submitting_t;
      if(t_into_outro < star_outro_sub_slide)
        outro.wx = lerp(bounds.wx-bounds.ww/2-5-5,bounds.wx,t_into_outro/star_outro_sub_slide);
      else
        outro.wx = bounds.wx;
      outro.wy = 0;
      outro.ww = cam.ww/4;
      outro.wh = cam.wh/2;
      screenSpace(cam,canv,outro);
      submitting_t++;
    }

    var old_cur_stars = cur_level.cur_stars;
    cur_level.cur_stars = 0;
    if(score > cur_level.best) cur_level.best = score;
    for(var i = 0; i < 3; i++)
      if(score >= cur_level.star_req_score[i]) cur_level.cur_stars = i+1;
    if(cur_level.cur_stars > cur_level.stars) cur_level.stars = cur_level.cur_stars;
    if(cur_level.cur_stars != old_cur_stars)
    {
      cur_level.cur_stars_t = 0;
      cur_stars_bounce.vel = 1;
    }
    cur_stars_bounce.tick();
    score_bounce.tick();
    cur_level.cur_stars_t++;
  };

  self.draw = function()
  {
    ctx.font = "20px Architects Daughter";

    var sub_t = min(1,submitting_t/(star_outro_sub_slide+star_outro_sub_star+star_outro_sub_zoom));
    var quick_sub_t = min(1,submitting_t/star_outro_sub_slide);

    //grid
    var x  = 0;
    var wx = 0;
    var min_wx = worldSpaceX(cam,canv,0);
    var max_wx = worldSpaceX(cam,canv,canv.width);
    var y  = 0;
    var wy = 0;
    var min_wy = worldSpaceY(cam,canv,canv.height);
    var max_wy = worldSpaceY(cam,canv,0);

    var v_spacing = 1;
    var h_spacing = 1;

    ctx.fillStyle = grid_fill;
    ctx.fillRect(0,0,canv.width,canv.height);
    ctx.strokeStyle = grid_stroke;

    wy = floor(min_wy/v_spacing)*v_spacing;
    while(wy < max_wy)
    {
      y = screenSpaceY(cam,canv,wy);
      if(y > bounds.y && y < bounds.y+bounds.h)
      {
        ctx.beginPath();
        ctx.moveTo(bounds.x,y);
        ctx.lineTo(bounds.x+bounds.w,y);
        ctx.stroke();
      }
      wy += v_spacing;
    }

    wx = floor(min_wx/h_spacing)*h_spacing;
    while(wx < max_wx)
    {
      x = screenSpaceX(cam,canv,wx);
      if(x > bounds.x && x < bounds.x+bounds.w)
      {
        ctx.beginPath();
        ctx.moveTo(x,bounds.y);
        ctx.lineTo(x,bounds.y+bounds.h);
        ctx.stroke();
      }
      wx += h_spacing;
    }

    var draw_n = 1;
    if(mode == MODE_SUBMIT)
    {
      draw_n = round(0.5+sub_t*2);
      if(sub_t == 1) draw_n++;
    }

    //defects
    for(var i = 0; i < cur_level.defect.length; i++)
      draw_blocks(cur_level.defect[i].wx,cur_level.defect[i].wy,0,0,0,0,0,1,1,1,0,cur_level.defect[i].template);

    //molecules back
    for(var i = molecules.length-1; i >= 0; i--)
      molecules[i].draw_behind_down(draw_n);
    for(var i = molecules.length-1; i >= 0; i--)
      molecules[i].draw_front_down();

    //borders
    ctx.fillStyle = bg_fill;
    if(bounds.w)
    {
      ctx.fillRect(0,0,canv.width,bounds.y);
      ctx.fillRect(0,bounds.y,bounds.x,bounds.h);
      ctx.fillRect(bounds.x+bounds.w,bounds.y,canv.width-(bounds.x+bounds.w),bounds.h);
      ctx.fillRect(0,bounds.y+bounds.h,canv.width,bounds.y);
    }
    else
      ctx.fillRect(0,0,canv.width,canv.height);

    ctx.strokeStyle = bounds_stroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(bounds.x,bounds.y,bounds.w,bounds.h);

    //molecules front
    for(var i = molecules.length-1; i >= 0; i--)
      molecules[i].draw_behind_up(draw_n);

    //scroll
    if(mode == MODE_SUBMIT)
      ctx.globalAlpha = (1-quick_sub_t);

    ctx.fillStyle = scroll_fill;
    ctx.fillRect(scroll.x,scroll.y,scroll.w,scroll.h);
    for(var i = 0; i < stamps.length; i++)
      stamps[i].draw();

    ctx.globalAlpha = 1;

    //the rest of molecules front
    for(var i = molecules.length-1; i >= 0; i--)
      molecules[i].draw_front_up();

    if(mode == MODE_SUBMIT)
      ctx.globalAlpha = (1-quick_sub_t);

    //UI
    ctx.fillStyle = white;
    ctx.fillText("Score: "      ,bounds.x+bounds.w-200,   bounds.y-10);
    var oldfont = ctx.font;
    ctx.font = (20+10*score_bounce.v)+"px Architects Daughter";
    ctx.fillText(          score,bounds.x+bounds.w-200+60,bounds.y-10);
    ctx.font = oldfont;
    ctx.fillText("< Menu",back_btn.x,back_btn.y+back_btn.h/2);
    ctx.fillText("Clear",clear_btn.x,clear_btn.y+clear_btn.h/2);
    ctx.fillText("[Submit]",submit_btn.x,submit_btn.y+submit_btn.h/2);

    var b = cur_stars_bounce.v*10;
    for(var i = 0; i < 3; i++)
    {
      if(cur_level.cur_stars > i)
        ctx.drawImage(star_full,bounds.x+bounds.w-270+20*i-b/2,bounds.y-26-b/2,20+b,20+b);
      else
        ctx.drawImage(star     ,bounds.x+bounds.w-270+20*i,bounds.y-26,20,20);
    }

    ctx.fillText("Crystal Packer 5000!!!",levels[0].button.x,levels[0].button.y);
    ctx.fillText("Choose a   ^",levels[0].button.x-100,levels[0].button.y+125);
    ctx.fillText("|",levels[0].button.x+4,levels[0].button.y+135);
    ctx.fillText("Molecule --",levels[0].button.x-100,levels[0].button.y+150);
    for(var i = 0; i < levels.length; i++)
      levels[i].button.draw();

    ctx.globalAlpha = 1;

    if(mode == MODE_SUBMIT)
      outro.draw();
    if(mode == MODE_INTRO)
      cur_level.introdraw();

    total_stars_disp.draw();
  };

  self.cleanup = function()
  {
  };

};

