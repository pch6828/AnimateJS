export class Slot{
    constructor(x, y, size, alpha, description){
        this.x = x;
        this.y = y;
        this.size = size;
        this.alpha = alpha;
        this.description = description;
        this.div = document.createElement('div');
        this.div.className = 'slot';
        this.div.style.transform = "translate3d("+this.x+"px,"+this.y+"px, 0px) no-repeat";
        this.div.appendChild(document.createTextNode(alpha));
        this.div.addEventListener("click", this.onClick.bind(this), false);
        document.body.insertBefore(this.div, document.getElementById('main_canvas'));
    }

    animate(ctx){
        this.div.style.transform = "translate3d("+this.x+"px,"+this.y+"px, 0px)";
        //ctx.fillText(this.alpha, this.x, this.y, this.size);
    }

    onClick(e){
        console.log(this.alpha);
    }
}