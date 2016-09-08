var difficulty = 0;
var score = 0;
var highscore;
var thrown = 0;
var caught = 0;
var missed = 0;
var game_length = 75;
var countdown = 0;
var missed_icon = "\uE888";
var plus_one = "\uE3CD";
var minus_one = "\uE3CB";
var timer = "\uE425";
var truck = "\uE558";

var safe_colors = ["255,255,255", "255,182,219", "182,219,255", "255,255,109"];
var path_types = ["VLINE", "LINE", "ARC", "ARC-L"];

                        // fridge, briefcase, washer, bed, tv, couch, suitcase, chair
var available_items = ["\uEB47", "\uEB3F", "\uE54A", "\uE549", "\uE333", "\uE16B", "\uE8F9", "\uE903"];
var available_count = available_items.length - 1;

var speeds = [2, 3, 4, 5, 6];
var num_speeds = speeds.length - 1;

var truck_speeds = [0, 4];
var num_truck_speeds = truck_speeds.length - 1;

var intro;
var howtoplay;
var canvas;
var context;
var playing = false;

var second_counter = 0;
var animate_counter = 0;
var animate_interval = 150;
var lastTime;

var deviceWidth = 360;
var deviceHeight = 360;
var centerX;
var centerY;

var items = [];

window.onload = function() {

    document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName === "back") {
            try {
                tizen.power.release("SCREEN");
                tizen.application.getCurrentApplication().exit();
            } catch (ignore) {
            }
        }
    });

//    tizen.power.request("SCREEN", "SCREEN_NORMAL");

    if (localStorage.getItem("highscore") === null) {
        // first time playing
        localStorage.setItem("highscore", 0);
        highscore = 0;
    } else {
        highscore = localStorage.getItem("highscore");
    }

    try {
        tizen.systeminfo.getPropertyValue("DISPLAY", function(disp) {
            deviceWidth = disp.resolutionWidth;
            deviceHeight = disp.resolutionHeight;
        });
    } catch (e) {
        deviceWidth = 360;
        deviceHeight = 360;
    } finally {
        intro = document.getElementById('intro');
        canvas = document.getElementById('canvas');
        howtoplay = document.getElementById('howtoplay');
        canvas.width = deviceWidth;
        canvas.height = deviceHeight;
        context = canvas.getContext('2d');
        centerX = deviceWidth / 2;
        centerY = deviceHeight / 2;

        showIntro();

    }


    document.addEventListener("rotarydetent", function(ev) {
/*
      var newspeed = items[0].speed + 1;
      var curr_dir = items[0].direction;

      if (newspeed > num_truck_speeds) {
        newspeed = num_truck_speeds;
      }
*/
       var direction = ev.detail.direction;

       if (direction == "CW") {

          items[0].flip = true;
          items[0].direction = 1;
          items[0].speed = 1;

/*
          // Add behavior for clockwise rotation
          if (curr_dir == -1) {
            items[0].direction = 0;
            newspeed = 0;
          } else if (curr_dir == 0) {
            items[0].direction = 1;
            newspeed = num_truck_speeds;
          }

          items[0].flip = true;
          items[0].speed = newspeed;
 */
       } else if (direction == "CCW") {

          items[0].flip = false;
          items[0].direction = -1;
          items[0].speed = 1;

/*
          if (curr_dir == 1) {
            items[0].direction = 0;
            newspeed = 0;
          } else if (curr_dir == 0) {
              items[0].direction = -1;
              newspeed = num_truck_speeds;
          }

          items[0].flip = false;
          items[0].speed = newspeed;
*/
       }
    });

    document.onkeydown = function(event) {

      var newspeed = items[0].speed + 1;
      var curr_dir = items[0].direction;

      if (newspeed > num_truck_speeds) {
        newspeed = num_truck_speeds;
      }

      if (event.keyCode == 37) {
          // left arrow
          if (curr_dir == -1) {
            items[0].direction = 0;
            newspeed = 0;
          } else if (curr_dir == 0) {
            items[0].direction = 1;
            newspeed = num_truck_speeds;
          }

          items[0].flip = true;
          items[0].speed = newspeed;

      } else if (event.keyCode == 39) {
          // right arrow
        if (curr_dir == 1) {
          items[0].direction = 0;
          newspeed = 0;
        } else if (curr_dir == 0) {
            items[0].direction = -1;
            newspeed = num_truck_speeds;
        }

        items[0].flip = false;
        items[0].speed = newspeed;
      }

      console.log("newspeed is", newspeed);
    };
};

