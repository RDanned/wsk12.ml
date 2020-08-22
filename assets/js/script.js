$(document).ready(function(){
    let canvas = document.querySelector('#canvas');
    let ctx = canvas.getContext('2d');
    let selectedElement;
    let mouse = {
        x: 0,
        y: 0
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.fillStyle = "white";
    canvas.style.background = "grey";

    class Board{
        nodes = [];
        relations = [];
        figureWidth = 50;
        selectedNode = false;

        constructor() {
            //todo: Сделать проверку на присутствие связей
            this.relations = [];

            if(this.relations.length == 0){
                this.addFigure(canvas.width / 2 - this.figureWidth, canvas.height / 2 - this.figureWidth, this.figureWidth);
                this.draw();
            }
        }

        addFigure = (x, y, width = this.figureWidth) => {
            this.nodes.push(new Node(x, y, width));
        }

        draw = () => {
            this.nodes.map((node) => {
                node.draw();
            })
        }

        check = (x, y) => {
            let isSelected = false;

            this.nodes.map((node) => {
                console.log(node.check(x, y));
                if(node.check(x, y) !== false){
                    //this.selectedNode = node;
                    this.selectedNode = node.check(x, y);
                    isSelected = true;
                }

            })

            return isSelected;
        }

        clear = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

    }

    class Node{
        width = 0;
        relations = [];
        sections = [];
        coords = {};
        sides = [
            'top',
            'right',
            'bot',
            'left'
        ];
        selectedSection;
        figure;
        constructor(x, y, width) {
            this.coords = {
                x: x,
                y: y
            };
            this.width = width;
            this.figure = new Path2D();

            this.sides.forEach((side) => {
                this.sections.push(new Section(this, side));
            });
        }

        draw = () => {
            ctx.beginPath();

            ctx.fillStyle = 'red';
            ctx.strokeStyle = 'blue';
            ctx.fillRect(this.coords.x, this.coords.y, this.width, this.width);
            ctx.stroke();

            ctx.closePath();
        }

        drawSections = () => {
            this.sections.forEach((section) => {
                section.draw();
            });
        }

        move = (x, y) => {
            this.coords = {
                x: x - this.width / 2,
                y: y - this.width / 2
            }
            this.sections.forEach((section) => {
                section.move();
            });
        }

        check = (x, y) => {
            let result = false;
            if(
                x >= this.coords.x &&
                x <= this.coords.x + this.width &&
                y >= this.coords.y &&
                y <= this.coords.y + this.width
            )
                result = this;

            this.sections.forEach((section) => {
                if(section.check(x, y))
                    result = section.check(x, y);
            });

            return result;
            /*return x >= this.coords.x &&
                   x <= this.coords.x + this.width &&
                   y >= this.coords.y &&
                   y <= this.coords.y + this.width;*/
        }
    }

    class Section{
        figure;
        width = 0;
        coords = {};
        type = '';
        parent = {};
        constructor(parent, type) {
            this.parent = parent;
            this.width = parent.width / 2;
            this.figure = new Path2D();
            this.type = type;

            this.move();
        }

        draw = () => {
            /*this.figure.rect(this.coords.x, this.coords.y, this.width, this.width);
            ctx.fillStyle = 'orange';
            ctx.fill(this.figure)*/

            ctx.beginPath();

            ctx.fillStyle = 'orange';
            ctx.fillRect(this.coords.x, this.coords.y, this.width, this.width);

            ctx.closePath();
        }

        move = () => {
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

    /*let fig = new Node(100, 100, 50)
    fig.draw();

    let clear = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function mouseMove(e){
        clear()

        mouse.x = e.clientX;
        mouse.y = e.clientY;

        fig.move(mouse.x, mouse.y);
        fig.draw();
    }

    canvas.addEventListener('mousemove', mouseMove);*/

    let board = new Board();

    canvas.addEventListener('mousedown', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        //board.clear();
        if(board.check(mouse.x, mouse.y)){
            if(board.selectedNode.constructor.name == 'Section'){
                console.log('section');
                let x = board.selectedNode.coords.x;
                let y = board.selectedNode.coords.y;
                switch(board.selectedNode.type) {
                    case 'top':
                        board.addFigure(x, y - board.figureWidth * 2);
                        break;
                    case 'right':
                        board.addFigure(x + board.figureWidth * 2, y);
                        break;
                    case 'bot':
                        board.addFigure(x, y + board.figureWidth * 2);
                        break;
                    case 'left':
                        board.addFigure(x - board.figureWidth * 2, y);
                        break;
                }
                board.draw();
            } else if(e.shiftKey && board.check(mouse.x, mouse.y)){

            }
        }

    });

    canvas.addEventListener('mouseup', (e) => {
        board.selectedNode = false;
    });


    canvas.addEventListener('mousemove', (e) => {
        if(e.shiftKey && board.selectedNode){
            mouse.x = e.clientX;
            mouse.y = e.clientY;

            //board.clear();
            //board.check(mouse.x, mouse.y)
            board.clear();
            board.selectedNode.move(mouse.x, mouse.y);
            board.draw();
        }
    });

    canvas.addEventListener('dblclick', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        if(board.check(mouse.x, mouse.y)){
            board.selectedNode.drawSections();
            board.selectedNode = false;
        }
    });

});