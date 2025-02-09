# csv2mysql-transform
Loads csv file into mysql database and allows per row transformation

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

## Usage Example

Run the script with the following command:

```bash
node csvmysqltload.js mytable data.csv 100
