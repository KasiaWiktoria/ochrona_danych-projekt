from flask import Flask, render_template, make_response, session, url_for, redirect, request, jsonify, send_from_directory#, logging
import logging
from werkzeug.utils import secure_filename
import hashlib
from uuid import uuid4
from flask_sqlalchemy import SQLAlchemy
import datetime
import os

from .const import *
#from note import Note


app = Flask(__name__, static_url_path="")

app.config ['SQLALCHEMY_DATABASE_URI'] =  os.getenv("DATABASE_URL", "sqlite://")
app.config ['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config ['MEDIA_FOLDER'] = './user-files'
app.config['SECRET_KEY'] = SECRET_KEY
SALT = os.getenv('SALT')

log = app.logger #logging.create_logger(app)
db = SQLAlchemy(app)

@app.before_first_request
def before_first_request():
    logging.basicConfig(level=logging.DEBUG)
'''
users = db.Table('users',
    db.Column('id', db.Integer, primary_key=True),
    db.Column('title', db.String(200)),
    db.Column('author', db.String(50)),
    db.Column('date', db.DateTime, default=datetime.datetime.utcnow),
    db.Column('text', db.String(500))
)
'''
class Note(db.Model):
    __tablename__ = "notes"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text(200))
    author = db.Column(db.String(70))
    date = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    text = db.Column(db.Text(500))

    def __init__(self, title, author, date, text):
        self.__title = title
        self.__author = author
        self.__date = date
        self.__text = text

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(128), unique=True, nullable=False)
    login = db.Column(db.String(70), unique=True, nullable=False)
    passwd_hash = db.Column(db.Text(150), nullable=False)

    def __repr__(self):
        return '<User %r>' % self.login

class Session(db.Model):
    __tablename__ = "sessions"

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(128), unique=True, nullable=False)
    user = db.Column(db.String(70), unique=True, nullable=False)
    _hash = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return '<Session %r>' % self.session_id

db.create_all()

@app.route("/")
def index():
    username = 'adm'
    user = User.query.filter_by(login=username).first()

    if user is None:
        log.debug('user ----- none')
    else:
        log.debug(f'user {user}')
    return render_template("index.html")

@app.route("/login", methods=[GET,POST])
def login():
    if request.method == POST:
        username = request.form[LOGIN_FIELD_ID]
        password = request.form[PASSWD_FIELD_ID]
        user = User.query.filter_by(login=username).first()

        if user is not None:
            log.debug("Użytkownik " + username + " jest w bazie danych.")
            if check_passwd(username,password):
                log.debug("Hasło jest poprawne.")
                hash_ = uuid4().hex 
                try:
                    new_session = Session(session_id=SESSION_ID, user=username, _hash=hash_)
                    db.session.add(new_session)
                    db.session.commit()
                except Exception as e:
                    log.debug(e)
                session.permanent = True
                session['user'] = username
                log.debug('okokokok')
                response = make_response(jsonify({ 'logged_in': 'OK'}))
                response.set_cookie(SESSION_ID, hash_,  max_age=300, secure=True, httponly=True)

                return response
            else:
                log.debug('złe hasło')
                response = make_response("Błędny login lub hasło", 400)
                return response
        else:
            response = make_response("Błędny login lub hasło", 400)
            return response 
    else:
        return render_template("login.html")

def check_passwd(username, password):
    log.debug('sprawdzenie hasła')
    password = (password+SALT).encode("utf-8")
    passwd_hash = hashlib.sha256(password).hexdigest()
    hash_from_db = User.query.filter_by(login=username).first().passwd_hash
    log.debug('pobrano hasło z bazy danych')
    p_hash = passwd_hash[:50]
    log.debug(f'hash dla podanego hasła: {p_hash}')
    log.debug(f'hash dla hasła z bazy danych: {hash_from_db}')
    log.debug(f'Wynik porównania: {p_hash == hash_from_db}')
    return p_hash == hash_from_db

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

        try:
            registration_status = add_user(email, login, password)
            return { "registration_status": registration_status }, 200
        except:
            return { "registration_status": 400 }, 400
    else:
        return render_template("registration.html")

def add_user(email, login, password):
    log.debug("Login: " + login )
    try:
        passwd_to_hash = (password+SALT).encode("utf-8")
        hashed_password = hashlib.sha256(passwd_to_hash).hexdigest()
        log.debug("ok")
        new_user = User(email=email, login=login, passwd_hash=hashed_password[:50])
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

@app.route("/notes_list")
def notes_list():
    user = session['user']
    notes = User.query.filter_by(login=user).all()
    log.debug(notes)
    return render_template("notes_list.html", notes=notes)

@app.route("/add_note", methods=[GET,POST])
def add_note():
    if request.method == POST:
        return 
    else:
        return render_template("add_note.html")

@app.route("/media/<path:filename>")
def mediafiles(filename):
    return send_from_directory(app.config["MEDIA_FOLDER"], filename)


@app.route("/upload", methods=["GET", "POST"])
def upload_file():
    if request.method == "POST":
        file = request.files["file"]
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config["MEDIA_FOLDER"], filename))
    return f"""
    <!doctype html>
    <title>upload new File</title>
    <form action="" method=post enctype=multipart/form-data>
      <p><input type=file name=file><input type=submit value=Upload>
    </form>
    """

def active_session():
    log.debug(request.cookies.get(SESSION_ID))
    hash_ = request.cookies.get(SESSION_ID)
    try:
        session['username']
    except:
        return False

    if hash_ is not None:
        return True
    else:
        return False
