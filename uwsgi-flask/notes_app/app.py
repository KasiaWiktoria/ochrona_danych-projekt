from flask import Flask, flash, render_template, make_response, session, url_for, redirect, request, abort, jsonify, send_from_directory#, logging
import logging
import json
from sqlalchemy.dialects.postgresql import JSON
from werkzeug.utils import secure_filename
from passlib.hash import bcrypt 
from base64 import b64encode, b64decode
from Cryptodome.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Cryptodome.Random import get_random_bytes
from Cryptodome.Protocol.KDF import PBKDF2
from flask_wtf.csrf import CSRFProtect
from uuid import uuid4
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import os
import re

from .const import *
from sqlalchemy.ext.declarative import DeclarativeMeta

app = Flask(__name__, static_url_path="")

app.config ['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3' #os.getenv("DATABASE_URL", "sqlite://")
app.config ['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(minutes=5)
app.config ['UPLOAD_FOLDER'] = '/app/user-files'
app.config['SECRET_KEY'] = SECRET_KEY

log = app.logger
db = SQLAlchemy(app)
csrf = CSRFProtect(app)

@app.before_request
def func():
  session.modified = True

@app.before_first_request
def before_first_request():
    logging.basicConfig(level=logging.DEBUG)

@app.after_request
def add_security_headers(resp):
    resp.headers['server'] = ''
    resp.headers['Content-Security-Policy']= ' default-src \'self\';font-src fonts.gstatic.com;style-src \'self\' fonts.googleapis.com \'unsafe-inline\''
    return resp


class AlchemyEncoder(json.JSONEncoder):

    def default(self, obj):
        if isinstance(obj.__class__, DeclarativeMeta):
            fields = {}
            for field in [x for x in dir(obj) if not x.startswith('_') and x != 'metadata']:
                data = obj.__getattribute__(field)
                try:
                    json.dumps(data) 
                    fields[field] = data
                except TypeError:
                    fields[field] = None
            return fields

        return json.JSONEncoder.default(self, obj)

class Note(db.Model):
    __tablename__ = "notes"

    id = db.Column(db.Integer, primary_key=True)
    author = db.Column(db.String(70))
    date = db.Column(db.DateTime, default=datetime.utcnow())
    note_content = db.Column(db.Text)
    public = db.Column(db.Boolean, default=False)
    encrypted = db.Column(db.Boolean, default=False)
    salt = db.Column(db.String(50), nullable=True)
    iv = db.Column(db.String(100), nullable=True)
    file = db.Column(db.String(150), nullable=True)
    _who_can_read = db.Column(db.String(250), nullable=True)
    @property
    def who_can_read(self):
        if self._who_can_read is None:
            return []
        else:
            return [str(x) for x in self._who_can_read.split(';')]
    @who_can_read.setter
    def who_can_read(self, value):
        self._who_can_read = ''
        self._who_can_read += ';%s' % value

class File(db.Model):
    __tablename__ = "files"

    id = db.Column(db.Integer, primary_key=True)
    file_uuid = db.Column(db.String(150), unique=True, nullable=False)
    file_name = db.Column(db.String(150), nullable=False)
    
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(128), unique=True, nullable=False)
    login = db.Column(db.String(70), unique=True, nullable=False)
    passwd_hash = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return '<User %r>' % self.login

class Session(db.Model):
    __tablename__ = "sessions"

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(128), unique=True, nullable=False)
    user = db.Column(db.String(70), nullable=False)
    _hash = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return '<Session %r>' % self.session_id

class LoginAttempt(db.Model):
    __tablename__ = "loginAttemptsForIp"

    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(100), nullable=False)
    login_attempt_date = db.Column(db.DateTime)
    success = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Loggin Attempt for {self.ip_address}: {self.login_attempts} success: {self.success}>' 
db.create_all()


@app.route("/")
def index():
    log.debug(f'ścieżka: {os.getcwd()}')
    ip_address = request.remote_addr
    log.debug(f'IP adress: {ip_address}')
    minute_ago = datetime.utcnow() - timedelta(seconds=60)
    attempts_count = len(LoginAttempt.query.filter(LoginAttempt.ip_address==ip_address, LoginAttempt.login_attempt_date > minute_ago).all())

    log.debug(f'ile jest dat logowania pomiędzy: {attempts_count}')
    return render_template("index.html", loggedin=active_session())

