# Use an official Node runtime as a parent image
FROM python:3.7-alpine

# Install pipenv and flask
RUN pip install pipenv

# Set the working directory to /app
WORKDIR /app

COPY Pipfile .
COPY Pipfile.lock .

# Install any needed packages specified
RUN pipenv install

# Copy the current directory contents into the container at /app
COPY . .

# Run app.py when the container launches
CMD ["pipenv","run","flask","run","-p","80","-h","0.0.0.0"]