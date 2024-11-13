# OnlyBuns
Web application that presents a social network for rabbit lovers.

## Environment Setup

To run this project, you need to have the following environment setup:

- React 13.4.0
- Axios 1.7.7
- Python 3.11.9
- Django 4.1
- Django REST Framework 3.15.1
- Django CORS Headers 4.3.1

## Running the Application

To run the application, you need both backend and frontend servers to be run. 
You should open two terminals, one in 'isaproject' directory and the other one in 'frontend' directory.

### Backend server

1. Open the terminal inside the 'isaproject' directory

2. Make migrations
```bash
python manage.py makemigrations
```

3. Make migrate
```bash
python manage.py migrate
```

4. Fill the database with data using the script
```bash
python database.py
```

5. Run the server
```bash
python manage.py runserver
```

### Frontend server

1. Open the terminal inside the 'frontend' directory
   
2. Run the server
```bash
npm start
```

## Base users for testing:
| Role            | Email | Username | Password |
|-----------------|-------|----------|----------|
| Basic User | user@gmail.com | user | user |
| Admin | admin@gmail.com | admin | admin |

## ERR dijagrams
ERR class diagrams are located in the project directory

## Technologies Used
### Frontend:
- **React**: A JavaScript library for building user interfaces.
- **Axios**: A promise-based HTTP client for making API requests.
### Backend:
- **Python**: A powerful, high-level programming language.
- **Django**: A Python web framework for building robust web applications.
- **Django REST Framework**: A toolkit for building Web APIs with Django.
- **Django CORS Headers**: A Django app for handling Cross-Origin Resource Sharing (CORS), allowing AJAX requests from different domains.
