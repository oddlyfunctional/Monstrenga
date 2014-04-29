// Generated by CoffeeScript 1.3.3

window.addEventListener("load", function() {
  var Q;
  Q = window.Q = Quintus().include("Sprites, Scenes, Input, 2D, Anim, Touch, UI").setup({
    maximize: true
  }).controls(true).touch();
  Q.component("fearOfHeight", {
    added: function() {
      return this.entity.on("step", this, "step");
    },
    step: function(dt) {
      var x_offset, y_offset;
      y_offset = 20;
      x_offset = 10;
      x_offset *= (function() {
        switch (this.entity.direction()) {
          case "left":
            return -1;
          case "right":
            return 1;
        }
      }).call(this);
      if (!Q.stage().locate(this.entity.p.x + x_offset, this.entity.p.y + y_offset, Q.SPRITE_ALL)) {
        return this.entity.p.vx *= -1;
      }
    }
  });
  Q.component("flippable", {
    added: function() {
      return this.entity.on("step", this, "step");
    },
    step: function(dt) {
      if (this.entity.p.vx > 0) {
        return this.entity.play("walk_right");
      } else if (this.entity.p.vx < 0) {
        return this.entity.play("walk_left");
      }
    }
  });
  Q.Sprite.extend("Player", {
    init: function(p) {
      this._super(p, {
        sheet: "player",
        sprite: "player",
        x: 410,
        y: 90,
        life: 1,
        jumpSpeed: -450
      });
      this.add("2d, platformerControls, animation, flippable");
      return this.on("hit.sprite", function(collision) {
        if (collision.obj.isA("Tower")) {
          Q.stageScene("endGame", 1, {
            label: "You Won!"
          });
          return this.destroy();
        }
      });
    },
    step: function(dt) {
      if (Q.debug) {
        return Q.stageScene('hud', 3, this.p);
      }
    },
    draw: function(ctx) {
      this._super(ctx);
      if (Q.debug) {
        ctx.fillStyle = "red";
        return ctx.fillRect(-20, 20, 5, 5);
      }
    },
    die: function() {
      Q.clearStages();
      return Q.stageScene("level1");
    },
    updateHud: function() {
      return Q.stageScene('hud', 3, this.p);
    },
    loseLife: function() {
      if (this.p.life === 0) {
        return this.die();
      } else {
        this.p.life -= 1;
        return this.updateHud();
      }
    }
  });
  Q.Sprite.extend("Range", {
    init: function(p) {
      this._super(p);
      return this.owner = this.p.owner;
    },
    step: function(dt) {
      this.p.x = this.owner.p.x;
      return this.p.y = this.owner.p.y;
    },
    draw: function(ctx) {
      var x_range, y_range;
      this._super(ctx);
      if (Q.debug) {
        ctx.fillStyle = "red";
        x_range = this.owner.direction() === "left" ? -this.p.w : 0;
        y_range = -this.owner.p.h / 2;
        return ctx.fillRect(x_range, y_range, this.p.w, this.p.h);
      }
    }
  });
  Q.Sprite.extend("Enemy", {
    WALKING: 0,
    DEAD: 1,
    PANIC: 2,
    init: function(p) {
      this._super(p, {
        sheet: "human",
        sprite: "human",
        vx: 100
      });
      this.state = this.WALKING;
      this.range = new Q.Range({
        w: 100,
        h: 20,
        owner: this
      });
      this.add("2d, aiBounce, fearOfHeight, animation, flippable");
    },
    direction: function() {
      if (this.p.vx < 0) {
        return "left";
      } else {
        return "right";
      }
    },
    draw: function(ctx) {
      this._super(ctx);
      return this.range.draw(ctx);
    },
    step: function(dt) {
      this.range.step(dt);
      switch (this.state) {
        case this.WALKING:
          if (Q.overlap(this.range, Q.player)) {
            return this.panic();
          }
          break;
        case this.DEAD:
          this.p.vx = 0;
          return this.p.angle = 90;
      }
    },
    panic: function() {
      this.state = this.PANIC;
      this.p.vx *= -2;
      return this.del("fearOfHeight");
    },
    die: function() {
      Q.player.loseLife();
      return this.destroy();
    }
  });
  Q.Sprite.extend("Trap", {
    init: function(p) {
      this._super(p, {
        w: 20,
        h: 20
      });
      return this.on("hit.sprite", function(collision) {
        return collision.obj.die();
      });
    }
  });
  Q.scene("hud", function(stage) {
    var container;
    container = stage.insert(new Q.UI.Container({
      x: 50,
      y: 0
    }));
    container.insert(new Q.UI.Text({
      x: 600,
      y: 20,
      label: "Life: " + Q.player.p.life,
      color: "black"
    }));
    if (Q.debug) {
      container.insert(new Q.UI.Text({
        x: 200,
        y: 20,
        label: "x: " + Q.player.p.x + ", y: " + Q.player.p.y,
        color: "red"
      }));
    }
    container.fit(20);
  });
  Q.scene("level1", function(stage) {
    stage.insert(new Q.Repeater({
      asset: "background-wall.png",
      speedX: 0.5,
      speedY: 0.5
    }));
    stage.collisionLayer(new Q.TileLayer({
      dataAsset: "level.json",
      sheet: "tiles"
    }));
    Q.player = stage.insert(new Q.Player({
      x: 74,
      y: 1105
    }));
    stage.add("viewport").follow(Q.player);
    window.enemy1 = new Q.Enemy({
      x: 100,
      y: 17
    });
    stage.insert(enemy1);
    window.trap1 = new Q.Trap({
      x: 882,
      y: 209
    });
    stage.insert(trap1);
    return Q.stageScene('hud', 3, Q.player.p);
  });
  Q.scene("endGame", function(stage) {
    var button, container, label;
    container = stage.insert(new Q.UI.Container({
      x: Q.width / 2,
      y: Q.height / 2,
      fill: "rgba(0,0,0,0.5)"
    }));
    button = container.insert(new Q.UI.Button({
      x: 0,
      y: 0,
      fill: "#CCCCCC",
      label: "Play Again"
    }));
    label = container.insert(new Q.UI.Text({
      x: 10,
      y: -10 - button.p.h,
      label: stage.options.label
    }));
    button.on("click", function() {
      Q.clearStages();
      Q.stageScene("level1");
    });
    container.fit(20);
  });
  return Q.load("player.png, player.json, human.png, human.json, level.json, tiles.png, background-wall.png", function() {
    Q.sheet("tiles", "tiles.png", {
      tilew: 32,
      tileh: 32
    });
    Q.compileSheets("player.png", "player.json");
    Q.compileSheets("human.png", "human.json");
    Q.animations("player", {
      walk_right: {
        frames: [0],
        rate: 1 / 15,
        flip: false,
        loop: true
      },
      walk_left: {
        frames: [0],
        rate: 1 / 15,
        flip: "x",
        loop: true
      }
    });
    Q.animations("human", {
      walk_right: {
        frames: [0],
        rate: 1 / 15,
        flip: false,
        loop: true
      },
      walk_left: {
        frames: [0],
        rate: 1 / 15,
        flip: "x",
        loop: true
      }
    });
    return Q.stageScene("level1");
  });
});
