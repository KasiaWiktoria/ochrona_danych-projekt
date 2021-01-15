import os
GET = "GET"
POST = "POST"
SECRET_KEY = os.getenv('SECRET_KEY_FOR_APP')
URL = "https:/localhost/"

SESSION_ID = "session"
ALLOWED_EXTENSIONS = {'txt', 'doc', 'docx','pdf', 'png', 'jpg', 'jpeg', 'gif'}
LOGIN_ATTEMPT_COUNTER = 'login_attempt_counter'

EMAIL_FIELD_ID = "email"
LOGIN_FIELD_ID = "login"
PASSWD_FIELD_ID = "password"

NOTE_CONTENT_FIELD_ID = "note_content"
ENCRYPT_FIELD_ID = "encrypt"
ENCRYPT_PASSWD_FIELD_ID = "encrypt_passwd"
DECRYPT_PASSWD_FIELD_ID = "decrypt_passwd"
PUBLIC_FIELD_ID = "public"
WHO_CAN_READ_FIELD_ID = "who_can_read"
NOTE_ID_FIELD_ID ='note_id'
FILE_FIELD_ID = 'file'
