# mongodb-project

## Requirements

### Packages

Required packages are in `/package.json` and `/react-ui/package.json`.

### .env files

Two .env files are required :
- in root `/.env`
```
# Database connection
DATABASE_URI=mongodb://localhost:27017/db_name
DATABASE_NAME=db_name
```
- in react folder `/react-ui/.env`
```
# API hostname
REACT_APP_API_HOST=http://localhost:5000
```

## Local run

To run projet localy :
- start server, run `npm start` in root folder `/`
- start react, run `npm start` in react folder `/react-ui`


## Production run 

To run project in production mode :
- build app, run `npm build`
- start app, run `npm start`

## Database 'structure'

See [`doc/database.md`](doc/database.md)

## API documentation

See [`doc/api.md`](doc/api.md)