@app.route("/login", methods=[GET,POST])
def login():
    if request.method == POST:
        username = request.form[LOGIN_FIELD_ID]
        password = request.form[PASSWD_FIELD_ID]
        user = User.query.filter_by(login=username).first()

        ip_address = request.remote_addr
        log.debug(f'IP adress: {ip_address}')

        minute_ago = datetime.utcnow() - timedelta(seconds=60)
        attempts_count = len(LoginAttempt.query.filter(LoginAttempt.ip_address==ip_address, LoginAttempt.login_attempt_date > minute_ago, LoginAttempt.success==False).all())
        log.debug(f'Liczba prób zarejestrowana w bazie danych w ciągu ostatniej minuty: {attempts_count}')
        n = attempts_count
        if n is not None and n > 3:

            response = make_response(jsonify({'msg': "Wykorzystałeś limit prób logowania. Spróbuj ponownie za 60 s", "status": 403}), 403)
            return response

        if user is not None:
            log.debug("Użytkownik " + username + " jest w bazie danych.")
            hash_from_db = User.query.filter_by(login=username).first().passwd_hash
            if bcrypt.using(rounds=15).verify(password, hash_from_db):
                log.debug("Hasło jest poprawne.")
                hash_ = uuid4().hex 
                '''
                try:
                    new_session = Session(session_id=SESSION_ID, user=username, _hash=hash_)
                    db.session.add(new_session)
                    db.session.commit()
                except Exception as e:
                    log.debug(e)
                '''
                session.permanent = True
                session['user'] = username
                log.debug('okokokok')
                response = make_response(jsonify({'msg': "Zalogowano pomyślnie", "status": 200}), 200)
                response.set_cookie(SESSION_ID, hash_,  max_age=300, secure=True, httponly=True)

                try:
                    new_ip_addr = LoginAttempt(ip_address=ip_address, login_attempt_date=datetime.utcnow(), success=True)
                    db.session.add(new_ip_addr)
                    db.session.commit()
                except Exception as e:
                    log.debug(e)

                return response

        if not n:
            n = 0
        n+=1
        response = make_response(jsonify({LOGIN_ATTEMPT_COUNTER: n, 'msg': "Błędny login lub hasło", "status": 400}), 400)

        try:
            new_ip_addr = LoginAttempt(ip_address=ip_address, login_attempt_date=datetime.utcnow())
            db.session.add(new_ip_addr)
            db.session.commit()
        except Exception as e:
            log.debug(e)

        return response 

    else:
        if not active_session():
            return render_template("login.html", loggedin=active_session())
        else:
            return make_response(render_template("errors/already-logged-in.html", loggedin=active_session()))

@app.route("/logout")
def logout():
    if active_session():
        hash_ = request.cookies.get(SESSION_ID)
        session.pop('username', None)
        session.clear()
        response = make_response(render_template("index.html", loggedin=False))
        response.set_cookie(SESSION_ID, hash_, max_age=0, secure=True, httponly=True)
        return response
    else:
        return make_response(render_template("index.html", loggedin=active_session()))

@app.route("/registration", methods=[GET,POST])
def registration():
    if request.method == POST:
        email = request.form[EMAIL_FIELD_ID]
        login = request.form[LOGIN_FIELD_ID]
        password = request.form[PASSWD_FIELD_ID]
        log.debug(f'email: {email}, login: {login}')
        if not validateEmail(email):
            log.debug('email nie przeszedł walidacji')
            return { "registration_status": 400 , 'message': 'Niepoprawna forma adresu email.'}, 400
        if not login.isalpha():
            log.debug('login nie przeszedł walidacji')
            return { "registration_status": 400 , 'message': 'Login może składać się tylko z liter.'}, 400
        try:
            registration_status = add_user(email, login, password)
            return { "registration_status": registration_status, 'message': 'Zarejestrowano pomyślnie'}, 200
        except:
            log.debug('Nie udało się zapisać danych do bazy.')
            return { "registration_status": 400 , 'message': 'Nie udało się zapisać danych do bazy.'}, 400
    else:
        if not active_session():
            return render_template("registration.html", loggedin=active_session())
        else:
            abort(401)


def validateEmail(email):
    regex = re.compile(r"^[-\w\.]+@([\w-]+\.)+[\w-]{2,4}$")
    if(re.search(regex,email)):  
        return True  
    else:  
        return False
            