function animate(currTime) {

    if (!currTime) {
      currTime = window.performance.now();
    }

    if (!lastTime) {
      lastTime = currTime;
    }

    var diff = currTime - lastTime;
    second_counter += diff;
    lastTime = currTime;

//    console.log("score counter", score_counter, currTime, lastTime);
    if (second_counter > 1000) {
      // anything to do once a second?
      if (difficulty > 0) {
        countdown--;

        if (countdown < 0) {
          countdown = 0;
        }
      }
      second_counter = 0;
    }

    animate_counter += diff;
    if (animate_counter > animate_interval) {
      // do something every animate_interval (100ms)

      animate_counter = 0;
    }


  clearCanvasRegion(0, 0, canvas.width, canvas.height);

  // outer circle for guidance
/*
  context.beginPath();
  context.strokeStyle = "#006699";
  context.lineWidth = 2;
  context.arc(centerX, centerY, 180, 0, Math.PI * 2, false);
  context.closePath();
  context.stroke();
*/
  // draw arc for truck
  context.beginPath();
  context.strokeStyle = "#FF0000";
  context.lineWidth = 2;
  context.arc(items[0].cx, items[0].cy, items[0].radius, items[0].min_angle, items[0].max_angle, false);
  context.stroke();

  // draw caught, misses, timer
  var xpos;

  xpos = centerX - 50;
  context.font = "36px 'Material Icons'";

  context.fillStyle = "rgba(0, 255, 0, .7)";
  context.fillText(plus_one, xpos, centerY - 70);

  context.fillStyle = "rgba(255, 0, 0, .7)";
  context.fillText(missed_icon, xpos, centerY - 20);

  if (difficulty > 0) {
    context.fillStyle = "rgba(200, 200, 200, .7)";
    context.fillText(timer, xpos, centerY + 30);
  }

  context.fillStyle = "rgba(200, 200, 200, .4)";
  context.font = "16px 'VideoGame'";

  xpos = centerX - (16 * 11) / 2;
  context.fillText("TAP TO QUIT", xpos, 60);

  context.fillStyle = "rgba(200, 200, 200, .7)";
  xpos = centerX + 10;
  context.font = "24px 'VideoGame'";

  context.fillText(caught, xpos, centerY - 74);
  context.fillText(missed, xpos, centerY - 24);

  if (difficulty > 0) {
    if (countdown <= 10) {
      context.fillStyle = "rgba(255, 255, 0, .7)";
    }
    context.fillText(countdown, xpos, centerY + 26);
  }

  if (items.length == 1 && countdown <= 0) {
      // all items are gone... game over!
      playing = false;
      score = caught * 5 - missed * 2;
      if (score > highscore) {
        localStorage.setItem("highscore", score);
        highscore = score;
      }

      var outstr = "FINAL SCORE " + score;

      context.font = "18px 'VideoGame'";
      xpos = centerX - (18 * outstr.length) / 2;
      context.fillStyle = "rgba(255, 255, 0, 1)";
      context.fillText(outstr, xpos, centerY + 80);

      outstr = "(" + caught + " x 5) - (" + missed + " x 2)";
      context.font = "16px 'VideoGame'";
      xpos = centerX - (16 * outstr.length) / 2;
      context.fillStyle = "rgba(0, 255, 255, 1)";
      context.fillText(outstr, xpos, centerY + 105);


  } else {
      drawItems(animate_counter);
  }

  if (playing == true) {
    window.requestAnimationFrame(animate);
  }
/*
  var item;

  for (i = 1; i < 10; i++) {
    item = getItemAndPath();

    context.beginPath();
    context.strokeStyle = "#EEEEEE";

    if (item.type == "LINE") {
      context.moveTo(item.x1, 0);
      context.lineTo(item.x2, 360);
    } else {
      context.arc(item.origin, centerY, item.radius, item.start, item.end, false);
    }

    context.stroke();
  }
*/
/* drawing points on a line code

 function  drawScreen () {


      context.fillStyle = '#EEEEEE';
      context.fillRect(0, 0, theCanvas.width, theCanvas.height);
      //Box
      context.strokeStyle = '#000000';
      context.strokeRect(1,  1, theCanvas.width-2, theCanvas.height-2);

      // Create ball

      if (moves > 0 ) {
         moves--;
         ball.x += xunits;
         ball.y += yunits;
      }

      //Draw points to illustrate path

      points.push({x:ball.x,y:ball.y});

      for (var i = 0; i< points.length; i++) {
         context.drawImage(pointImage, points[i].x, points[i].y,1,1);

      }

      context.fillStyle = "#000000";
      context.beginPath();
      context.arc(ball.x,ball.y,15,0,Math.PI*2,true);
      context.closePath();
      context.fill();

   }
   var speed = 5;
   var p1 = {x:20,y:250};
   var p2 = {x:480,y:250};
   var dx = p2.x - p1.x;
   var dy = p2.y - p1.y;
   var distance = Math.sqrt(dx*dx + dy*dy);
   var moves = distance/speed;
   var xunits = (p2.x - p1.x)/moves;
   var yunits = (p2.y - p1.y)/moves;
   var ball = {x:p1.x, y:p1.y};
   var points = new Array();


*/

/*
  // angled lines
  for (i = 1; i < 50; i++) {
    context.beginPath();
    context.strokeStyle = "#EEEEEE";
    context.moveTo(getRandomInRange(40, 320), 0);
    context.lineTo(getRandomInRange(40, 320), 360);
    context.stroke();
  }
*/

/*
  // big curve
  for (i = -60; i < deviceWidth - 200; i+=10) {
    context.beginPath();
    context.strokeStyle = "#EEEEEE";
    context.lineWidth = 2;
    context.arc(i, centerY, 180, -1.4, 1.4, false);
    context.stroke();
  }

  for (i = 200; i < deviceWidth + 100; i+=10) {
    context.beginPath();
    context.strokeStyle = "#EEEEEE";
    context.lineWidth = 2;
    context.arc(i, centerY, 180, 1.8, 4.45, false);
    context.stroke();
  }

  // small curves
  for (i = -230; i < 20; i+=10) {

    context.beginPath();
    context.strokeStyle = "#EEEEEE";
    context.lineWidth = 2;
    context.arc(i, centerY, 320, -0.56, 0.56, false);
    context.stroke();
}

  for (i = deviceWidth; i < deviceWidth + 250; i+=10) {
    context.beginPath();
    context.strokeStyle = "#EEEEEE";
    context.lineWidth = 2;
    context.arc(i, centerY, 320, 2.55, 3.75, false);
    context.stroke();
  }

*/



/*
  draw arc and truck
  context.beginPath();
  context.strokeStyle = "#FF0000";
  context.lineWidth = 2;
  context.arc(items[0].cx, items[0].cy, items[0].radius, items[0].min_angle, items[0].max_angle, false);
  context.stroke();

  drawItems();
*/
}

