export default class Section{
    width = 0;
    coords = {};
    type = '';
    parent = {};
    isDrawed = false;
    constructor(parent, type) {
        this.parent = parent;
        this.width = parent.width / 2;
        this.type = type;

        this.recount();
    }

    draw = () => {
        /*this.figure.rect(this.coords.x, this.coords.y, this.width, this.width);
        ctx.fillStyle = 'orange';
        ctx.fill(this.figure)*/

        ctx.beginPath();

        ctx.fillStyle = 'orange';
        ctx.fillRect(this.coords.x, this.coords.y, this.width, this.width);
        this.isDrawed = true;

        ctx.closePath();

        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.fillRect(this.coords.x + this.width / 2, this.coords.y + this.width / 2, 2, 2);
        ctx.closePath()
    }

    hover = () => {
        ctx.beginPath();

        ctx.fillStyle = 'purple';
        ctx.fillRect(this.coords.x, this.coords.y, this.width, this.width);
        this.isDrawed = true;

        ctx.closePath();
    }

    recount = () => {
        switch (this.type) {
            case 'top':
                this.coords = {
                    x: this.parent.coords.x + this.width / 2,
                    y: this.parent.coords.y - this.width,
                }
                break;
            case 'right':
                this.coords = {
                    x: this.parent.coords.x + this.parent.width,
                    y: this.parent.coords.y + this.width / 2,
                }
                break;
            case 'bot':
                this.coords = {
                    x: this.parent.coords.x + this.width / 2,
                    y: this.parent.coords.y + this.parent.width,
                }
                break;
            case 'left':
                this.coords = {
                    x: this.parent.coords.x - this.width,
                    y: this.parent.coords.y + this.width / 2,
                }
                break;
        }
    }

    move = (x, y) => {
        this.coords = {
            x: x,
            y: y
        }
    }

    check = (x, y) => {
        let result = false;
        if (
            x >= this.coords.x &&
            x <= this.coords.x + this.width &&
            y >= this.coords.y &&
            y <= this.coords.y + this.width
        )
            result = this;

        return result;
    }
}

