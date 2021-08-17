DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;

USE employees_db;

DROP TABLE IF EXISTS department;
CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT,
  department_name VARCHAR(30) NOT NULL,
  PRIMARY KEY(id)
);

DROP TABLE IF EXISTS role;
CREATE TABLE role (
  role_id INT NOT NULL AUTO_INCREMENT,
  role_title VARCHAR(30) NOT NULL,
  role_salary DECIMAL,
  department_id INT NOT NULL,
  PRIMARY KEY (role_id)
  FOREIGN KEY (department_id)
  REFERENCES department(id)
  ON DELETE SET NULL
);

DROP TABLE IF EXISTS employee;
CREATE TABLE employee (
  employee_id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT NOT NULL,
  manager_id INT NOT NULL,
  FOREIGN KEY (role_id)
  REFERENCES role(role_id)
  ON DELETE SET NULL
);