function drawItemAtPoint(item) {

    context.save();
    context.textBaseline = "middle";
    context.textAlign = "center";

    if (item.type == "T") {
        // truck

        if (item.flip == true) {
            context.translate(item.x, item.y);
            context.scale(-1, 1);
            context.fillStyle = "rgba(" + item.color + "," + item.alpha + ")";
            context.font = item.size + "px 'Material Icons'";
            context.fillText(item.char, 0, 0);
        } else {
            context.fillStyle = "rgba(" + item.color + "," + item.alpha + ")";
            context.font = item.size + "px 'Material Icons'";
            context.fillText(item.char, item.x, item.y);
        }


    } else {
        context.translate(item.x, item.y);

        if (difficulty > 1) {
          context.rotate(item.rotation);
        }

        context.fillStyle = "rgba(" + item.color + "," + item.alpha + ")";
        context.font = item.size + "px 'Material Icons'";
        context.fillText(item.char, 0, 0);
    }


    context.restore();

}

function moveItemOnArc(item, speed) {
    item.angle += item.direction * (Math.acos(1 - Math.pow(speed / item.radius, 2) /2));
    var outofbounds = false;

    if (item.angle <= item.min_angle) {
      item.angle = item.min_angle;
      outofbounds = true;
    } else if (item.angle >= item.max_angle) {
      item.angle = item.max_angle;
      outofbounds = true;
    }

  if (outofbounds == true && item.type != "T") {
    item.outofbounds = true;
    }

    item.x = item.cx + item.radius * Math.cos(item.angle);
    item.y = item.cy + item.radius * Math.sin(item.angle);

    return item;
}

