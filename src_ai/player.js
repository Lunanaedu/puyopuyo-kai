
class Player {
  
  static initialize() {
    this.keyStatus = {
      right: false,
      left: false,
      up: false,
      down: false,
    };
  }
  static createNewPuyo() {
    if (Stage.board[0][2]) {
      return false;
    }
    const puyoColors = Math.max(1, Math.min(5, Config.puyoColors));
    this.centerPuyo = Math.floor(Math.random() * puyoColors) + 1;
    this.movablePuyo = Math.floor(Math.random() * puyoColors) + 1;

    this.centerPuyoElement = PuyoImage.getPuyo(this.centerPuyo);
    this.movablePuyoElement = PuyoImage.getPuyo(this.movablePuyo);
    Stage.stageElement.appendChild(this.centerPuyoElement);
    Stage.stageElement.appendChild(this.movablePuyoElement);

    this.puyoStatus = {
      x: 2, 
      y: -1, 
      left: 2 * Config.puyoImgWidth,
      top: -1 * Config.puyoImgHeight,
      dx: 0, 
      dy: -1,
      rotation: 90, 
    };
    this.groundFrame = 0;
    this.setPuyoPosition();
    /////// add
    let c1 = this.centerPuyo;
    let c2 = this.movablePuyo;
    this.action = create_action(Stage.board, [c1,c2]);
    ///////
    return true;
  }

  static setPuyoPosition() {
    this.centerPuyoElement.style.left = this.puyoStatus.left + "px";
    this.centerPuyoElement.style.top = this.puyoStatus.top + "px";
    const x =
      this.puyoStatus.left +
      Math.cos((this.puyoStatus.rotation * Math.PI) / 180) *
        Config.puyoImgWidth;
    const y =
      this.puyoStatus.top -
      Math.sin((this.puyoStatus.rotation * Math.PI) / 180) *
        Config.puyoImgHeight;
    this.movablePuyoElement.style.left = x + "px";
    this.movablePuyoElement.style.top = y + "px";
  }

