
let users_who_can_read = []
document.addEventListener('DOMContentLoaded', function (event) {

    let chbox = document.getElementById('public')
    console.log('hello')

    chbox.addEventListener('change', function (event){
        event.preventDefault()

        console.log("funkcja enable on click")
        let input = document.getElementById('who_can_read');
        let chbox = document.getElementById('public')
        let add_btn = document.getElementById('add_btn')
        let chbox_disable = document.getElementsByClassName('chbox_disable')
        console.log(chbox_disable)


        console.log(chbox.checked)
        if(chbox.checked){ 
            console.log("disabled")
            input.disabled=true;
            add_btn.disabled = true
            add_btn.style.backgroundColor = '#0000003e'
            for(let i=0; i < chbox_disable.length;i++){
                chbox_disable[i].style.color = '#0000003e'            
            }
        }else{
            console.log("enabled")
            input.disabled = false; 
            add_btn.disabled = false
            add_btn.style.backgroundColor = 'var(--main-color)'
            input.focus();
            for(let i=0; i < chbox_disable.length;i++){
                chbox_disable[i].style.color = '#000'            
            }
        }
    }) 

    let add_btn = document.getElementById('add_btn')
    console.log(add_btn)

    add_btn.addEventListener('click', function (){
        //event.preventDefault()
        console.log('jest ok')

        removeWarningMessage("blankWarning")
        let input = document.getElementById('who_can_read');
        if(!isBlank(input)){
            let warning = validateEmail(input.value)
            if(warning != ""){
                let message = warning;
                let warningElemId = "blankWarning"
                let warningElem = prepareWarningElem(warningElemId, message);
                appendAfterElem("add-form-row", warningElem);
            } else {
                console.log('ok')
                add_email_to_list()
            }
        }else{
            console.log('blank')
        }
        return false;

    })
})

function add_email_to_list(){
    let email = document.getElementById('who_can_read').value

    console.log('email: ' + email)
    if (!users_who_can_read.includes(email)){
        users_who_can_read.push(email)
        show_email_on_list(email)
    }else{
        let message = "ten użytkownik został już dodany na listę.";
        let warningElemId = "blankWarning"
        let warningElem = prepareWarningElem(warningElemId, message);
        appendAfterElem("add-form-row", warningElem);
    }
    console.log('lista: ' + users_who_can_read)
}

function show_email_on_list(email){
    let wcr_list = document.getElementById('wcr_list')
    wcr_list.textContent = wcr_list.textContent + '    ' + email
}


function isBlank(field) {
    if (field.value == "") {
        let message = "aby dodać, wpisz jakąś wartość.";
        let warningElemId = "blankWarning"
        let warningElem = prepareWarningElem(warningElemId, message);
        appendAfterElem("add-form-row", warningElem);
        return true;
    }
    return false
}

function prepareWarningElem(newElemId, message) {
    let warningField = document.getElementById(newElemId);

    if (warningField === null) {
        let textMessage = document.createTextNode(message);
        warningField = document.createElement('span');

        warningField.setAttribute("id", newElemId);
        warningField.className = "warning-field";
        warningField.style.textAlign = "center"
        warningField.appendChild(textMessage);
    }
    return warningField;
}

function appendAfterElem(currentElemId, newElem) {
    let currentElem = document.getElementById(currentElemId);
    currentElem.insertAdjacentElement('afterend', newElem);
}

function removeWarningMessage(warningElemId) {
    let warningElem = document.getElementById(warningElemId);

    if (warningElem !== null) {
        warningElem.remove();
    }
}


function validateEmail(emailInput){
    if(RegExp("^\s$").test(emailInput)){
        return "Email nie może zawierać spacji.";
    } else if ((RegExp("^[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$").test(emailInput))){
        return "Email nie może zawierać polskich znaków.";
    } else if (!(RegExp("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$").test(emailInput))){
        return "Niepoprawna forma adresu email.";
    } else if(emailInput.length < 4 ){
        return "Login musi mieć powyżej 4 znaków."
    }else{
        return "";
    }
}