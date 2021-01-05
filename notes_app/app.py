from flask import Flask, render_template, session, url_for, redirect
from flask import request, jsonify, logging

app = Flask(__name__, static_url_path="")
log = logging.create_logger(app)

log.debug('działa')

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/registration")
def registration():
    return render_template("registration.html")

@app.route("/notes")
def notes_list():
    return render_template("notes_list.html")

@app.route("/add_note")
def add_note():
    return render_template("add_note.html")