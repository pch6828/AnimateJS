const menu = document.getElementById('jsMenu');
const content = document.getElementById('jsContent');
const content_text = document.getElementById('jsText');

export class Slot{
    constructor(x, size, alpha, description, color, subject, text){
        this.x = x;
        this.size = size;
        this.empty = (subject?false:true);

        this.alpha = alpha;
        this.description = description;
        this.text = text;

        this.subject = subject;
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
        this.div.style.transform = "translate3d("+this.x+"px, 0px, 0px)";
    }

    opencontent(e){
        if(!this.empty){
            window.content = new (this.subject)();
            content_text.innerHTML = "";
            let title = document.createElement('h2');
            title.style.fontSize = "min(150px, 400%)";
            title.style.fontFamily = "consolas";
            title.innerText = this.alpha;
            let subtitle = document.createElement('h4');
            subtitle.style.fontSize = "40px";
            subtitle.style.fontFamily = "consolas";
            subtitle.innerText = this.description;
            let text = document.createElement('p');
            for(let i = 0; i < this.text.length; i++) { 
                text.appendChild(document.createTextNode(this.text[i]));
                text.appendChild(document.createElement('br'));
            } 
            content_text.appendChild(title);
            content_text.appendChild(document.createElement('br'));
            content_text.appendChild(subtitle);
            content_text.appendChild(document.createElement('br'));
            content_text.appendChild(text);
        }
    }

    onEnter(e){
        this.desc_txt.style.fontSize = "25px";
    }

    onLeave(e){
        this.desc_txt.style.fontSize = "20px";
    }
}