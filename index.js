// ==UserScript==
// @name         Zombia.io Mobile Controls (w/ joysticks)
// @namespace    http://tampermonkey.net/
// @version      2024-03-30
// @description  -
// @author       rdm
// @match        http://zombia.io
// @icon         http://zombia.io/favicon.ico
// @grant        none
// @run-at       document-start
// @require      https://raw.githubusercontent.com/bobboteck/JoyStick/master/joy.min.js
// ==/UserScript==

function main(game) {

    const css = `
    #hud-movement-joy {
        position: fixed;
        left: 10vw;
        bottom: 5vh;
        opacity: 0.5;
    }
    #hud-yaw-joy {
        position: fixed;
        right: 10vw;
        bottom: 5vh;
        opacity: 0.5;
    }
    #hud-bottom > div.hud-resources {
        width: 120px;
    }
    #hud-bottom > div.hud-day-night-ticker {
        bottom: 140px;
        right: -190px;
    }
    #hud-bottom > div.hud-party-member-indicator {
        display: none;
    }
    .hud-resources .hud-resources-wood::before {
        content: "W";
    }
    .hud-resources .hud-resources-stone::before {
        content: "S";
    }
    .hud-resources .hud-resources-gold::before {
        content: "G";
    }
    .hud-resources .hud-resources-tokens::before {
        content: "T";
    }
    `;

    const styles = document.createElement("style");
    styles.type = "text/css";
    styles.appendChild(document.createTextNode(css));
    document.head.appendChild(styles);

    function getClass(DOMClass) {
        return document.getElementsByClassName(DOMClass);
    };

    function getId(DOMId) {
        return document.getElementById(DOMId);
    };

    getId("hud-bottom").insertAdjacentHTML("afterbegin", `
        <div id="hud-movement-joy" style="width: 200px;height: 200px;"></div>
        <div id="hud-yaw-joy" style="width: 200px;height: 200px;"></div>
    `);

    function predictDirection(d) {
        let direction = "";
        switch(d) {
            case "N":
                direction = "up";
                break;
            case "S":
                direction = "down";
                break;
            case "W":
                direction = "left";
                break;
            case "E":
                direction = "right";
                break;
        };
        return direction;
    };

    function handleInput({cardinalDirection: d}) {
        const input = {left: 0, right: 0, up: 0, down: 0};
        if (d != "C") {
            input[predictDirection(d[0])] = 1;
            d[1] && (input[predictDirection(d[1])] = 1);
        };
        game.network.sendInput(input);
    };

    const movementJoy = new JoyStick('hud-movement-joy', {
        internalFillColor: "#111",
        internalStrokeColor: "#000",
        externalStrokeColor: "#000"
    }, handleInput);

    function angleTo(_0x632631, _0x1e0428) {
        return (0xb4 * Math.atan2(_0x1e0428.y - _0x632631.y, _0x1e0428.x - _0x632631.x) / Math.PI + 0x5a + 360) % 360;
    }

    function toYaw(_0x18f78a, _0x5d5b9e, width, height) {
        return Math.round(angleTo({
            'x': width / 2,
            'y': height / 2
        }, {
            'x': _0x18f78a,
            'y': _0x5d5b9e
        })) % 360;
    };

    function handleYaw(stickData) {
        const {xPosition: x, yPosition: y, cardinalDirection: d} = stickData;
        const yaw = toYaw(x, y, 200, 200);
        const _this = game.network.inputPacketManager;
        if (d != "C") {
            _this.lastSentYaw = yaw;
            _this.sendInputPacket({
                mouseMoved: yaw,
                mouseDown: true,
            });
        } else {
            _this.sendInputPacket({
                mouseMoved: _this.lastSentYaw,
                mouseDown: false,
            });
        };
        console.log(stickData);
    };

    const yawJoy = new JoyStick('hud-yaw-joy', {
        internalFillColor: "#111",
        internalStrokeColor: "#000",
        externalStrokeColor: "#000",
        title: "joystick2",
    }, handleYaw);
};

if (window.game) main(window.game);
else {
    Object.defineProperty(Object.prototype, "ui", {
        get() {
            if (!window.game) main(window.game = this);
            return this._ui;
        },
        set(val) { this._ui = val; },
        configurable: true
    });
};
