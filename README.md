## Installation
Clone the repo, then
```bash
docker compose up --build

docker compose up --build -d
```
#### Accessing the Services
Frontend: http://localhost:5173
Backend API: http://localhost:8000/api/
Django Admin: http://localhost:8000/admin/

---


## Feature 1
I was already familiar with this type of problem beacuse i had solved similar graph problem on Leetcode (Course Schedule).

my approach
- each movie represent as a node
- dependencies are represent as neibours of that node.
- visited array to track the visited node and path_visited array to check that if the same node appears twich on a same path.
- before creating a movie, a temporary graph will be crated and that graph must be check for circular dependencies
- if cycle exists, the application will return the required error
- otherwise, the prerequisites are traversed to dermine a valid viewing order

## Feature 2
The second feature required a Dynamic Programming (DP) approach.
At the time of working on this assignment, i was actively practicing graph problems and had not yet started studying DP in dept. However, i was familiar with the Coin change problem and its minimum coins variation.

---

I used Antigravity (AI coding agent) as a development assistant during this assignment.

Backend

- I worked on understanding the graph and Dynamic Programming problems and their underlying approaches.
- I used Antigravity to assist with generating Django REST Framework serializers and API endpoints.
- I reviewed the generated code and used it to integrate the API layer with the feature logic.

Frontend

- I used Antigravity to build the frontend application.
- provided the requirements, UI/UX direction, and functional expectations.
- reviewed the generated frontend and connected it with the backend APIs.