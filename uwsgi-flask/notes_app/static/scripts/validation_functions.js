import {GET, POST, URL, HTTP_STATUS, POLSKIE_ZNAKI, POLSKIE_ZNAKI_MALE, POLSKIE_ZNAKI_DUZE, LOGIN_FIELD_ID, PASSWD_FIELD_ID, REPEAT_PASSWD_FIELD_ID} from './const.js'
import {prepareWarningElem, appendAfterElem } from './warning_functions.js';

export function isAnyFieldBlank(fields) {
    let isBlank = false
    fields.forEach(field => {
        if (field.value == "") {
            let message = "Pole nie może być puste.";
            let field_id = field.name
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

export function validateName(NAME_FIELD_ID) {
    let nameInput = document.getElementById(NAME_FIELD_ID).value;

    if(RegExp("^\s$").test(nameInput)){
        return "Wpisz tylko jedno imię";
    }else if (!(RegExp("^[" + POLSKIE_ZNAKI +"]+$").test(nameInput))){
        return "Imię może zawierać tylko litery.";
    }else if (!(RegExp("^[" + POLSKIE_ZNAKI_DUZE +"].*$").test(nameInput))){
        return "Imię musi zaczynać się wielką literą."
    }else {
        return "";
    }
}

export function validateSurname(SURNAME_FIELD_ID) {
    let surnameInput = document.getElementById(SURNAME_FIELD_ID).value;

    if(/^ +$/.test(surnameInput)){
        return "Nazwisko nie może zawierać spacji. W przypadku dwuczłonowego nazwiska wpisz '-' pomiędzy";
    }else if (!(RegExp("^[" + POLSKIE_ZNAKI +"\-]+$").test(surnameInput))){
        return "Nazwisko może zawierać tylko litery i opcjonalnie jeden znak '-'.";
    }else if (!(RegExp("^[" + POLSKIE_ZNAKI_DUZE +"].*$").test(surnameInput))){
        return "Nazwisko musi zaczynać się wielką literą."
    }else if ((RegExp("^([" + POLSKIE_ZNAKI_DUZE +"][" + POLSKIE_ZNAKI_MALE +"]+)-.*$").test(surnameInput)) && !(RegExp("^([" + POLSKIE_ZNAKI_DUZE +"][" + POLSKIE_ZNAKI_MALE +"]+)-[" + POLSKIE_ZNAKI_DUZE +"].*$").test(surnameInput))){
        return "Drugi człon nazwiska musi zaczynać się wielką literą.";
    }else if(RegExp("^([" + POLSKIE_ZNAKI_DUZE +"][" + POLSKIE_ZNAKI_MALE +"]+)-[" + POLSKIE_ZNAKI_DUZE +"]*$").test(surnameInput)){
        return "Drugie nazwisko musi mieć więcej niż jedną literę.";
    }else{
        return "";
    }
}

export function validateBDate(BDATE_FIELD_ID){
    let bdateInput = document.getElementById(BDATE_FIELD_ID).value;

    if(!(/^\d{4}-\d{2}-\d{2}$/.test(bdateInput))){
        return "Data powinna mieć format dd.mm.rrrr";
    }else{
        return "";
    }
}

export function validatePesel(PESEL_FIELD_ID) {
    let peselInput = document.getElementById(PESEL_FIELD_ID).value;
    
    if (peselInput.length == 11 && !isNaN(peselInput)) {
        
        let a = parseInt(peselInput.charAt(0));
        let b = parseInt(peselInput.charAt(1));
        let c = parseInt(peselInput.charAt(2));
        let d = parseInt(peselInput.charAt(3));
        let e = parseInt(peselInput.charAt(4));
        let f = parseInt(peselInput.charAt(5));
        let g = parseInt(peselInput.charAt(6));
        let h = parseInt(peselInput.charAt(7));
        let i = parseInt(peselInput.charAt(8));
        let j = parseInt(peselInput.charAt(9));
        let k = parseInt(peselInput.charAt(10));
        let sum = 1*a + 3*b + 7*c + 9*d + 1*e + 3*f + 7*g + 9*h + 1*i + 3*j;
    
        if (10 - sum%10 == k){
            return "";
        } else{
            return "Podany pesel jest nieprawidłowy.";
        }
    
        } else {
        return "Podany pesel jest nieprawidłowy.";
    }   
}

export function validateCountry(COUNTRY_FIELD_ID){
    return alphabetOnly(COUNTRY_FIELD_ID);
}

export function validatePostalCode(POSTAL_CODE_FIELD_ID){
    return noSpecialCharacters(POSTAL_CODE_FIELD_ID);
}

export function validateCity(CITY_FIELD_ID){
    return alphabetOnly(CITY_FIELD_ID);
}

export function validateStreet(STREET_FIELD_ID){
    return noSpecialCharacters(STREET_FIELD_ID);
}

export function validateHouseNr(HOUSE_NR_FIELD_ID) {
    let houseNrInput = document.getElementById(HOUSE_NR_FIELD_ID).value;

    if (!(RegExp("^\\d+[a-zA-Z]?$").test(houseNrInput))){
        return "Numer domu może zawierać tylko cyfry i opcjonalnie jedną literę.";
    }else{
        return "";
    }
}

export function validatePhone(PHONE_FIELD_ID) {
    let phoneInput = document.getElementById(PHONE_FIELD_ID).value;

    if (!(/^\d+$/.test(phoneInput))){
        return "Numer telefonu może składać się tylko z cyfr.";
    }else{
        return "";
    }
}

export function validateFile(IMAGE_FIELD_ID) {
    let filePath = document.getElementById(IMAGE_FIELD_ID).value;
          
            var allowedExtensions =  
                    /(\.jpg|\.jpeg|\.png)$/i; 
              
            if (allowedExtensions.exec(filePath) !== null) { 
                return "";
            }  
            else  
            { 
                document.getElementById(IMAGE_FIELD_ID).value = ''
                return 'Nieprawidłowy format pliku. Dozwolone rozszerzenia: .jpg, .jpeg, .png.'; 
            } 
}

export function isLoginAvailable() {
    return Promise.resolve(checkLoginAvailability().then(function (statusCode) {
        if (statusCode === HTTP_STATUS.OK) {
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