  static falling(isDownPressed) {
    let isBlocked = false;
    let x = this.puyoStatus.x;
    let y = this.puyoStatus.y;
    let dx = this.puyoStatus.dx;
    let dy = this.puyoStatus.dy;
    if (
      y + 1 >= Config.stageRows ||
      Stage.board[y + 1][x] ||
      (y + dy + 1 >= 0 &&
        (y + dy + 1 >= Config.stageRows || Stage.board[y + dy + 1][x + dx]))
    ) {
      isBlocked = true;
    }
    if (!isBlocked) {
      this.puyoStatus.top += Config.playerFallingSpeed;
      if (isDownPressed) {
        this.puyoStatus.top += Config.playerDownSpeed;
      }
      if (Math.floor(this.puyoStatus.top / Config.puyoImgHeight) != y) {
        if (isDownPressed) {
          Score.addScore(1);
        }
        y += 1;
        this.puyoStatus.y = y;
        if (
          y + 1 >= Config.stageRows ||
          Stage.board[y + 1][x] ||
          (y + dy + 1 >= 0 &&
            (y + dy + 1 >= Config.stageRows || Stage.board[y + dy + 1][x + dx]))
        ) {
          isBlocked = true;
        }
        if (!isBlocked) {
          this.groundFrame = 0;
          return;
        } else {
          this.puyoStatus.top = y * Config.puyoImgHeight;
          this.groundFrame = 1;
          return;
        }
      } else {
        this.groundFrame = 0;
        return;
      }
    }
    if (this.groundFrame == 0) {
      this.groundFrame = 1;
      return;
    } else {
      this.groundFrame++;
      if (this.groundFrame > Config.playerGroundFrame) {
        return true;
      }
    }
  }
  static playing(frame) {
    //// add
    this.keyStatus = {
      right: false,
      left: false,
      up: false,
      down: false,
    };
    if(this.puyoStatus.rotation !== this.action[1]){
      this.keyStatus.up = true;
    }else if(this.puyoStatus.x < this.action[0]){
      this.keyStatus.right = true;
    }else if(this.puyoStatus.x > this.action[0]){
      this.keyStatus.left = true;
    }else{
      this.keyStatus.down = true;
    }
    ////  
    if (this.falling(this.keyStatus.down)) {
      this.setPuyoPosition();
      return "fix";
    }
    this.setPuyoPosition();
    if (this.keyStatus.right || this.keyStatus.left) {
      const cx = this.keyStatus.right ? 1 : -1;
      const x = this.puyoStatus.x;
      const y = this.puyoStatus.y;
      const mx = x + this.puyoStatus.dx;
      const my = y + this.puyoStatus.dy;
      let canMove = true;
      if (
        y < 0 ||
        x + cx < 0 ||
        x + cx >= Config.stageCols ||
        Stage.board[y][x + cx]
      ) {
        if (y >= 0) {
          canMove = false;
        }
      }
      if (
        my < 0 ||
        mx + cx < 0 ||
        mx + cx >= Config.stageCols ||
        Stage.board[my][mx + cx]
      ) {
        if (my >= 0) {
          canMove = false;
        }
      }
      if (this.groundFrame === 0) {
        if (
          y + 1 < 0 ||
          x + cx < 0 ||
          x + cx >= Config.stageCols ||
          Stage.board[y + 1][x + cx]
        ) {
          if (y + 1 >= 0) {
            canMove = false;
          }
        }
        if (
          my + 1 < 0 ||
          mx + cx < 0 ||
          mx + cx >= Config.stageCols ||
          Stage.board[my + 1][mx + cx]
        ) {
          if (my + 1 >= 0) {
            canMove = false;
          }
        }
      }

      if (canMove) {
        this.actionStartFrame = frame;
        this.moveSource = x * Config.puyoImgWidth;
        this.moveDestination = (x + cx) * Config.puyoImgWidth;
        this.puyoStatus.x += cx;
        return "moving";
      }
    } else if (this.keyStatus.up) {
      const x = this.puyoStatus.x;
      const y = this.puyoStatus.y;
      const mx = x + this.puyoStatus.dx;
      const my = y + this.puyoStatus.dy;
      const rotation = this.puyoStatus.rotation;
      let canRotate = true;

      let cx = 0;
      let cy = 0;
      if (rotation === 0) {
      } else if (rotation === 90) {
        if (
          y + 1 < 0 ||
          x - 1 < 0 ||
          x - 1 >= Config.stageCols ||
          Stage.board[y + 1][x - 1]
        ) {
          if (y + 1 >= 0) {
            cx = 1;
          }
        }
        if (cx === 1) {
          if (
            y + 1 < 0 ||
            x + 1 < 0 ||
            y + 1 >= Config.stageRows ||
            x + 1 >= Config.stageCols ||
            Stage.board[y + 1][x + 1]
          ) {
            if (y + 1 >= 0) {
              canRotate = false;
            }
          }
        }
      } else if (rotation === 180) {
        if (y + 2 < 0 || y + 2 >= Config.stageRows || Stage.board[y + 2][x]) {
          if (y + 2 >= 0) {
            cy = -1;
          }
        }
        if (
          y + 2 < 0 ||
          y + 2 >= Config.stageRows ||
          x - 1 < 0 ||
          Stage.board[y + 2][x - 1]
        ) {
          if (y + 2 >= 0) {
            cy = -1;
          }
        }
      } else if (rotation === 270) {
        if (
          y + 1 < 0 ||
          x + 1 < 0 ||
          x + 1 >= Config.stageCols ||
          Stage.board[y + 1][x + 1]
        ) {
          if (y + 1 >= 0) {
            cx = -1;
          }
        }
        if (cx === -1) {
          if (
            y + 1 < 0 ||
            x - 1 < 0 ||
            x - 1 >= Config.stageCols ||
            Stage.board[y + 1][x - 1]
          ) {
            if (y + 1 >= 0) {
              canRotate = false;
            }
          }
        }
      }

      if (canRotate) {
        if (cy === -1) {
          if (this.groundFrame > 0) {
            this.puyoStatus.y -= 1;
            this.groundFrame = 0;
          }
          this.puyoStatus.top = this.puyoStatus.y * Config.puyoImgHeight;
        }
        this.actionStartFrame = frame;
        this.rotateBeforeLeft = x * Config.puyoImgHeight;
        this.rotateAfterLeft = (x + cx) * Config.puyoImgHeight;
        this.rotateFromRotation = this.puyoStatus.rotation;
        this.puyoStatus.x += cx;
        const distRotation = (this.puyoStatus.rotation + 90) % 360;
        const dCombi = [
          [1, 0],
          [0, -1],
          [-1, 0],
          [0, 1],
        ][distRotation / 90];
        this.puyoStatus.dx = dCombi[0];
        this.puyoStatus.dy = dCombi[1];
        return "rotating";
      }
    }
    return "playing";
  }
  static moving(frame) {
    this.falling();
    const ratio = Math.min(
      1,
      (frame - this.actionStartFrame) / Config.playerMoveFrame
    );
    this.puyoStatus.left =
      ratio * (this.moveDestination - this.moveSource) + this.moveSource;
    this.setPuyoPosition();
    if (ratio === 1) {
      return false;
    }
    return true;
  }
  static rotating(frame) {
    this.falling();
    const ratio = Math.min(
      1,
      (frame - this.actionStartFrame) / Config.playerRotateFrame
    );
    this.puyoStatus.left =
      (this.rotateAfterLeft - this.rotateBeforeLeft) * ratio +
      this.rotateBeforeLeft;
    this.puyoStatus.rotation = this.rotateFromRotation + ratio * 90;
    this.setPuyoPosition();
    if (ratio === 1) {
      this.puyoStatus.rotation = (this.rotateFromRotation + 90) % 360;
      return false;
    }
    return true;
  }

  static fix() {
    const x = this.puyoStatus.x;
    const y = this.puyoStatus.y;
    const dx = this.puyoStatus.dx;
    const dy = this.puyoStatus.dy;
    if (y >= 0) {
      Stage.setPuyo(x, y, this.centerPuyo);
      Stage.puyoCount++;
    }
    if (y + dy >= 0) {
      Stage.setPuyo(x + dx, y + dy, this.movablePuyo);
      Stage.puyoCount++;
    }
    Stage.stageElement.removeChild(this.centerPuyoElement);
    Stage.stageElement.removeChild(this.movablePuyoElement);
    this.centerPuyoElement = null;
    this.movablePuyoElement = null;
  }

  static batankyu() {
    if (this.keyStatus.up) {
      location.reload();
    }
  }
}
