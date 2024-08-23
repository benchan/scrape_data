# scrape_data
Email Health Check (Docker ver.)

## setting
```
cp .env.template .env
```

### edit .evn file
```
USER_NAME=xxxxxxxx
USER_PASSWORD=xxxxxxxx
BASE_URL=https://xxxxxxxxxxxxxx/reditor/kanri/
```

## build
```
docker compose build
```

## run
```
docker compose up -d
```

## results

Check a file output to the local directory.
File name: `scraped_data.tsv`