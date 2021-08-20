INSERT INTO department (department_name)
VALUES ("Web Development");

INSERT INTO role (role_title, role_salary, department_id)
VALUES ("Junior Developer", 50000, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Greg", "Test", 1, 34),
       ("Fred", "Lom", 1, 34),
       ("Zahra", "Mertens", 1, 34);