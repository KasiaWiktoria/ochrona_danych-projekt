
function enable(){
    console.log("funkcja enable on click")
    let input = document.getElementById('who_can_read');
    let label = document.getElementById('label_wcr');
    let chbox = document.getElementById('public')

    console.log(chbox.checked)
    if(chbox.checked){ 
        console.log("disabled")
        input.disabled=true;
        label.style.color = '#0000003e'
    }else{
        console.log("enabled")
        input.disabled = false; 
        input.focus();
        label.style.color = '#000'
    }
}