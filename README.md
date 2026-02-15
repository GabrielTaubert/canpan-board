# run PostgreSQL (Ubuntu)

## Step 1 - Install PostgreSQL

Install PostgreSQL via apt:

```bash
sudo apt update
sudo apt install postgresql
```

Check if installation was successful:

```bash
psql --version
```

## step 2 - Check if PostgreSQL service is running

PostgreSQL runs as a background service.

Check status:

```bash
sudo systemctl status postgresql
```

If it is not running, start it:

if not

```bash
sudo systemctl start postgresql
```

## Step 3 - initialize database Initial database setup (first time only)

For the first setup you must create the project database and user.

Login as PostgreSQL admin user:

```bash
sudo -u postgres psql
```

You are now inside the PostgreSQL terminal.

Create database and user:

```sql
CREATE USER canpan_user WITH PASSWORD 'canpan_pw';
CREATE DATABASE canpan_board OWNER canpan_user;
GRANT ALL PRIVILEGES ON DATABASE canpan_board TO canpan_user;
```

This creates the database **canpan_board** and the user **canpan_user** with the password **canpan_pw**

Exit the PostgreSQL terminal:

```bash
\q
```

## Step 4 - Test database connection

Connect to the newly created database:

```bash
psql -h localhost -U canpan_user -d canpan_board
```

Enter password: **canpan_pw**. 

If everything works, you should see:

```bash
canpan_board=>
```

Run a test query:

```bash
SELECT 1;
```