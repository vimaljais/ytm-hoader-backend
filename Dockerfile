# Use official Node.js version 18 as base
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Python, pip, and venv
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Create a virtual environment and activate it
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install the ytmusicapi package
RUN pip install ytmusicapi

# Copy all files
COPY . .

# Rename constant.py.env to constants.py and move it to the correct location
RUN mv .constants.py.env /opt/venv/lib/python3.11/site-packages/ytmusicapi/constants.py

# Expose the port your app runs on
EXPOSE 8080

# Define the command to run your app
CMD [ "npm", "start" ]