function drawItems(animate_counter) {

    var add_new = false;
//debugger;
    items.forEach(function(item, idx) {

      if (idx == 0) {
        item = moveItemOnArc(item, truck_speeds[item.speed], idx);
        } else {

            if (animate_counter == 0) {
                item.rotation += item.rotation_rate;
            }

        switch (item.path_type) {
          case "LINE":
            if (item.moves > 0) {
              item.moves--;
              item.x += item.xunits;
              item.y += item.yunits;
              drawItemAtPoint(item);
            } else {
                item.outofbounds = true;
            }

            break;

          case "ARC":
            item = moveItemOnArc(item, speeds[item.speed], idx);
            break;
        }

        if (item.outofbounds === false) {
            // check all non-truck items for collision
            var a = items[0].x - item.x;
            var b = items[0].y - item.y;
            var distance = Math.sqrt(a * a + b * b);

            if (distance < items[0].size / 2) {
                // collision
                item.char = plus_one; // plus 2
                item.color = "0,255,0";
            }

        } else {
            if (item.char == plus_one) {
              caught++;
            } else {
              missed++;
              navigator.vibrate(250);
            }
//            debugger;
            items.splice(idx, 1);
            add_new = true;
        }


      }

      if (add_new === false) {
        // stop drawing them once they go out of bounds
        drawItemAtPoint(item);
      }

      /*
      context.save();
      context.textBaseline = "middle";
      context.textAlign = "center";

      if (item.flip == true) {
          context.translate(item.x, item.y);
          context.scale(-1, 1);
          context.fillStyle = "rgba(" + item.color + "," + item.alpha + ")";
          context.font = item.size + "px 'Material Icons'";
          context.fillText(item.char, 0, 0);
      } else {
          context.save();
          context.fillStyle = "rgba(" + item.color + "," + item.alpha + ")";
          context.font = item.size + "px 'Material Icons'";
          context.fillText(item.char, item.x, item.y);
          context.restore();
      }

      context.restore();
*/
//      console.log("DRAWING", item);
    });

    if (add_new == true && countdown > 0) {
        getItemAndPath();

        if (difficulty > 1) {
            getItemAndPath();
        }

    }
}

function getItemAndPath() {

  if (items.length > 2 || countdown <= 0) {
    // account for the truck as position 0
    return;
  }

  thrown++;

  difficulty = Math.floor(thrown /  5);
  if (difficulty > 6) {
    difficulty = 6;
  }

//  console.log("difficulty is", difficulty);

  var ptype = getRandomInRange(0, (difficulty > 3) ? 3 : difficulty);
  var dir = getRandomInRange(0, 1);
  var speed = getRandomInRange(0, (difficulty > 3) ? 2 : difficulty);

  // for line calculations
  var x1;
  var x2;
  var y1 = 0;
  var y2 = deviceHeight;
  var distance;
  var dx;
  var dy = y2 - y1;

  var item = {
      type: "I",  // random item
      char: available_items[getRandomInRange(0, available_count)],
      color: "255,255,255",
      alpha: 1,
      size: 48,
      angle: 0,
      flip: false,
      direction: 1,
      speed: speed,
      rotation: 0,
      rotation_rate: Math.PI * 2 / getRandomInRange(4, 32),
      x: 0,
      y: 0,
      cx: centerX,
      cy: centerY,
      outofbounds: false,
      radius: 240
    };

  switch (path_types[ptype]) {
    case "VLINE":
      x1 = getRandomInRange(40, 320);
      x2 = x1; // we just want vertical
      dx = x2 - x1;
      distance = Math.sqrt(dx * dx + dy * dy);

      item.path_type = "LINE";
      item.moves = distance / speeds[speed];
      item.xunits = (x2 - x1) / item.moves;
      item.yunits = (y2 - y1) / item.moves;
      item.x = x1;
      item.y = y1;
      break;

    case "LINE":
      x1 = getRandomInRange(40, 320);
      x2 = getRandomInRange(40, 320);
      dx = x2 - x1;
      distance = Math.sqrt(dx * dx + dy * dy);

      item.path_type = "LINE";
      item.moves = distance / speeds[speed];
      item.xunits = (x2 - x1) / item.moves;
      item.yunits = (y2 - y1) / item.moves;
      item.x = x1;
      item.y = y1;
      break;

    case "ARC":
      item.path_type = "ARC";
      if (dir == 0) {
        item.cx = getRandomInRange(-230, 20);
        item.radius = 320;
        item.min_angle = -0.56;
        item.max_angle = 0.56;
      } else {
        item.cx = getRandomInRange(deviceWidth, deviceWidth + 250);
        item.radius = 320;
        item.min_angle = 2.55;
        item.max_angle = 3.75;
        item.direction = -1;
      }

      item.angle = item.min_angle;
      break;

    case "ARC-L":
      // more curved arc
      item.path_type = "ARC";
      if (dir == 0) {
        item.cx = getRandomInRange(-60, deviceWidth - 200);
        item.radius = 180;
        item.min_angle = -1.4;
        item.max_angle = 1.4;
      } else {
        item.cx = getRandomInRange(200, deviceWidth + 100);
        item.radius = 180;
        item.min_angle = 1.8;
        item.max_angle = 4.45;
        item.direction = -1;
      }

      item.angle = item.min_angle;
      break;
  }

//  console.log("added a new item", item);
  items.push(item);
}

