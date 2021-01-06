FROM python:3.7-alpine
WORKDIR /uwsgi-flask/notes_app

ENV FLASK_APP app.py
ENV FLASK_RUN_HOST 0.0.0.0
ENV FLASK_RUN_PORT 8880

COPY ./uwsgi-flask/notes_app /uwsgi-flask/notes_app

RUN apk add --no-cache gcc musl-dev linux-headers openssl-dev libffi-dev
RUN pip install -r requirements.txt

CMD ["flask", "run", "--cert", "adhoc"]