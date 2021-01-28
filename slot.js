export class Slot{
    constructor(x, y, size, alpha, description, color){
        this.x = x;
        this.y = y;
        this.size = size;
        this.description = description;
        this.div = document.createElement('div');
        this.div.className = 'slot';
        this.div.style.transform = "translate3d("+this.x+"px,"+this.y+"px, 0px)";
        
        this.btn_div = document.createElement('div');
        this.btn_div.className = 'slot__btn';
        this.btn_div.style.color = color;  
        this.btn_div.appendChild(document.createTextNode(alpha));

        this.btn_div.addEventListener('click', this.onClick.bind(this), false);

        this.div.appendChild(this.btn_div);

        let desc_div = document.createElement('div');
        desc_div.className = 'slot__description';
        desc_div.appendChild(document.createTextNode(description||'(null)'));
        
        this.div.appendChild(desc_div);

        document.body.insertBefore(this.div, document.getElementById('main_canvas'));
    }

    animate(ctx, centerx){
        this.div.style.transform = "translate3d("+this.x+"px,"+this.y+"px, 0px)";
        this.btn_div.style.fontSize = (100+200/(10+Math.abs(this.x-centerx)/5))+"px";
        //ctx.fillText(this.alpha, this.x, this.y, this.size);
    }

    onClick(e){
        console.log(this.alpha);
    }
}