## Domain 
  ninjashore.com

## Powered By
 * Express.js
 * Node.js
 * mongo

## TODO
 * On the top showing number of articles done / ongoing / incomplete , if you click on it it should it to the related articles.
 * Search bar to search the articles if title and content using elastic search.
 * Each articles to have it's topics on the top of the article on home page.
 * Delete operation (DONE)
 * Order of notes should depend on the latest git log commit date (DONE)
 * auto restart mongo and app when server restarts or app crashes (DONE)
 * Seperate the loader ( use a different node to process the webhook calls ) (DONE)
 * Use pm2 to monitor Nginx
## pm2
 * pm2 start Notes/app/bin/www --watch
 * pm2 start Notes_load/app/bin/www --watch
 * pm2 start mongodb-linux-x86_64-ubuntu1804-4.1.9/bin/start-mongo.sh 
 * For logs::  pm2 logs 
 
 ## Mongo
  * Dump  
    bin/mongodump --db Ninjashore  
    This creates a directory dump/Ninjashore with 2 files Notes.metadata.json and notes.bson
  * Restore    
    bin/mongorestore --db Notes dump/Ninjashore
