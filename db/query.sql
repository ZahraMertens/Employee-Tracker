
SELECT role.role_title, role.role_id, employee.first_name, employee.last_name, employee.employee_id, employee.manager_id
FROM role
LEFT JOIN employee
ON role.role_id = employee.role_id

SELECT department.department_name, department.department_id, role.role_title, role.role_id, role.role_salary
FROM department
LEFT JOIN role
ON department.department_id = role.department_id