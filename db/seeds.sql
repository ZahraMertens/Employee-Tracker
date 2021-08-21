INSERT INTO department (department_name)
VALUES ("CEO");

INSERT INTO role (role_title, role_salary, department_id)
VALUES ("Manager", 100000, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("George", "Wilson", 1, 1);