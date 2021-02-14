const menu = document.getElementById('jsMenu');
const content_text = document.getElementById('jsText');
const info_text = document.getElementById('jsInfo');
const HOME_URL = window.location.href;

export class Slot{
    constructor(x, size, alpha, description, color, subject, text, info){
        this.x = x;
        this.size = size;
        this.empty = (subject?false:true);
        this.alpha = alpha;
        this.description = description;
        this.text = text;
        this.info = info;

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

        this.btn_div.addEventListener('click', this.onClick.bind(this), false);
        this.btn_div.addEventListener('pointerenter', this.onEnter.bind(this), false);
        this.btn_div.addEventListener('pointerleave', this.onLeave.bind(this), false);
        this.div.appendChild(this.btn_div);

        menu.appendChild(this.div);
    }

    animate(){
        this.div.style.transform = "translate3d("+this.x+"px, 0px, 0px)";
    }

    opencontent(){
        if(!this.empty){
            window.isClosed = false;
            window.isLoading = 0;
            document.title = 'AnimateJS | '+this.alpha;
            window.content = new (this.subject)();
            content_text.innerHTML = "";
            let title = document.createElement('h2');
            title.className = "content_title";
            title.innerText = this.alpha;
            let subtitle = document.createElement('h4');
            subtitle.className = "content_subtitle";
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
            info_text.innerText = this.info;
            return true;
        }
        return false;
    }

    onClick(e){
        if(this.opencontent()){
            window.history.pushState({id:this.alpha.charCodeAt(0)-65}, 'AnimateJS | '+this.alpha, HOME_URL);
        }
    }

    onEnter(e){
        this.desc_txt.style.fontSize = "25px";
    }

    onLeave(e){
        this.desc_txt.style.fontSize = "20px";
    }
}