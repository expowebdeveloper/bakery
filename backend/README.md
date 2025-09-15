# Bakery Management
The Bakery Management System is a comprehensive application designed to streamline the operations of a bakery, focusing specifically on product delivery management. In today's fast-paced world, efficient delivery services are essential for bakeries to meet customer demands and enhance satisfaction.

## Create Virtual Environment

Use following commands to create and active virtual environment
```bash
python -m venv <environment name>
source <environment_name>/bin/activate
```

## Installation of python modules.
Use following commands to install all the required python module.
```bash
cd bakery-management
pip install -r requirements.txt

```
## Create Database.
User following steps to create database.
1. Login in the Mysql terminal using following command:-

```bash
sudo mysql -u root -p
```
2. Create Database:-
```bash
create database <database_name>;
```
3. Create User:-
```bash
 CREATE USER '<user name>'@'%' IDENTIFIED BY '<password>';
```
4. Grant Access:-
```bash
 GRANT ALL PRIVILEGES ON <database_name>.* TO '<user name>'@'%';
 FLUSH PRIVILEGES;
```

## Update Env File
Update all required env values.
```bash
DEBUG=<DEBUG>
DATABASE_HOST=<DATABASE_HOST>
DATABASE_USER=<DATABASE_USER>
DATABASE_PASSWORD=<DATABASE_PASSWORD>
DATABASE_PORT=<DATABASE_PORT>
DATABASE_NAME=<DATABASE_NAME>
```
## Ran Project
User following commands to run project
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver.
```
