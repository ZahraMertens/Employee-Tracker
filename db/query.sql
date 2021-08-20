
SELECT role.role_title, role.role_id, employee.first_name, employee.last_name, employee.employee_id, employee.manager_id
FROM role
LEFT JOIN employee
ON role.role_id = employee.role_id