function startClicked() {
    var holder = document.getElementById('holder');
    holder.removeEventListener("click", startClicked);

    intro.innerHTML = "";
    setElementSize(intro, 0, 0);
    setElementPos(intro, 0, 0);

    canvas.width = deviceWidth;
    canvas.height = deviceHeight;
    navigator.vibrate(1000);

    setElementPos(canvas, 0, 0);
    var item = {
      path_type: "CHAR",
      type: "T",  // truck
      char: truck,
      color: "255,255,255",
      alpha: 1,
      size: 64,
      angle: 1.57,
      flip: false,
      max_angle: 2.3,
      min_angle: .84,
      direction: 1,
      speed: 0,
      x: 0,
      y: 0,
      cx: centerX,
      cy: 90,
      radius: 240
    };

    item.x = item.cx + item.radius * Math.cos(item.angle);
    item.y = item.cy + item.radius * Math.sin(item.angle);
    console.log("truck", item);

    items = [item];
    score = 0;
    missed = 0;
    thrown = 0;
    countdown = game_length;
    caught = 0;
    second_counter = 0;
    difficulty = 0;
    lastTime = null;
    playing = true;
    getItemAndPath();
//    debugger;
    animate();
    canvas.addEventListener('click', showIntro, false);
}

function showIntro() {

    playing = false;
    howtoplay.removeEventListener("click", showIntro);
    setElementSize(howtoplay, 0, 0);
    setElementPos(howtoplay, 0, 0);
    howtoplay.innerHTML = "";

    canvas.removeEventListener('click', showIntro);
    canvas.width = 0;
    canvas.height = 0;

    var trucktext = '<i class="material-icons" style="color: rgb(~c~)">&#xE558;</i> ';


    var html = "<div id='holder'><div class='title'>Cargo Catch</div><div>"
             + trucktext.replace("~c~", safe_colors[1])
             + trucktext.replace("~c~", safe_colors[2])
             + trucktext.replace("~c~", safe_colors[3])
             + trucktext.replace("~c~", safe_colors[0])
             + "</div><div style='margin: 15px 0px;' class='start'><u>START</u></div></div>"
             + "<div id='high-score'>HI-SCORE " + highscore + "</div>"
             + "<div style='margin: 15px 0px; font-size: 13px' id='play'><u>how to play</u>"
             + "<div style='font-size: 8px; margin-top: 25px;'>&copy; Copyright 2016</div></div>";

    clearCanvasRegion(0, 0, canvas.width, canvas.height);

    intro.innerHTML = html;
    intro.style.opacity = 1;
    setElementSize(intro, deviceWidth, deviceHeight * 0.8);
    setElementPos(intro, deviceHeight * 0.20, 0);

    var holder = document.getElementById('holder');
    holder.addEventListener("click", startClicked, false);

    var play = document.getElementById('play');
    play.addEventListener("click", howToPlay, false);
}

function howToPlay() {
    var holder = document.getElementById('holder');
    holder.removeEventListener("click", startClicked);

    intro.innerHTML = "";
    setElementSize(intro, 0, 0);
    setElementPos(intro, 0, 0);

    setElementSize(howtoplay, deviceWidth * .75, deviceHeight * 2);
    setElementPos(howtoplay, deviceHeight * 0.2, 0);

    var html = "<div style='width: 100%; text-align: center; font-weight: bold; color: #FFFF00;'>You just got a job at a crazy moving company.<br />"
            + "They throw things out of the building and expect you to catch them.<br />"
            + "<span style='color: #00FF00;'>Use the bezel to move your truck and catch items before they hit the ground. 5 points for every catch, -2 points for every miss.</span></div>"
            + "<div style='margin: 15px auto; font-size: 32px; font-weight: bold; width: 100%; text-align: center' class='start'><u>GOT IT</u></div>";

    howtoplay.innerHTML = html;
    howtoplay.addEventListener("click", showIntro, false);
}

function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max -min + 1) + min);
}

function getColor() {
    return safe_colors[Math.floor(Math.random() * safe_colors.length)];
}

function clearCanvasRegion(top, left, w, h) {
    context.clearRect(top, left, w, h);
}

function setElementSize(ele, w, h) {
    ele.style.width = Math.floor(w) + "px";
    ele.style.height = Math.floor(h) + "px";
}

function setElementPos(ele, top, left) {
    ele.style.top = Math.floor(top) + "px";
    ele.style.left = Math.floor(left) + "px";
}
