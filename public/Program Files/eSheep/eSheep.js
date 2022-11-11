window.Sheep = class eSheep {
  constructor(options, isChild) {
    this.userOptions = options || {};

    this.id = Date.now() + Math.random();

    this.DOMdiv = document.createElement("div"); // Div added to webpage, containing the sheep
    this.DOMdiv.setAttribute("id", this.id);
    this.DOMimg = document.createElement("img"); // Tile image, will be positioned inside the div

    this.parser = new DOMParser(); // XML parser
    this.xmlDoc = null; // parsed XML Document
    this.prepareToDie = false; // when removed, animations should be stopped

    this.isChild = isChild != undefined; // Child will be removed once they reached the end

    this.tilesX = 1; // Quantity of images inside Tile
    this.tilesY = 1; // Quantity of images inside Tile
    this.imageW = 1; // Width of the sprite image
    this.imageH = 1; // Height of the sprite image
    this.imageX = 1; // Position of sprite inside webpage
    this.imageY = 1; // Position of sprite inside webpage
    this.flipped = false; // if sprite is flipped
    this.dragging = false; // if user is dragging the sheep
    this.infobox = false; // if infobox is visible
    this.animationId = 0; // current animation ID
    this.animationStep = 0; // current animation step
    this.animationNode = null; // current animation DOM node
    this.sprite = new Image(); // sprite image (Tiles)
    this.HTMLelement = null; // the HTML element where the pet is walking on
    this.randS = Math.random() * 100; // random value, will change when page is reloaded

    this.screenW =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth; // window width

    this.screenH =
      window.innerHeight ||
      document.documentElement.clientHeight ||
      document.body.clientHeight; // window height
  }

  Start(animation) {
    if (typeof animation !== "undefined" && animation != undefined) {
      const ajax = new XMLHttpRequest();
      const sheepClass = this;

      ajax.open("GET", animation, true);
      ajax.addEventListener("readystatechange", function () {
        if (this.readyState == 4) {
          if (this.status == 200)
            // successfully loaded XML, parse it and create first esheep.
            sheepClass._parseXML(this.responseText);
          else
            console.error(
              `XML not available: ${this.statusText}\n${this.responseText}`
            );
        }
      });
      ajax.send(null);
    }
  }

  remove() {
    this.prepareToDie = true;
    setTimeout(() => {
      this.DOMdiv = this.DOMimg = null;
      document.getElementById(this.id).outerHTML = "";
    }, 500);
  }

  /*
   * Parse loaded XML, contains spawn, animations and childs
   */
  _parseXML(text) {
    this.xmlDoc = this.parser.parseFromString(text, "text/xml");
    const image = this.xmlDoc.querySelectorAll("image")[0];
    this.tilesX = image.querySelectorAll("tilesx")[0].textContent;
    this.tilesY = image.querySelectorAll("tilesy")[0].textContent;
    // Event listener: Sprite was loaded =>
    //   play animation only when the sprite is loaded
    this.sprite.addEventListener("load", () => {
      let attribute =
        `width:${this.sprite.width}px;` +
        `height:${this.sprite.height}px;` +
        `position:absolute;` +
        `top:0px;` +
        `left:0px;` +
        `max-width: none;`;
      this.DOMimg.setAttribute("style", attribute);
      // prevent to move image (will show the entire sprite sheet if not catched)
      this.DOMimg.addEventListener("dragstart", (e) => {
        e.preventDefault();
        return false;
      });
      this.imageW = this.sprite.width / this.tilesX;
      this.imageH = this.sprite.height / this.tilesY;
      attribute =
        `width:${this.imageW}px;` +
        `height:${this.imageH}px;` +
        `position:fixed;` +
        `top:${this.imageY}px;` +
        `left:${this.imageX}px;` +
        `transform:rotatey(0deg);` +
        `cursor:move;` +
        `z-index:2000;` +
        `overflow:hidden;` +
        `image-rendering: crisp-edges;`;
      this.DOMdiv.setAttribute("style", attribute);
      this.DOMdiv.appendChild(this.DOMimg);

      if (this.isChild) this._spawnChild();
      else this._spawnESheep();
    });

    this.sprite.src = `data:image/png;base64,${
      image.querySelectorAll("png")[0].textContent
    }`;
    this.DOMimg.setAttribute("src", this.sprite.src);

    // Mouse move over eSheep, check if eSheep should be moved over the screen
    this.DOMdiv.addEventListener("mousemove", (e) => {
      if (!this.dragging && e.buttons == 1 && e.button == 0) {
        this.dragging = true;
        this.HTMLelement = null;
        const childsRoot = this.xmlDoc.querySelectorAll("animations")[0];
        const childs = childsRoot.querySelectorAll("animation");
        for (const child of childs) {
          if (child.querySelectorAll("name")[0].textContent == "drag") {
            this.animationId = child.getAttribute("id");
            this.animationStep = 0;
            this.animationNode = child;
            break;
          }
        }
      }
    });
    // Add event listener to body, if mouse moved too fast over the dragging eSheep
    document.body.addEventListener("mousemove", (e) => {
      if (this.dragging) {
        this.imageX = Number.parseInt(e.clientX) - this.imageW / 2;
        this.imageY = Number.parseInt(e.clientY) - this.imageH / 2;

        this.DOMdiv.style.left = `${this.imageX}px`;
        this.DOMdiv.style.top = `${this.imageY}px`;
      }
    });
    // Window resized, recalculate eSheep bounds
    document.body.addEventListener("resize", () => {
      this.screenW =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;

      this.screenH =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;

      if (this.imageY + this.imageH > this.screenH) {
        this.imageY = this.screenH - this.imageH;
        this.DOMdiv.style.top = `${this.imageY}px`;
      }
      if (this.imageX + this.imageW > this.screenW) {
        this.imageX = this.screenW - this.imageW;
        this.DOMdiv.style.left = `${this.imageX}px`;
      }
    });
    // Don't allow contextmenu over the sheep
    this.DOMdiv.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      return false;
    });
    // Mouse released
    this.DOMdiv.addEventListener("mouseup", (e) => {
      if (this.dragging) {
        this.dragging = false;
      }
    });
    // Add sheep element to the body, unless override is provided
    (this.userOptions.spawnContainer || document.body).appendChild(this.DOMdiv);
  }

  /*
   * Set new position for the pet
   * If absolute is true, the x and y coordinates are used as absolute values.
   * If false, x and y are added to the current position
   */
  _setPosition(x, y, absolute) {
    if (this.DOMdiv) {
      if (absolute) {
        this.imageX = Number.parseInt(x);
        this.imageY = Number.parseInt(y);
      } else {
        this.imageX = Number.parseInt(this.imageX) + Number.parseInt(x);
        this.imageY = Number.parseInt(this.imageY) + Number.parseInt(y);
      }
      this.DOMdiv.style.left = `${this.imageX}px`;
      this.DOMdiv.style.top = `${this.imageY}px`;
    }
  }

  /*
   * Spawn new esheep, this is called if the XML was loaded successfully
   */
  _spawnESheep() {
    const spawnsRoot = this.xmlDoc.querySelectorAll("spawns")[0];
    const spawns = spawnsRoot.querySelectorAll("spawn");
    let prob = 0;
    for (var i = 0; i < spawns.length; i++)
      prob += Number.parseInt(spawns[0].getAttribute("probability"));
    const rand = Math.random() * prob;
    prob = 0;
    for (i = 0; i < spawns.length; i++) {
      prob += Number.parseInt(spawns[i].getAttribute("probability"));
      if (prob >= rand || i == spawns.length - 1) {
        this._setPosition(
          this._parseKeyWords(spawns[i].querySelectorAll("x")[0].textContent),
          this._parseKeyWords(spawns[i].querySelectorAll("y")[0].textContent),
          true
        );
        this.animationId = spawns[i].querySelectorAll("next")[0].textContent;
        this.animationStep = 0;
        var childsRoot = this.xmlDoc.querySelectorAll("animations")[0];
        var childs = childsRoot.querySelectorAll("animation");
        for (let k = 0; k < childs.length; k++) {
          if (childs[k].getAttribute("id") == this.animationId) {
            this.animationNode = childs[k];

            // Check if child should be loaded toghether with this animation
            var childsRoot = this.xmlDoc.querySelectorAll("childs")[0];
            var childs = childsRoot.querySelectorAll("child");
            for (const child of childs) {
              if (child.getAttribute("animationid") == this.animationId) {
                const eSheepChild = new eSheep(null, true);
                eSheepChild.animationId =
                  child.querySelectorAll("next")[0].textContent;
                const x = child.querySelectorAll("x")[0].textContent;
                const y = child.querySelectorAll("y")[0].textContent;
                eSheepChild._setPosition(
                  this._parseKeyWords(x),
                  this._parseKeyWords(y),
                  true
                );
                // Start animation
                eSheepChild.Start(this.animationFile);
                break;
              }
            }
            break;
          }
        }
        break;
      }
    }
    // Play next step
    this._nextESheepStep();
  }

  /*
   * Like spawnESheep, but for Childs
   */
  _spawnChild() {
    const childsRoot = this.xmlDoc.querySelectorAll("animations")[0];
    const childs = childsRoot.querySelectorAll("animation");
    for (const child of childs) {
      if (child.getAttribute("id") == this.animationId) {
        this.animationNode = child;
        break;
      }
    }
    this._nextESheepStep();
  }

  // Parse the human readable expression from XML to a computer readable expression
  _parseKeyWords(value) {
    value = value.replace(/screenW/g, this.screenW);
    value = value.replace(/screenH/g, this.screenH);
    value = value.replace(/areaW/g, this.screenH);
    value = value.replace(/areaH/g, this.screenH);
    value = value.replace(/imageW/g, this.imageW);
    value = value.replace(/imageH/g, this.imageH);
    value = value.replace(/random/g, Math.random() * 100);
    value = value.replace(/randS/g, this.randS);
    value = value.replace(/imageX/g, this.imageX);
    value = value.replace(/imageY/g, this.imageY);

    let ret = 0;
    try {
      ret = eval(value);
    } catch (error) {
      console.error(
        `Unable to parse this position: \n'${value}'\n Error message: \n${error.message}`
      );
    }
    return ret;
  }

  /*
   * Once the animation is over, get the next animation to play
   */
  _getNextRandomNode(parentNode) {
    const baseNode = parentNode.querySelectorAll("next");
    var childsRoot = this.xmlDoc.querySelectorAll("animations")[0];
    var childs = childsRoot.querySelectorAll("animation");
    let prob = 0;
    let nodeFound = false;

    // no more animations (it was the last one)
    if (baseNode.length === 0) {
      // If it is a child, remove the child from document
      if (this.isChild) {
        // remove child
        this.DOMdiv.remove();
        delete this;
      }
      // else, spawn sheep again
      else {
        this._spawnESheep();
      }
      return false;
    }

    for (var k = 0; k < baseNode.length; k++) {
      prob += Number.parseInt(baseNode[k].getAttribute("probability"));
    }
    const rand = Math.random() * prob;
    let index = 0;
    prob = 0;
    for (k = 0; k < baseNode.length; k++) {
      prob += Number.parseInt(baseNode[k].getAttribute("probability"));
      if (prob >= rand) {
        index = k;
        break;
      }
    }
    for (k = 0; k < childs.length; k++) {
      if (childs[k].getAttribute("id") == baseNode[index].textContent) {
        this.animationId = childs[k].getAttribute("id");
        this.animationStep = 0;
        this.animationNode = childs[k];
        nodeFound = true;
        break;
      }
    }

    if (nodeFound) {
      // create Child, if present
      var childsRoot = this.xmlDoc.querySelectorAll("childs")[0];
      var childs = childsRoot.querySelectorAll("child");
      for (k = 0; k < childs.length; k++) {
        if (childs[k].getAttribute("animationid") == this.animationId) {
          const eSheepChild = new eSheep(null, true);
          eSheepChild.animationId =
            childs[k].querySelectorAll("next")[0].textContent;
          const x = childs[k].querySelectorAll("x")[0].textContent; //
          const y = childs[k].querySelectorAll("y")[0].textContent;
          eSheepChild._setPosition(
            this._parseKeyWords(x),
            this._parseKeyWords(y),
            true
          );
          eSheepChild.Start(this.animationFile);
          break;
        }
      }
    }

    return nodeFound;
  }

  /*
   * Check if sheep is walking over a defined HTML TAG-element
   */
  _checkOverlapping() {
    const x = this.imageX;
    const y = this.imageY + this.imageH;
    let rect;
    let margin = 20;
    if (this.HTMLelement) margin = 5;
    for (const index in this.userOptions.collisionsWith) {
      const els = document.body.getElementsByTagName(
        this.userOptions.collisionsWith[index]
      );

      for (const el of els) {
        rect = el.getBoundingClientRect();
        if (
          y > rect.top - 2 &&
          y < rect.top + margin &&
          x > rect.left &&
          x < rect.right - this.imageW
        ) {
          const style = window.getComputedStyle(el);
          if (style.display != "none" && style.opacity != "0") {
            return el;
          }
        }
      }
    }
    return false;
  }

  /*
   * Try to get the value of a node (from the current animationNode), if it is not possible returns the defaultValue
   */
  _getNodeValue(nodeName, valueName, defaultValue) {
    if (
      !this.animationNode ||
      !this.animationNode.getElementsByTagName(nodeName)
    )
      return;
    if (
      this.animationNode
        .getElementsByTagName(nodeName)[0]
        .getElementsByTagName(valueName)[0]
    ) {
      const value = this.animationNode
        .getElementsByTagName(nodeName)[0]
        .getElementsByTagName(valueName)[0].textContent;

      return this._parseKeyWords(value);
    }
    return defaultValue;
  }

  /*
   * Next step (each frame is a step)
   */
  _nextESheepStep() {
    if (this.prepareToDie) return;

    let x1 = this._getNodeValue("start", "x", 0);
    const y1 = this._getNodeValue("start", "y", 0);
    const off1 = this._getNodeValue("start", "offsety", 0);
    const opa1 = this._getNodeValue("start", "opacity", 1);
    const del1 = this._getNodeValue("start", "interval", 1000);
    let x2 = this._getNodeValue("end", "x", 0);
    const y2 = this._getNodeValue("end", "y", 0);
    const off2 = this._getNodeValue("end", "offsety", 0);
    const opa2 = this._getNodeValue("end", "interval", 1);
    const del2 = this._getNodeValue("end", "interval", 1000);

    const repeat = this._parseKeyWords(
      this.animationNode.querySelectorAll("sequence")[0].getAttribute("repeat")
    );
    const repeatfrom = this.animationNode
      .querySelectorAll("sequence")[0]
      .getAttribute("repeatfrom");
    const gravity = this.animationNode.querySelectorAll("gravity");
    const border = this.animationNode.querySelectorAll("border");

    const steps =
      this.animationNode.querySelectorAll("frame").length +
      (this.animationNode.querySelectorAll("frame").length - repeatfrom) *
        repeat;

    let index;

    if (
      this.animationStep < this.animationNode.querySelectorAll("frame").length
    )
      index =
        this.animationNode.querySelectorAll("frame")[this.animationStep]
          .textContent;
    else if (repeatfrom == 0)
      index =
        this.animationNode.querySelectorAll("frame")[
          this.animationStep %
            this.animationNode.querySelectorAll("frame").length
        ].textContent;
    else
      index =
        this.animationNode.querySelectorAll("frame")[
          Number.parseInt(repeatfrom) +
            Number.parseInt(
              (this.animationStep - repeatfrom) %
                (this.animationNode.querySelectorAll("frame").length -
                  repeatfrom)
            )
        ].textContent;

    this.DOMimg.style.left = `${-this.imageW * (index % this.tilesX)}px`;
    this.DOMimg.style.top = `${
      -this.imageH * Number.parseInt(index / this.tilesX)
    }px`;

    if (this.dragging || this.infobox) {
      this.animationStep++;
      setTimeout(this._nextESheepStep.bind(this), 50);
      return;
    }

    if (this.flipped) {
      x1 = -x1;
      x2 = -x2;
    }

    if (this.animationStep == 0) this._setPosition(x1, y1, false);
    else
      this._setPosition(
        Number.parseInt(x1) +
          Number.parseInt(((x2 - x1) * this.animationStep) / steps),
        Number.parseInt(y1) +
          Number.parseInt(((y2 - y1) * this.animationStep) / steps),
        false
      );

    this.animationStep++;

    if (this.animationStep >= steps) {
      if (this.animationNode.querySelectorAll("action")[0]) {
        switch (this.animationNode.querySelectorAll("action")[0].textContent) {
          case "flip":
            if (this.DOMdiv.style.transform == "rotateY(0deg)") {
              this.DOMdiv.style.transform = "rotateY(180deg)";
              this.flipped = true;
            } else {
              this.DOMdiv.style.transform = "rotateY(0deg)";
              this.flipped = false;
            }
            break;
          default:
            break;
        }
      }
      if (
        !this._getNextRandomNode(
          this.animationNode.querySelectorAll("sequence")[0]
        )
      )
        return;
    }

    let setNext = false;

    if (border && border[0] && border[0].querySelectorAll("next")) {
      if (x2 < 0 && this.imageX < 0) {
        this.imageX = 0;
        setNext = true;
      } else if (x2 > 0 && this.imageX > this.screenW - this.imageW) {
        this.imageX = this.screenW - this.imageW;
        this.DOMdiv.style.left = `${Number.parseInt(this.imageX)}px`;
        setNext = true;
      } else if (y2 < 0 && this.imageY < 0) {
        this.imageY = 0;
        setNext = true;
      } else if (y2 > 0 && this.imageY > this.screenH - this.imageH) {
        this.imageY = this.screenH - this.imageH;
        setNext = true;
      } else if (y2 > 0) {
        if (this._checkOverlapping() && this.imageY > this.imageH) {
          this.HTMLelement = this._checkOverlapping();
          this.imageY =
            Math.ceil(this.HTMLelement.getBoundingClientRect().top) -
            this.imageH;
          setNext = true;
        }
      } else if (this.HTMLelement && !this._checkOverlapping()) {
        if (
          this.imageY + this.imageH >
            this.HTMLelement.getBoundingClientRect().top + 3 ||
          this.imageY + this.imageH <
            this.HTMLelement.getBoundingClientRect().top - 3
        ) {
          this.HTMLelement = null;
        } else if (
          this.imageX < this.HTMLelement.getBoundingClientRect().left
        ) {
          this.imageX = Number.parseInt(this.imageX + 3);
          setNext = true;
        } else {
          this.imageX = Number.parseInt(this.imageX - 3);
          setNext = true;
        }
        this.DOMdiv.style.left = `${Number.parseInt(this.imageX)}px`;
      }
      if (setNext && !this._getNextRandomNode(border[0])) return;
    }
    if (
      !setNext &&
      gravity &&
      gravity[0] &&
      gravity[0].querySelectorAll("next") &&
      this.imageY < this.screenH - this.imageH - 2
    ) {
      if (this.HTMLelement == undefined) {
        setNext = true;
      } else if (!this._checkOverlapping()) {
        setNext = true;
        this.HTMLelement = null;
      }

      if (setNext && !this._getNextRandomNode(gravity[0])) return;
    }
    if (
      !setNext &&
      ((this.imageX < -this.imageW && x2 < 0) ||
        (this.imageX > this.screenW && x2 > 0) ||
        (this.imageY < -this.imageH && y1 < 0) ||
        (this.imageY > this.screenH && y2 > 0))
    ) {
      setNext = true;
      if (!this.isChild) {
        this._spawnESheep();
      }
      return;
    }

    setTimeout(
      this._nextESheepStep.bind(this),
      Number.parseInt(del1) +
        Number.parseInt(((del2 - del1) * this.animationStep) / steps)
    );
  }
};
