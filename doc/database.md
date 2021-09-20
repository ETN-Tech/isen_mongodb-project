# Database structure

Database is composed of 2 collections : 
- `stations_static` for static content about stations
- `stations_dynamic` for dynamic content about stations

## `stations_static`

```json lines
{
  "_id": ObjectId(),
  "stationId": string,
  "city": string,
  "name": string,
  "geolocation": {
    "type": Point,
    "coordinates": [float, float]
  },
  "size": interger,
  "available": boolean,
  "tpe": boolean,
  "updatedAt": Date
}
```

## `stations_dynamic`

```json lines
{
  "_id": ObjectId(),
  "stationStaticId": string,
  "bikesAvailable": integer,
  "docksAvailable": integer,
  "createdAt": Date
}
```