def add_user(email, login, password):
    log.debug("Login: " + login )
    try:
        hashed_password = bcrypt.using(rounds=15).hash(password)
        log.debug("ok")
        new_user = User(email=email, login=login, passwd_hash=hashed_password)
        log.debug("dodawanie do bazy danych")
        log.debug(new_user)
        log.debug(User.query.all())

        db.session.add(new_user)
        db.session.commit()

        return "OK"
    except Exception as e:
        errors.append("Unable to add item to database.")
        log.debug(e)
        return "Rejected!"

@app.route("/get_notes_list")
def get_notes_list():
    if active_session():
        log.debug('funkcja get_notes_list')
        user = session['user']
        notes = Note.query.filter(Note.author==user).all()
        for note in notes:
            note.date = note.date.strftime('%d %B %Y - %H:%M:%S')
        log.debug(notes)
        return {'notes': notes}, 200
    else:
        return {'msg': 'Pobieranie notatek nie powiodło się.'}, 400

@app.route("/notes_list")
def notes_list():
    if active_session():
        user = session['user']
        notes = Note.query.filter((Note.author==user) | (Note.public==True)).all()
        notes = notes + shared_notes(user)
        encrypted_notes_ids_list = []
        file_names = {}
        for note in notes:
            if note.file:
                file = File.query.filter_by(file_uuid=note.file).first()
                file_names[note.file] = file.file_name
            if note.encrypted:
                encrypted_notes_ids_list.append(note.id)
            log.debug(f'data: {note.date}, format: {type(note.date)} ')
            if type(note.date) is not str:
                note.date = note.date.strftime('%d %B %Y - %H:%M:%S')
            
        log.debug(notes)
        return render_template("notes_list.html", notes=notes, loggedin=active_session(), encrypted_notes_ids_list=encrypted_notes_ids_list, file_names=file_names)
    else:
        abort(401)

def shared_notes(user):
    shared_notes = []
    notes = Note.query.filter(Note.author!=user, Note.public!=True).all()
    for note in notes:
        log.debug(f'note_content: {note.note_content} ')
        user_db = User.query.filter_by(login=user).first()
        log.debug(f'kto może przeczytać tą notatkę: {note.who_can_read}')
        log.debug(f'email użytkownika: {user_db.email}')
        if user_db.email in note.who_can_read:
            shared_notes.append(note)
    return shared_notes

