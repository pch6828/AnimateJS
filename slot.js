const menu = document.getElementById('jsMenu');
const content = document.getElementById('jsContent');

export class Slot{
    constructor(x, y, size, alpha, description, color){
        this.x = x;
        this.y = y;
        this.size = size;
        this.empty = (description?false:true);
        this.div = document.createElement('div');
        this.div.className = 'slot';
        this.div.style.transform = "translate3d("+this.x+"px,"+this.y+"px, 0px)";
        
        let desc_div = document.createElement('div');
        desc_div.className = 'slot__description';
        this.desc_txt = document.createElement('p');
        this.desc_txt.className = 'p';
        this.desc_txt.appendChild(document.createTextNode(description||'(null)'));
        desc_div.appendChild(this.desc_txt);    
        this.div.appendChild(desc_div);

        this.btn_div = document.createElement('div');
        this.btn_div.className = 'slot__btn';
        this.btn_div.style.color = color;  
        this.btn_div.appendChild(document.createTextNode(alpha));

        this.btn_div.addEventListener('click', this.opencontent.bind(this), false);
        this.btn_div.addEventListener('pointerenter', this.onEnter.bind(this), false);
        this.btn_div.addEventListener('pointerleave', this.onLeave.bind(this), false);
        this.div.appendChild(this.btn_div);

        menu.appendChild(this.div);
    }

    animate(){
        this.div.style.transform = "translate3d("+this.x+"px,"+this.y+"px, 0px)";
    }

    opencontent(e){
        menu.style.display = 'none';
        content.style.display = 'block';
        window.content_on = true;
    }

    onEnter(e){
        this.desc_txt.style.fontSize = "25px";
    }

    onLeave(e){
        this.desc_txt.style.fontSize = "20px";
    }
}