# API documentation

All API calls are prefixed with `/api` base.

API is composed of two parts :
- `/stations`, a REST API for client and  business apps
- `/workers`, a simple API to control workers

## Available routes

For `stations` routes, add `/station` prefix to base.

|Method|Route|Description|
|---|---|---|
|GET|`/stations`|List all stations in `stations_static`|
|GET|`/stations/find/:name`|Find stations whose name contains _name_|
|GET|`/stations/near/:longitude/:latitude`|Find stations near [_longitude_, _latitude_]|
|GET|`/stations/:id`|Find station by _:id_|
|GET|`/stations/activate/:x1/:y1/:x2/:y2`|Activate stations contained in area [_x1_, _y1_, _x2_, _y2_]|
|GET|`/stations/activate/:x1/:y1/:x2/:y2`|Deactivate stations contained in area [_x1_, _y1_, _x2_, _y2_]|
|POST|`/stations/`|Add a station in `stations_static`|
|PUT|`/stations/:id`|Modify a station with specific _:id_|
|DELETE|`/stations/:id`|Delete a station with specific _:id_ and all records in `stations_dynamic` linked to it|

For `workers` routes, add `/workers` prefix to base.

|Method|Route|Description|
|---|---|---|
|GET|`/static`|Reinitialize `stations_static` collection|
|GET|`/dynamic`|Toggle automatic dynamic update of `stations_dynamic` collection|
|GET|`/dynamic/clear`|Reinitialize `stations_dynamic` collection|
