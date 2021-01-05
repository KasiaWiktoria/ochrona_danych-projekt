from flask import Flask, render_template, session, url_for, redirect
from flask import request, jsonify, logging

app = Flask(__name__, static_url_path="")
log = logging.create_logger(app)

log.debug('działa')

@app.route("/")
def index():
    log.debug('ok')
    return render_template("index.html")