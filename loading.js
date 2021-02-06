export class Loading{
    constructor(){
        this.div = document.getElementById('jsLoading');
        this.percent_div = document.getElementById('jsLoadingText');
        this.info_div = document.getElementById('jsLoadingInfo');
        this.transparency = 100;
        this.div.style.backgroundColor = 'rgba(255,255,255,'+(this.transparency/100)+')';
        this.percentage = 0;
    }

    animate(){
        this.percentage = Math.min(100, this.percentage+1);
        this.percent_div.innerText = (this.percentage)+'%';
        if(this.percentage<100){
            return true;
        }else{
            this.percent_div.innerText = '';
            this.info_div.style.display = 'none';
        }
        this.transparency--;
        this.div.style.backgroundColor = 'rgba(255,255,255,'+(this.transparency/100)+')';
        if(this.transparency==0){
            this.div.style.display = 'none';
            return false;
        }
        return true;
    }
}