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
        isMouseDown = false;

        constructor() {
            //todo: Сделать проверку на присутствие связей
            this.relations = [];

            if(this.relations.length == 0){
                this.addNode(canvas.width / 2 - this.figureWidth, canvas.height / 2 - this.figureWidth);
                this.draw();
            }
        }

        addNode = (x, y, node = false, width = this.figureWidth) => {
            this.nodes.push(new Node(x, y, width));

            if(node) {
                let lastNode = this.getLastNode();
                let relation = new Relation(node, lastNode);

                this.relations.push(relation);

                lastNode.relations.push(relation);
            }
        }

        getLastNode = () => {
            return this.nodes[this.nodes.length - 1];
        }

        draw = () => {
            this.nodes.map((node) => {
                node.draw();
                console.log(node.relations);
                if(node.relations.length != 0){
                    node.relations.map((relation) => {
                        relation.draw();
                    });
                }
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
        sidesCoords = {};
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

            this.defineSideCoords();
        }

        defineSideCoords = () => {
            let x = 0, y = 0;
            this.sides.map((side) => {
                x = 0;
                y = 0;
                switch (side) {
                    case 'top':
                        x = this.coords.x + this.width / 2;
                        y = this.coords.y;
                        this.sidesCoords.top = {x: x, y: y};
                        break;
                    case 'right':
                        x = this.coords.x + this.width;
                        y = this.coords.y + this.width / 2;
                        this.sidesCoords.right = {x: x, y: y};
                        break;
                    case 'bot':
                        x = this.coords.x + this.width / 2;
                        y = this.coords.y + this.width;
                        this.sidesCoords.bot = {x: x, y: y};
                        break;
                    case 'left':
                        x = this.coords.x;
                        y = this.coords.y + this.width / 2;
                        this.sidesCoords.left = {x: x, y: y};
                        break;
                }
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

        move = (x, y, drag = false) => {
            if(drag){
                this.coords = {
                    x: x,
                    y: y
                }
                this.sections.forEach((section) => {
                    section.move();
                });
                this.defineSideCoords();
            } else {
                this.coords = {
                    x: x - this.width / 2,
                    y: y - this.width / 2
                }
                this.sections.forEach((section) => {
                    section.move();
                });
                this.defineSideCoords();
            }
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

    class Relation{
        section = {};
        parent = {};
        child = {};
        constructor(parent, child) {
            this.child = child;
            this.section = parent;
            this.parent = parent.parent;
        }

        draw = () => {
            ctx.beginPath();

            let fromX, fromY, toX, toY;

            switch (this.section.type) {
                case 'top':
                    fromX = this.parent.sidesCoords.top.x;
                    fromY = this.parent.sidesCoords.top.y;
                    toX = this.child.sidesCoords.bot.x;
                    toY = this.child.sidesCoords.bot.y;
                    break;
                case 'right':
                    fromX = this.parent.sidesCoords.right.x;
                    fromY = this.parent.sidesCoords.right.y;
                    toX = this.child.sidesCoords.left.x;
                    toY = this.child.sidesCoords.left.y;
                    break;
                case 'bot':
                    fromX = this.parent.sidesCoords.bot.x;
                    fromY = this.parent.sidesCoords.bot.y;
                    toX = this.child.sidesCoords.top.x;
                    toY = this.child.sidesCoords.top.y;
                    break;
                case 'left':
                    fromX = this.parent.sidesCoords.left.x;
                    fromY = this.parent.sidesCoords.left.y;
                    toX = this.child.sidesCoords.right.x;
                    toY = this.child.sidesCoords.right.y;
                    break;
            }
            console.log(fromX);
            console.log(toX);
            ctx.moveTo(fromX, fromY);
            ctx.lineTo(toX, toY);
            ctx.stroke();

            ctx.closePath();
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
        board.isMouseDown = true;


        //board.clear();
        if(board.check(mouse.x, mouse.y)){
            if(board.selectedNode.constructor.name == 'Section'){
                console.log('section');
                let x = board.selectedNode.parent.coords.x;
                let y = board.selectedNode.parent.coords.y;
                switch(board.selectedNode.type) {
                    case 'top':
                        board.addNode(x, y - board.figureWidth * 2, board.selectedNode);
                        break;
                    case 'right':
                        board.addNode(x + board.figureWidth * 2, y, board.selectedNode);
                        break;
                    case 'bot':
                        board.addNode(x, y + board.figureWidth * 2, board.selectedNode);
                        break;
                    case 'left':
                        board.addNode(x - board.figureWidth * 2, y, board.selectedNode);
                        break;
                }
                board.draw();
            }
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        board.selectedNode = false;
        board.isMouseDown = false;
    });


    canvas.addEventListener('mousemove', function (e){
        console.log('node:', board.selectedNode);
        let page = {
            x: e.pageX,
            y: e.pageY
        }
        /*let x = e.pageX,
            y = e.pageY;*/
        if(e.shiftKey && board.selectedNode && board.isMouseDown){
            /*mouse.x = e.clientX;
            mouse.y = e.clientY;

            board.clear();
            board.selectedNode.move(mouse.x, mouse.y);
            board.draw();*/

            board.clear();

            let offset = {
                x: page.x - mouse.x,
                y: page.y - mouse.y
            };

            board.selectedNode.coords.x += offset.x;
            board.selectedNode.coords.y += offset.y;
            board.selectedNode.move(board.selectedNode.coords.x, board.selectedNode.coords.y, true);

            mouse.x = page.x;
            mouse.y = page.y;

            board.draw();
        }
        if(e.shiftKey && !board.selectedNode && board.isMouseDown) {
            board.clear();

            let offset = {
                x:page.x-mouse.x,
                y:page.y-mouse.y
            };

            board.nodes.map((node) => {
                node.coords.x += offset.x;
                node.coords.y += offset.y;
                node.move(node.coords.x, node.coords.y, true);
            });

            mouse.x = page.x;
            mouse.y = page.y;

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