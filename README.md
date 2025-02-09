# csv2mysql-transform
Loads csv file into mysql database and allows per row transformation,
per-row transformation is given in separate file loaded as argument, 
so that it can be used multiple times on per-csv/mysql table.

Also code is done using async/await and stream way, to avoid RAM memory issues.


## Example CSV Input

If your CSV file looks like this:

| **name**     | **date_column** | **value** |
|--------------|-----------------|-----------|
| John Doe     | 12/31/2022      | 100       |
| Jane Smith   | 01/15/2023      | 200       |

The `transformRow` function will convert the `date_column` values to:

| **name**     | **date_column** | **value** |
|--------------|-----------------|-----------|
| John Doe     | 2022-12-31      | 100       |
| Jane Smith   | 2023-01-15      | 200       |

---

Customizations of per-row transformation should be done in transformRow function

Requirements: 

async,csv-parser,mysql (or mysql2 you can modify code...)

## Usage Example

Run the script with the following command:

```bash
node csvmysqltload.js mytable data.csv mydatatransform.js 20
