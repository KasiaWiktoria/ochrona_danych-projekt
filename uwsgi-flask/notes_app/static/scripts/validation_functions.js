import {GET, POST, URL, HTTP_STATUS, POLSKIE_ZNAKI, EMAIL_FIELD_ID, POLSKIE_ZNAKI_MALE, POLSKIE_ZNAKI_DUZE, LOGIN_FIELD_ID, PASSWD_FIELD_ID, REPEAT_PASSWD_FIELD_ID} from './const.js'
import {prepareWarningElem, appendAfterElem } from './warning_functions.js';

export function isAnyFieldBlank(fields) {
    let isBlank = false
    fields.forEach(field => {
        if (field.value == "") {
            let message = "Pole nie może być puste.";
            let field_id = field.name
            console.log('id pola: ', field_id)
            let warningElemId = field_id + "Warning"
            let warningElem = prepareWarningElem(warningElemId, message);
            appendAfterElem(field_id, warningElem);
            isBlank = true;
        }
    });
    return isBlank
}

function alphabetOnly(FIELD_ID) {
    let input = document.getElementById(FIELD_ID).value;
    let input_name = document.getElementById(FIELD_ID).getAttribute('name');

    if (!(RegExp("^[" + POLSKIE_ZNAKI +" ]+$").test(input))){
        return "Pole " + input_name + " może zawierać tylko litery.";
    }else{
        return "";
    }
}

export function noSpecialCharacters(FIELD_ID) {
    let input = document.getElementById(FIELD_ID).value;
    let input_name = document.getElementById(FIELD_ID).getAttribute('name');

    if (!(RegExp("^[\\." + POLSKIE_ZNAKI +"-\\d ]+$").test(input))){
        return "Pole " + input_name + " może zawierać tylko litery, cyfry, kropkę, znak spacji lub znak '-'.";
    }else{
        return "";
    }
}

export function validateEmail(EMAIL_FIELD_ID){
    let emailInput = document.getElementById(EMAIL_FIELD_ID).value;
    if(RegExp("^\s$").test(emailInput)){
        return "Email nie może zawierać spacji.";
    } else if ((RegExp("^[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$").test(emailInput))){
        return "Email nie może zawierać polskich znaków.";
    } else if (!(RegExp("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$").test(emailInput))){
        return "Niepoprawna forma adresu email.";
    } else{
        return "";
    }
}

export function validateFile(IMAGE_FIELD_ID) {
    let filePath = document.getElementById(IMAGE_FIELD_ID).value;
          
            var allowedExtensions =  
                    /(\.txt|\.docx|\.doc|\.pdf)$/i; 
              
            if (allowedExtensions.exec(filePath) !== null) { 
                return "";
            }  
            else  
            { 
                document.getElementById(IMAGE_FIELD_ID).value = ''
                return 'Nieprawidłowy format pliku. Dozwolone rozszerzenia: .txt, .docx, .doc, .pdf.'; 
            } 
}

export function isLoginAvailable() {
    return Promise.resolve(checkLoginAvailability().then(function (statusCode) {
        if (statusCode === HTTP_STATUS.OK) {
            console.log('login rzeczywiście jest zajęty')
            return false;
        } else if (statusCode === HTTP_STATUS.NOT_FOUND) {
            return true
        } else {
            throw "Unknown login availability status: " + statusCode;
        }
    }));
}

function checkLoginAvailability() {
    let loginInput = document.getElementById(LOGIN_FIELD_ID);
    let baseUrl = URL + "user/";
    let userUrl = baseUrl + loginInput.value;

    return Promise.resolve(fetch(userUrl, { mode: 'cors'}, {method: GET}).then(function (resp) {
        console.log("status = " + resp.status);
        return resp.status;
    }).catch(function (err) {
        
        return err.status;
    }));
}

export function validateLogin(){
    let loginInput = document.getElementById(LOGIN_FIELD_ID).value;
    if (!(RegExp("^[" + POLSKIE_ZNAKI +"]+$").test(loginInput))){
        return "Login może składać się tylko z liter.";
    } else if(loginInput.length < 4 ){
        return "Login musi mieć powyżej 4 znaków."
    }else{
        return "";
    }
}

export function validatePasswd() {
    let passwdInput = document.getElementById(PASSWD_FIELD_ID).value;
    if (passwdInput.length < 8) {
        return "Hasło musi mieć powyżej 8 znaków";
    } else if (!(/\d/.test(passwdInput))){
        return "Hasło musi zawierać przynajmniej jedną cyfrę.";
    } else if (!(RegExp("^.*[" + POLSKIE_ZNAKI_DUZE +"]+.*$").test(passwdInput))){
        return "Hasło musi zawierać przynajmniej jedną wielką literę.";
    } else if (!(RegExp("^.*[" + POLSKIE_ZNAKI_MALE +"]+.*$").test(passwdInput))){
        return "Hasło musi zawierać przynajmniej jedną małą literę.";
    } else {
        return "";
    }
}

export function arePasswdsTheSame() {
    let passwdInput = document.getElementById(PASSWD_FIELD_ID).value;
    let repeatPasswdInput = document.getElementById(REPEAT_PASSWD_FIELD_ID).value;

    if (passwdInput == repeatPasswdInput){
        return true; 
    } else {
        return false;
    }
}