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

    let Storage = window.localStorage;

    //var editor = new FroalaEditor('#example');

    class Board{
        nodes = [];
        relations = [];
        figureWidth = 50;
        selectedNode = false;
        isMouseDown = false;
        editor = {};
        modalClosed = true;

        constructor() {
            this.restore();
            this.draw();

            if(this.nodes.length == 0){
                this.addNode(canvas.width / 2 - this.figureWidth, canvas.height / 2 - this.figureWidth);
                this.draw();
            }

            this.save();
        }

        restore = () => {
            let nodes = JSON.parse(Storage.getItem('nodes'));
            let relations = JSON.parse(Storage.getItem('relations'));
            if(nodes){
                nodes.map((node) => {
                    this.addNode(node.coords.x, node.coords.y);
                    this.getLastNode().relations = node.relations;
                    this.getLastNode().content= node.content;
                });

                if(relations){
                    relations.map((relation) => {
                       let newRelation = new Relation(this.nodes[relation.parent], this.nodes[relation.child]);
                       newRelation.parentType = relation.parentType;
                       newRelation.childType = relation.childType;

                       this.relations.push(newRelation);
                    });
                }
            }
        }

        save = () => {
           let nodesSave = [];
           let relationsSave = [];
           this.nodes.map((node, i) => {
               nodesSave.push({
                   coords: node.coords,
                   relations: node.relations,
                   content: node.content
               });
           });
           this.relations.map((relation, i, relations) => {
               relationsSave.push({
                   parent: this.nodes.indexOf(relation.parent),
                   child: this.nodes.indexOf(relation.child),
                   parentType: relation.parentType,
                   childType: relation.childType
               });
           });
           //relationsSave = this.relations;
            /*Storage.setItem('nodes', JSON.stringify(nodesSave, function( key, value) {
                if( key == 'parent' || key == 'child') { return value.id;}
                else {return value;}
            }));*/
            Storage.setItem('nodes', JSON.stringify(nodesSave));
            Storage.setItem('relations', JSON.stringify(relationsSave));
        }

        removeNode = (node) => {
            this.removeRelations(node);
            this.nodes.splice(this.nodes.indexOf(node), 1);
            this.save();
        }

        getStartNode = () => {
            return this.nodes[0];
        }

        removeRelations = (node) => {
            this.relations = this.relations.filter((relation) => {
               if(
                   relation.parent != node &&
                   relation.child != node
               ){
                   console.log('del rel')
                   return relation;
               } else {
                   this.nodes.map((nodeEl) => {
                       if(nodeEl == relation.parent)
                           nodeEl.relations.splice(nodeEl.relations.indexOf(relation.parentType), 1);
                       else if(nodeEl == relation.child)
                           nodeEl.relations.splice(nodeEl.relations.indexOf(relation.childType), 1);
                   });
               }
            });
        }

        addNode = (x, y, parentSection = false, width = this.figureWidth) => {

            if(parentSection) {
                let parentNode = parentSection.parent;
                /*this.relations.map((relation) => {
                    if(
                        this.compareNodes(relation.parent, parentNode) &&
                        this.compareNodes(relation.child, parentNode)
                    )
                        console.log('parent st')
                });*/
                let isExist = false;
                let lastNode = this.getLastNode();
                if(parentNode.relations.indexOf(parentSection.type) >= 0)
                    isExist = true;
                /*this.relations.map((relation) => {
                    if(relation.hash == newRelation.hash)
                        isExist = true;
                });*/

                if(!isExist){
                    let newNode = new Node(x, y, width);
                    let newRelation = new Relation(parentNode, newNode);
                    newRelation.parentType = parentSection.type;
                    newRelation.defineChildType();

                    this.relations.push(newRelation);
                    this.nodes.push(newNode);
                    newNode.relations.push(newRelation.childType);
                    parentNode.relations.push(newRelation.parentType);

                    this.clear();
                    this.draw();
                    //parentNode.drawSections();
                    this.save();
                }
                return;
                //lastNode.relations.push(relation);
            } else {
                this.nodes.push(new Node(x, y, width));
            }

            this.save();
        }

        getLastNode = () => {
            return this.nodes[this.nodes.length - 1];
        }

        draw = (section = false) => {
            this.nodes.map((node) => {
                if (section) {
                    node.sections.map((section) => {
                        section.draw();
                    })
                }
                node.draw();
            })

            if (this.relations.length != 0) {
                this.relations.map((relation) => {
                    relation.draw();
                });

            }
        }

        drawAllSections = () => {
            this.nodes.map((node) => {
                node.sections.map((section) => {
                    if(section != this.selectedNode)
                        if(node.relations.indexOf(section.type) < 0)
                            section.draw();

                })
            })

        }

        check = (x, y, exclude = false) => {
            let isSelected = false;

            this.nodes.map((node) => {
                if(node.check(x, y, exclude) !== false){
                    this.selectedNode = node.check(x, y, exclude);
                    isSelected = true;
                }

            })

            return isSelected;
        }

        select = (node) => {
            this.selectedNode = node;
        }

        clear = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        openContentEditor = () => {
            this.editor = $('.editor__input').froalaEditor();
            this.editor.froalaEditor('html.set', board.selectedNode.content);
            $('.editor').addClass('active');
            this.modalClosed = false;
        }

        closeContentEditor = () => {

            let content = this.editor.froalaEditor('html.get');
            console.log('saving content:', content);
            board.selectedNode.content = content;

            console.log('closed');
            this.editor.froalaEditor('destroy');
            $('.editor').removeClass('active');
            this.modalClosed = true;
            console.log(this.nodes)
            board.save();
        }

        saveContentEditor = (e, editor) => {
            let content = editor.html.get();
            console.log('saving content:', content);
            board.selectedNode.content = content;
        }

        getCollision = (x, y, movingNode) => {
            let result = false;
            this.nodes.map((node) => {
                if(movingNode != node){
                    if(node.checkSelf(x, y)){
                        result = node;
                    }

                    node.sections.map((section) => {
                        if(movingNode != section){
                            if(section.checkSelf(x, y)){
                                result = section;
                            }
                        }
                    });
                }
            })

            return result;
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
        content = "";

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
                if(this.relations.indexOf(section.type) < 0)
                    section.draw();
            });
        }

        recountSections = () => {
            this.sections.map((section) => {
                //if(section != board.selectedNode)
                    section.recount();
            })
        }

        move = (x, y, drag = false) => {
            if(drag){
                this.coords = {
                    x: x,
                    y: y
                }
                this.sections.forEach((section) => {
                    section.recount();
                });
                this.defineSideCoords();
            } else {
                this.coords = {
                    x: x - this.width / 2,
                    y: y - this.width / 2
                }
                this.sections.forEach((section) => {
                    section.recount();
                });
                this.defineSideCoords();
            }
        }

        checkSelf = (x, y) => {
            let result = false;

            if(
                x >= this.coords.x &&
                x <= this.coords.x + this.width &&
                y >= this.coords.y &&
                y <= this.coords.y + this.width
            )
                result = true;

            return result;
        }

        check = (x, y, exclude = false) => {
            let result = false;
            if(
                x >= this.coords.x &&
                x <= this.coords.x + this.width &&
                y >= this.coords.y &&
                y <= this.coords.y + this.width
            )
                result = this;

            this.sections.forEach((section) => {
                console.log("sec check")
                console.log(section.check(x, y) == exclude)
                if((section.check(x, y) != false) && section.check(x, y) != exclude)
                {
                    result = section.check(x, y);
                } else{
                    console.log("sec check inval")
                }
            });

            return result;
        }
    }

    class Section{
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

        checkSelf = (x, y) => {
            let result = false;

            if(
                x >= this.coords.x &&
                x <= this.coords.x + this.width &&
                y >= this.coords.y &&
                y <= this.coords.y + this.width
            )
                result = true;

            return result;
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
        parentType = '';
        childType = '';
        section = {};
        parent = {};
        child = {};
        constructor(parent, child) {
            this.child = child;
            this.parent = parent;
        }

        defineChildType = () => {
            switch (this.parentType) {
                case 'top':
                    this.childType = 'bot';
                    break;
                case 'left':
                    this.childType = 'right';
                    break;
                case 'bot':
                    this.childType = 'top';
                    break;
                case 'right':
                    this.childType = 'left';
                    break;
            }
        }

        draw = () => {
            ctx.beginPath();

            let fromX, fromY, toX, toY;

            switch (this.parentType) {
                case 'top':
                    fromX = this.parent.sidesCoords.top.x;
                    fromY = this.parent.sidesCoords.top.y;
                    /*toX = this.child.sidesCoords.bot.x;
                    toY = this.child.sidesCoords.bot.y;*/
                    break;
                case 'right':
                    fromX = this.parent.sidesCoords.right.x;
                    fromY = this.parent.sidesCoords.right.y;
                    /*toX = this.child.sidesCoords.left.x;
                    toY = this.child.sidesCoords.left.y;*/
                    break;
                case 'bot':
                    fromX = this.parent.sidesCoords.bot.x;
                    fromY = this.parent.sidesCoords.bot.y;
                    /*toX = this.child.sidesCoords.top.x;
                    toY = this.child.sidesCoords.top.y;*/
                    break;
                case 'left':
                    fromX = this.parent.sidesCoords.left.x;
                    fromY = this.parent.sidesCoords.left.y;
                    /*toX = this.child.sidesCoords.right.x;
                    toY = this.child.sidesCoords.right.y;*/
                    break;
            }

            switch(this.childType){
                case 'top':
                    toX = this.child.sidesCoords.top.x;
                    toY = this.child.sidesCoords.top.y;
                    break;
                case 'right':
                    toX = this.child.sidesCoords.right.x;
                    toY = this.child.sidesCoords.right.y;
                    break;
                case 'bot':
                    toX = this.child.sidesCoords.bot.x;
                    toY = this.child.sidesCoords.bot.y;
                    break;
                case 'left':
                    toX = this.child.sidesCoords.left.x;
                    toY = this.child.sidesCoords.left.y;
                    break;
            }

            ctx.moveTo(fromX, fromY);
            ctx.lineTo(toX, toY);
            ctx.stroke();

            ctx.closePath();
        }
    }

    class Viewer{
        content = "";
        node = {};
        sides = [];
        controls = "";

        constructor() {

        }

        initViewer = (node = false) => {
            if(node.constructor.name != 'Node')
                node = board.getStartNode();

            this.clear();

            this.setNode(node);

            this.setContent(this.node.content);
            this.renderContent(this.content);

            this.setSides(this.node);
            this.initButtons();
            this.renderControls();

            $('.viewer').addClass('active');
        }

        closeViewer = () => {
            $('.viewer').removeClass('active');
        }

        setSides = (node) => {
            this.sides = node.relations;
        }

        initButtons = () => {
            this.sides.map((side) => {
                switch (side) {
                    case 'top':
                        this.controls += `<button class='viewer__slide top' data-side='${side}'>Top</button>`;
                        break;
                    case 'right':
                        this.controls += `<button class='viewer__slide right' data-side='${side}'>Right</button>`;
                        break;
                    case 'bot':
                        this.controls += `<button class='viewer__slide bot' data-side='${side}'>Bot</button>`;
                        break;
                    case 'left':
                        this.controls += `<button class='viewer__slide left' data-side='${side}'>Left</button>`;
                        break;
                }
            })
        }

        renderControls = () => {
            $('.viewer__controls').html(this.controls);
            $('.viewer__slide').click(function(e){
                viewer.slide(e);
            });
        }

        clear = () => {
            this.clearControls();
            this.clearOutput();
        }

        clearOutput = () => {
            $('.viewer__output').empty();
        }

        clearControls = () => {
            this.controls = '';
            $('.viewer__controls').empty();
        }

        getNextNode = (node, side) => {
            let result = false;

            board.relations.map((relation) => {
                if(relation.child == node && relation.childType == side) {
                    result = relation.parent;
                } else if(relation.parent == node && relation.parentType == side) {
                    result = relation.child;
                }
            });

            return result;
        }

        slide = (e) => {
            console.log('slide');

            let btn = $(e.target);
            let nextSlideType = btn.data('side');

            let nextNode = this.getNextNode(this.node, nextSlideType);

            console.log(nextNode)

            this.initViewer(nextNode);
        }

        setContent = (content) => {
            this.content = content;
        }

        renderContent = (content) => {
            $('.viewer__output').html(content);
        }

        setNode = (node) => {
            this.node = node
        }
    }

    let board = new Board();

    canvas.addEventListener('mousedown', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        board.isMouseDown = true;


        //board.clear();
        if(board.check(mouse.x, mouse.y) && !e.shiftKey){
            if(board.selectedNode.constructor.name == 'Section' && board.selectedNode.isDrawed){
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
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        board.isMouseDown = false;
        let prevSelectedNode = board.selectedNode;
        board.selectedNode = false;
        if(board.check(mouse.x, mouse.y) && e.shiftKey)
        {
            board.selectedNode.recount();
            console.log(prevSelectedNode);
            console.log(board.selectedNode);
            console.log(board.selectedNode == prevSelectedNode);
            //if(board.selectedNode.constructor.name == 'Section' && board.selectedNode != parent){
            if(
                board.selectedNode.constructor.name == 'Section'
                /*&& !(board.selectedNode.parent == prevSelectedNode.parent)*/
            ){
                mouset.x = e.clientX;
                mouset.y = e.clientY;
                let collisionNode = board.getCollision(mouset.x, mouset.y, board.selectedNode);


                let newRelation = new Relation(collisionNode.parent, board.selectedNode.parent);
                newRelation.parentType = collisionNode.type;
                newRelation.childType = board.selectedNode.type;
                console.log(newRelation)
                collisionNode.parent.relations.push(collisionNode.type);
                board.selectedNode.parent.relations.push(board.selectedNode.type);

                board.relations.push(newRelation);

                board.save();

                /*if(board.selectedNode == prevSelectedNode){
                    board.check(mouse.x, mouse.y, board.selectedNode);

                    let newRelation = new Relation(prevSelectedNode.parent, board.selectedNode.parent);
                    newRelation.parentType = prevSelectedNode.type;
                    newRelation.childType = board.selectedNode.type;
                    console.log(newRelation)
                    prevSelectedNode.parent.relations.push(prevSelectedNode.type);
                    board.selectedNode.parent.relations.push(board.selectedNode.type);

                    board.relations.push(newRelation);

                    board.save();
                }*/
            }
        }

        if(board.selectedNode.constructor.name == 'Section') {
            board.selectedNode.isDrawed = false;
        }

        board.clear();
        board.draw();

        board.selectedNode = false;
    });

    let mouset = {
        x: 0,
        y: 0
    }
    canvas.addEventListener('mousemove', function (e){
        //console.log('node:', board.selectedNode);
        let page = {
            x: e.pageX,
            y: e.pageY
        }
        /*let x = e.pageX,
            y = e.pageY;*/
        if(e.shiftKey && board.selectedNode && board.isMouseDown){
            if(board.selectedNode.constructor.name == 'Node'){
                board.clear();

                let offset = {
                    x: page.x - mouse.x,
                    y: page.y - mouse.y
                };

                board.selectedNode.coords.x += offset.x;
                board.selectedNode.coords.y += offset.y;
                board.selectedNode.move(board.selectedNode.coords.x, board.selectedNode.coords.y, true);
                board.save();
                mouse.x = page.x;
                mouse.y = page.y;

                board.draw();
                board.save();
            } else if (board.selectedNode.constructor.name == 'Section') {
                board.clear();

                /*let prev = board.selectedNode;
                if(board.check(e.clientX, e.clientY))
                    if (board.selectedNode != prev){
                        board.selectedNode.hover();
                        board.select(prev);
                    }

                board.select(prev);*/

                let offset = {
                    x: page.x - mouse.x,
                    y: page.y - mouse.y
                };

                board.selectedNode.coords.x += offset.x;
                board.selectedNode.coords.y += offset.y;
                board.selectedNode.move(board.selectedNode.coords.x, board.selectedNode.coords.y, true);
                board.save();
                mouse.x = page.x;
                mouse.y = page.y;

                board.draw();
                board.selectedNode.draw();
                board.drawAllSections();
            }

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
            board.save();
        }
    });

    canvas.addEventListener('dblclick', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        if(board.check(mouse.x, mouse.y)){
            board.clear();
            board.draw();
            board.selectedNode.recountSections();
            board.selectedNode.drawSections();
            //board.selectedNode = false;
        }
    });

    document.addEventListener('keydown', (e) => {
        if((e.code == 'Delete' || e.code == 'KeyD') && board.selectedNode && board.modalClosed){
            board.removeNode(board.selectedNode);
            board.clear();
            board.draw();
        } else if(e.code == 'KeyE' && board.selectedNode && board.modalClosed){
            board.openContentEditor();
        }
    })

    //board.openContentEditor();
    board.editor = $('.editor__input').froalaEditor();
    board.editor.on('froalaEditor.contentChanged', board.saveContentEditor);
    let viewer = new Viewer();

    $('#clear').click(function(e){
        Storage.clear();
        board.clear();
        board = new Board();
        board.selectedNode = false;
        board.save();
    });

    $('.editor__close').click(board.closeContentEditor);

    $('#view').click(viewer.initViewer);
    $('.viewer__close').click(viewer.closeViewer);
});