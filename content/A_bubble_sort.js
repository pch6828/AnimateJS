const canvas = document.getElementById('content_canvas');
const SWAP_SPEED = 50;

export class Bubble_Sort{
    constructor(){
        canvas.style.backgroundColor = '#FFAD00';
        this.arr = [];
        this.swapidx = 0;
        this.nowidx = 0;
        this.isSwapping = false;
        this.swapload = 0;
        this.changeamount = 0;
        this.fixed = 0;
        for(let i = 0; i < 9; i++){
            this.arr[i] = i+1;
        }
    }

    resize(stageWidth, stageHeight){
        this.width = stageWidth;
        this.height = stageHeight;
        this.centerx = stageWidth/2;
        this.centery = stageHeight/2;

        this.strsize = this.width/9;
        this.unitheight = this.height/20;
    }

    animate(ctx, moveX, moveY, isDown){
        if(isDown){
            this.shuffle();
            this.fixed = 0;
            this.isSwapping = false;
            this.nowidx = 0;
            this.swapload = 0;
            this.swapidx = 0;
        }
        
        let textwidth = 0;
        ctx.fillStyle = "rgba(255,255,255,1)";        
        ctx.font=this.strsize+'px Major Mono Display';
        textwidth+=ctx.measureText('ALGORIThM').width;
        ctx.fillText('ALGORIThM', this.centerx-textwidth/2, this.centery+this.strsize*2);

        if(this.isSwapping){
            if(this.swapload<SWAP_SPEED){
                this.swapload++;
                this.arr[this.swapidx] -= this.changeamount;
                this.arr[this.swapidx+1] += this.changeamount;
            }else{
                this.isSwapping = false;
                this.nowidx++;
            }
        }
        else if(this.fixed<9){
            if(this.arr[this.nowidx]>this.arr[this.nowidx+1]){
                this.swapidx = this.nowidx;
                this.isSwapping = true;
                this.swapload = 0;
                this.changeamount = (this.arr[this.nowidx]-this.arr[this.nowidx+1])/SWAP_SPEED;
            }else{
                this.nowidx++;
            }
        }

        if(this.nowidx==9-this.fixed){
            this.fixed++;
            this.nowidx = 0;
        }
        for(let i = 0; i < 9-this.fixed; i++){
            ctx.fillRect(this.centerx-textwidth/2+textwidth/9*i, this.centery+this.strsize, textwidth/9, -this.unitheight*this.arr[i]);
        }
        ctx.fillStyle="rgba(0,0,0,1)";
        for(let i = 9-this.fixed; i < 9; i++){
            ctx.fillRect(this.centerx-textwidth/2+textwidth/9*i, this.centery+this.strsize, textwidth/9, -this.unitheight*this.arr[i]);
        }
    }

    shuffle(){
        let currentIndex = this.arr.length, temporaryValue, randomIndex;
        for(let i = 0; i < 9; i++){
            this.arr[i] = i+1;
        }
        while (0 !== currentIndex) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          temporaryValue = this.arr[currentIndex];
          this.arr[currentIndex] = this.arr[randomIndex];
          this.arr[randomIndex] = temporaryValue;
        }
    }
}