@app.route("/add_note", methods=[GET,POST])
def add_note():
    log.debug('funkcja add_note')
    if request.method == POST:
        user = session['user']
        log.debug(request.form)

        try:
            note_content = request.form[NOTE_CONTENT_FIELD_ID]
            encrypt = request.form[ENCRYPT_FIELD_ID]
            public = request.form[PUBLIC_FIELD_ID]
            who_can_read = request.form[WHO_CAN_READ_FIELD_ID]
            f = request.files[FILE_FIELD_ID]
        except Exception as e:
            log.debug(f'błąd: {e}')
            return make_response(jsonify({"msg": 'błąd z wczytaniem danych z formularza', "status":400}), 400)

        log.debug(f'encrypt: {encrypt}, public: {public}, who_can_read: {who_can_read} ')
        newNote = Note(author=user, date=datetime.utcnow())

        log.debug('pobranie zmiennych z formularza')
        log.debug(f'note content: {note_content} ')

        if encrypt == 'true':
            log.debug('zaszyfrowana notatka')
            encrypt_passwd = request.form[ENCRYPT_PASSWD_FIELD_ID]
            newNote.encrypted = True
            newNote.note_content, newNote.salt, newNote.iv = encrypt_note_content(note_content,encrypt_passwd)
        else:
            log.debug('niezaszyfrowana notatka')
            newNote.note_content = note_content

        if public == 'true':
            log.debug('publiczna notatka')
            newNote.public = True
        elif who_can_read != 'null':
            log.debug('lista osób które mogą czytać')
            log.debug(f'id nowej notatki: {newNote.id} ')
            log.debug(f'kto może czytać: {who_can_read}')
            who_can_read = who_can_read.split(',')
            for u in who_can_read:
                if validateEmail(u):
                    log.debug(f'użytkownik: {u}')
                    newNote.who_can_read = u
                else:
                    log.debug(f'niepoprawna forma adresu email: {u}')
        log.debug(f'plik: {f}')
        if f:
            filename_extension = f.filename.rsplit('.', 1)[1].lower()
            log.debug(f'rozszerzenie pliku: {filename_extension}')
            file_uuid = str(uuid4()) + '.' + filename_extension
            if not allowed_file(f.filename):
                return make_response(jsonify({"msg": 'Dadanie notatki nie powiodło się. Niewłaściwy format pliku.', "status":400}), 400)
            try:
                uuid_filename = secure_filename(file_uuid)
                log.debug(f'plik: {f.filename}')
                log.debug(f'ścieżka: {uuid_filename}')
                f.save(os.path.join(app.config['UPLOAD_FOLDER'], uuid_filename))
                try:
                    newNote.file = file_uuid
                    newFile = File(file_uuid=file_uuid, file_name=f.filename)
                    db.session.add(newFile)
                    db.session.commit()
                except Exception as e:
                    log.debug(e)
                    log.debug('zapisywanie pliku do bazy nie powiodło się.')
                    return make_response(jsonify({"msg": 'Dadanie notatki nie powiodło się. Nie udało się zapisać pliku do bazy.', "status":400}), 400)

            except Exception as e:
                log.debug(e)
                log.debug('zapisywanie pliku nie powiodło się')
                return make_response(jsonify({"msg": 'Dadanie notatki nie powiodło się. Nie udało się zapisać pliku.', "status":400}), 400)

        try:
            log.debug('dodanie notatki do bazy danych')
            db.session.add(newNote)
            db.session.commit()
        except Exception as e:
            log.debug(e)
            log.debug('dodanie notatki do bazy danych nie powiodło się')
            return make_response(jsonify({"msg": str(e), "status":400}), 400)


        return make_response(jsonify({"msg": "ok", "status":200}), 200)
    else:
        if active_session():
            return render_template("add_note.html", loggedin=active_session())
        else:
            abort(401)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def encrypt_note_content(note_content, password):
    salt = get_random_bytes(16)
    key = PBKDF2(password.encode('utf-8'),salt)
    to_encrypt = note_content.encode('utf-8')

    log.debug(f'key: {key}')
    log.debug(f'key: {len(key)}')

    cipher = AES.new(key, AES.MODE_CBC)
    log.debug(f'długość iv: {len(cipher.iv)}')
    encrypted_note_bytes = cipher.encrypt(pad(to_encrypt, AES.block_size))
    iv = b64encode(cipher.iv).decode('utf-8')
    encrypted_note = b64encode(encrypted_note_bytes).decode('utf-8')
    return encrypted_note, salt, iv

@app.route("/decrypt_note", methods=[POST])
def decode_note():
    entered_passwd = request.form[DECRYPT_PASSWD_FIELD_ID]
    note_id = request.form[NOTE_ID_FIELD_ID]

    note = Note.query.filter_by(id=note_id).first()
    iv = b64decode(note.iv)
    encrypted_note = b64decode(note.note_content)

    try:
        key = PBKDF2(entered_passwd.encode('utf-8'), note.salt)
        cipher = AES.new(key, AES.MODE_CBC, iv)
        decrypted_note = unpad(cipher.decrypt(encrypted_note), AES.block_size).decode("utf-8") 
        log.debug(f'odszyfrowana notatka: {decrypted_note} ')
        return jsonify({'message': 'Poprawnie odszyfrowano notatkę.', 'decrypted_note_content': decrypted_note, 'status':200}), 200
    except ValueError:
        return jsonify({'message': 'Błędne hasło.', 'status':400}), 400

@app.route('/uploads/<path:filename>')
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'],
                               filename, as_attachment=True)

def active_session():
    try:
        hash_ = request.cookies.get(SESSION_ID)
        user = session['user']
        log.debug(f'user: {user}')
    except:
        return False

    if hash_ is not None:
        return True
    else:
        return False




@app.errorhandler(400)
def bad_request(error):
    return make_response(render_template("errors/400.html", error=error, loggedin=active_session()), 400)

@app.errorhandler(401)
def page_unauthorized(error):
    return make_response(render_template("errors/401.html", error=error, loggedin=active_session()),401)

@app.errorhandler(403)
def forbidden(error):
    return make_response(render_template("errors/403.html", error=error, loggedin=active_session()),403)

@app.errorhandler(404)
def page_not_found(error):
    return make_response(render_template("errors/404.html", error=error, loggedin=active_session()),404)
    
@app.errorhandler(500)
def internal_server_error(error):
    return make_response(render_template("errors/500.html", error=error, loggedin=active_session()),500)
