# ux-titania

> configuration and monitoring ux for titania

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev
```
## Set up compass for parsing css

``` bash
# On Windows:
gem install compass

# On OS X:
sudo gem install compass

cd ux-titania/src/assets/css/sass
compass watch --poll

```
## Backend

``` bash
source .venv/bin/activate
cd vuedj
python manage.py runserver

```

``` bash
python manage.py makemigrations configtitania

# to see the sql query
python manage.py sqlmigrate configtitania 0001


python manage.py migrate
```

## Run Frontend on rpi
```
docker pull ngnix
git clone https://gitlab.libertaria.community/titania/ux-titania.git
docker run --name some-nginx -p 80:80 -v ~/ux-titania/dist:/usr/share/nginx/html:ro -d nginx

```
Then simply open the rpi's ip on your browser.
