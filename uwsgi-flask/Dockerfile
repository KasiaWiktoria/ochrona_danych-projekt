FROM python:3.7-alpine
WORKDIR /var/www
ENV FLASK_APP app/app.py
ENV FLASK_RUN_HOST 0.0.0.0
RUN \
 apk update && \
 apk add --no-cache gcc musl-dev linux-headers && \
 apk add postgresql-dev python3-dev  
 
COPY uwsgi.ini uwsgi.ini
COPY wsgi.py wsgi.py
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
CMD ["uwsgi", "--ini", "uwsgi.ini"]
