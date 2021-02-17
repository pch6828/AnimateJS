const canvas = document.getElementById('content_canvas');
const WARP_SPEED = 5;
const SHRINK_SPEED = 0.8;

function dist(x1, y1, x2, y2){
    const dx = x2-x1;
    const dy = y2-y1;
    return Math.sqrt(dx*dx+dy*dy);
}

function pointCircle(px, py, cx, cy, r){
    if(dist(px, py, cx, cy)<=r){
        return true;
    }
    return false;
}

class Text{
    constructor(){
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    setText(str, stageWidth, stageHeight){
        const myText = str;
        const fontSize = Math.min(stageWidth, stageHeight)/5;
        
        this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;
        this.canvas.width = stageWidth;
        this.canvas.height = stageHeight;
        this.ctx.clearRect(0, 0, stageWidth,stageHeight);
        this.ctx.font = '600 '+fontSize+'px Courier New';
        this.ctx.fillStyle = 'rgba(255,255,255,1)';
        
        let textmetrics = this.ctx.measureText(myText);
        this.ctx.fillText(myText, stageWidth/2-textmetrics.width/2, stageHeight/2+(textmetrics.actualBoundingBoxAscent-textmetrics.actualBoundingBoxDescent)/2);
    }

    dotPos(density, stageWidth, stageHeight){
        const img = this.ctx.getImageData(0, 0, stageWidth, stageHeight).data;       

        const particles = [];
        let i = 0;
        let width = 0;
        let pixel;

        for(let height = 0; height < this.canvas.height; height+=density){
            ++i;
            width = 0;
            const slide = (i%2)==0;
            if(slide==0){
                width+=6;
            }
            for(width; width < this.canvas.width; width+=density){
                pixel = img[((width+(height*this.canvas.width))*4)-1];
            
                if(pixel!=0){
                    particles.push({
                        x: width,
                        y: height
                    })
                }
            }
        }
        return particles;
    }

    getOutLine(density, stageWidth, stageHeight){
        const particles = this.dotPos(density, stageWidth, stageHeight);

        let minX = particles[0].x;
        let maxX = particles[0].x;
        let minY = particles[0].y;
        let maxY = particles[0].y;

        for(let i = 0; i < particles.length; i++){
            const point = particles[i];
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        }

        const gap = density*2;
        const distX = maxX-minX;
        const xTotal = distX/gap|0;
        const distY = maxY-minY;
        const yTotal = distY/gap|0;
        
        const outline = [];
        const xarr = [];

        for(let i = 0; i < xTotal; i++){
            const tx = i*gap+minX;
            xarr[i] = [];
            for(let j = 0; j < yTotal; j++){
                const ty = j*gap+minY;

                for(let k = 0; k < particles.length; k++){
                    const point = particles[k];
                    
                    if(pointCircle(point.x, point.y, tx, ty, gap)){
                        xarr[i].push({
                            x: tx, 
                            item: point
                        })
                    }
                }
            }
        }
        let check = 0;
        let prevY;

        for(let i = 0; i < xarr.length; i++){
            check = 0;
            for(let j = 0; j < xarr[i].length; j++){
                const pos = xarr[i][j];

                if(check==0){
                    prevY = pos.item.y;
                    outline.push({
                        x1: pos.x,
                        x2: pos.x,
                        minY: pos.item.y,
                        maxY: pos.item.y
                    });
                    check = 1;
                }else if(check==1){
                    if(pointCircle(pos.x, pos.item.y, pos.x, prevY, gap)){
                        const cur = outline[outline.length-1];
                        cur.minY = Math.min(cur.minY, pos.item.y);
                        cur.maxY = Math.max(cur.maxY, pos.item.y);
                        check = 1;
                        prevY = pos.item.y;
                    }else{
                        check = 2;
                    }
                }else if(check==2){
                    prevY = pos.item.y;
                    outline.push({
                        x1: pos.x,
                        x2: pos.x,
                        minY: pos.item.y,
                        maxY: pos.item.y
                    });
                    check = 1;
                }
            }
        }
        return outline;
    }
}

export class Sticky_Letters{
    constructor(){
        this.text = new Text();
        canvas.style.backgroundColor = '#303030';
        this.anchorx = null;
        this.anchory = null;
    }

    resize(stageWidth, stageHeight){
        this.width = stageWidth;
        this.height = stageHeight;
        this.centerx = stageWidth/2;
        this.centery = stageHeight/2;
        this.text.setText('Stubborn', this.width, this.height);
        this.origin = this.text.getOutLine(2, this.width, this.height);
        this.outline = this.text.getOutLine(2, this.width, this.height);
    }

    animate(ctx, moveX, moveY, isDown, nowx, nowy){
        ctx.globalCompositeOperation='source-over';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for(let i = 0; i < this.outline.length; i++){
            let x1 = this.outline[i].x1;
            let x2 = this.outline[i].x2
            let y1 = this.outline[i].minY;
            let y2 = this.outline[i].maxY;
            const origin_x1 = this.origin[i].x1;
            const origin_x2 = this.origin[i].x2;
            const origin_y1 = this.origin[i].minY;
            const origin_y2 = this.origin[i].maxY;
            if(isDown){
                if(!this.anchorx&&!this.anchory){
                    this.anchorx = nowx;
                    this.anchory = nowy;
                }
                
                x1+=moveX/(dist(origin_x1, origin_y1, this.anchorx, this.anchory)+5)*WARP_SPEED;
                y1+=moveY/(dist(origin_x1, origin_y1, this.anchorx, this.anchory)+5)*WARP_SPEED;
            
                x2+=moveX/(dist(origin_x2, origin_y2, this.anchorx, this.anchory)+5)*WARP_SPEED;
                y2+=moveY/(dist(origin_x2, origin_y2, this.anchorx, this.anchory)+5)*WARP_SPEED;

                x1+=moveX/(dist(x1, y1, this.anchorx, this.anchory)+5)*WARP_SPEED;
                y1+=moveY/(dist(x1, y1, this.anchorx, this.anchory)+5)*WARP_SPEED;
            
                x2+=moveX/(dist(x2, y2, this.anchorx, this.anchory)+5)*WARP_SPEED;
                y2+=moveY/(dist(x2, y2, this.anchorx, this.anchory)+5)*WARP_SPEED;
                this.outline[i] = {
                    x1: x1,
                    x2: x2,
                    minY: y1,
                    maxY: y2,
                };
            }else{
                this.outline[i] = {
                    x1: origin_x1+(x1-origin_x1)*SHRINK_SPEED,
                    x2: origin_x2+(x2-origin_x2)*SHRINK_SPEED,
                    minY: origin_y1+(y1-origin_y1)*SHRINK_SPEED,
                    maxY: origin_y2+(y2-origin_y2)*SHRINK_SPEED,
                };
                this.anchorx = null;
                this.anchory = null;
            }
            ctx.strokeStyle = 'rgba(128,0,0,1)';
            ctx.beginPath();
            ctx.moveTo(origin_x1, origin_y1);
            ctx.lineTo(origin_x2, origin_y2);
            ctx.stroke();
            ctx.closePath();              
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(origin_x2, origin_y2);
            ctx.stroke();
            ctx.closePath();      
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(origin_x1, origin_y1);
            ctx.stroke();
            ctx.closePath();    
        }
        for(let i = 0; i < this.outline.length; i++){
            let x1 = this.outline[i].x1;
            let x2 = this.outline[i].x2
            let y1 = this.outline[i].minY;
            let y2 = this.outline[i].maxY;  
            ctx.strokeStyle = 'rgba(255,0,0,1)';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.closePath();    
        }
    }
}