var GamePlayScene = function(game, stage)
{
  var self = this;

  var canv = stage.drawCanv;
  var canvas = canv.canvas;
  var ctx = canv.context;

  var clicker;
  var dragger;

  var coord = {x:0,y:0};
  var cam = { wx:0, wy:0, ww:8, wh:4 };

  var shape = function()
  {
    var self = this;

    self.blocks = [];

    self.wx  = 0;
    self.wy  = 0;

    self.base_rot = 0;
    self.rot = 0;
    self.tmp_target_rot = 0;
    self.target_rot = 0;
    self.rot_ticks = 10000000;

    self.click_ticks = 1000000;

    var worldevt = {wx:0,wy:0};
    self.shouldClick = function(evt)
    {
      worldevt.wx = worldSpaceX(cam,canv,evt.doX);
      worldevt.wy = worldSpaceY(cam,canv,evt.doY);
      return worldPtWithin(self.wx,self.wy,1.,1.,worldevt.wx,worldevt.wy);
    }
    self.click = function(evt)
    {
      if(self.click_ticks < 20)
      {
        self.base_rot = self.rot;
        self.target_rot += halfpi;
        if(self.target_rot >= twopi-0.001) self.target_rot = 0;
        self.rot_ticks = 0;
      }
      self.click_ticks = 0;
    }

    self.shouldDrag = function(evt)
    {
      worldevt.wx = worldSpaceX(cam,canv,evt.doX);
      worldevt.wy = worldSpaceY(cam,canv,evt.doY);
      var hit = false
      hit = worldPtWithin(self.wx,self.wy,1.,1.,worldevt.wx,worldevt.wy);
      for(var i = 0; !hit && i < self.blocks.length; i++)
        hit = worldPtWithin(self.wx+self.blocks[i].wx,self.wy+self.blocks[i].wy,1.,1.,worldevt.wx,worldevt.wy);
      return hit;
    }
    self.dragStart = function(evt)
    {
      self.drag(evt);
    }
    self.drag = function(evt)
    {
      worldevt.wx = worldSpaceX(cam,canv,evt.doX);
      worldevt.wy = worldSpaceY(cam,canv,evt.doY);
      self.wx = worldevt.wx;
      self.wy = worldevt.wy;
    }
    self.dragFinish = function(evt)
    {
      self.snap();
    }

    self.snap = function()
    {
      self.wx = round(self.wx+0.5)-0.5;
      self.wy = round(self.wy+0.5)-0.5;
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
        self.base_rot = self.target_rot;
        self.rot = self.target_rot;
        self.tmp_target_rot = self.target_rot;
      }
    }

    var cblock = {x:0,y:0,w:0,h:0,wx:1,wy:1,ww:1,wh:1}
    var block = {x:0,y:0,w:0,h:0,wx:1,wy:1,ww:1,wh:1}
    var tx;
    var ty;
    self.draw = function()
    {
      cblock.wx = self.wx;
      cblock.wy = self.wy;
      screenSpace(cam,canv,cblock);
      tx = cblock.x+cblock.w/2;
      ty = cblock.y+cblock.h/2;

      ctx.save();
      ctx.translate(tx,ty);
      ctx.rotate(self.rot);
      ctx.fillRect(cblock.x-tx,cblock.y-ty,cblock.w,cblock.h);
      ctx.restore();
      for(var i = 0; i < self.blocks.length; i++)
      {
        block.wx = self.wx+self.blocks[i].wx;
        block.wy = self.wy+self.blocks[i].wy;
        screenSpace(cam,canv,block);

        ctx.save();
        ctx.translate(tx,ty);
        ctx.rotate(self.rot);
        ctx.fillRect(block.x-tx,block.y-ty,block.w,block.h);
        ctx.restore();
      }
    }
  }

  var shapes = [];

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});
    dragger = new Dragger({source:stage.dispCanv.canvas});

    shapes[0] = new shape();
    shapes[0].blocks = [{wx:-1,wy:0},{wx:0,wy:1}];
  };

  self.tick = function()
  {
    for(var i = 0; i < shapes.length; i++)
      clicker.filter(shapes[i]);
    clicker.flush();
    for(var i = 0; i < shapes.length; i++)
      dragger.filter(shapes[i]);
    dragger.flush();

    for(var i = 0; i < shapes.length; i++)
      shapes[i].tick();
  };

  self.draw = function()
  {
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

    //horizontal
    wy = floor(min_wy/v_spacing)*v_spacing;
    while(wy < max_wy)
    {
      y = screenSpaceY(cam,canv,wy);
      ctx.beginPath();
      ctx.moveTo(0,y);
      ctx.lineTo(canv.width,y);
      ctx.stroke();
      wy += v_spacing;
    }

    wx = floor(min_wx/h_spacing)*h_spacing;
    while(wx < max_wx)
    {
      x = screenSpaceX(cam,canv,wx);
      ctx.beginPath();
      ctx.moveTo(x,0);
      ctx.lineTo(x,canv.height);
      ctx.stroke();
      wx += h_spacing;
    }

    for(var i = 0; i < shapes.length; i++)
      shapes[i].draw();
  };

  self.cleanup = function()
  {
  };

};

