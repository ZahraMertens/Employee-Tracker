const express = require('express');
const fs = require('fs');
//const mysql = require('mysql2');
const inquirer = require('inquirer');
const connectDb = require("./config/connection")

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

function startPrompts(){
        inquirer.prompt([
            {
                type: "list",
                message: "What would you like to do?",
                name: "viewOptions",
                choices: [
                    "View all departments",
                    "View all roles",
                    "View all employees",
                    "Add a department",
                    "Add a role",
                    "Add an employee",
                    "Update an employee role"
                ]
            }
        ])
        .then(function(data){
            const selectedOpt = data.viewOptions;
            switch(selectedOpt){
                case "View all departments":
                    if (selectedOpt === "View all departments"){
                        return viewDepartment();
                    }
                case "View all roles":
                    if (selectedOpt === "View all roles"){
                        return viewRoles();
                    }
                case "View all employees":
                    if (selectedOpt === "View all employees"){
                        return viewEmployees();
                    }
                case "Add a department":
                    if (selectedOpt === "Add a department"){
                        return addDepartment();
                    }
                case "Add a role":
                    if (selectedOpt === "Add a role"){
                        return addRole();
                    }
                case "Add an employee":
                    if (selectedOpt === "Add an employee"){
                        return addEmployee();
                    }
                case "Update an employee role":
                    if (selectedOpt === "Update an employee role"){
                        return updateRole();
                    }
            }
        })
}

const viewDepartment = function () {
    const sql = "SELECT * FROM department";

    connectDb.query(sql, (err, result) => {
     if (err) {
         console.error(err)
     } else {
         console.table(result)
         startPrompts();
     }
    });
}

const viewRoles = function () {
    const sql = "SELECT * FROM role";

    connectDb.query(sql, (err, result) => {
     if (err) {
        console.error(err)
     } else {
        console.table(result)
        startPrompts();
     }
    });
}

const viewEmployees = function () {
    const sql = "SELECT * FROM employee";

    connectDb.query(sql, (err, result) => {
     if (err) {
         console.error(err)
     } else {
         console.table(result)
         startPrompts();
     }
    });
}

const addDepartment = function () {
    inquirer.prompt([
        {
            type: "text",
            message: "What is the name of the department?",
            name: "addDepartment",
        }
    ])
    .then(function(data){
        console.log(data.addDepartment)
        const departmentInput = data.addDepartment;
        const sql = `INSERT INTO department (department_name) params (?)`

        connectDb.query(sql, departmentInput, (err, result) => {
            if (err) {
                console.error(err)
            } else {
                console.log("\x1b[33m", `\n------  Database has been updated! ------\n`);
                viewDepartment();
            }
           });

    })
}

const addRole = function () {
    inquirer.prompt([
        {
            type: "text",
            message: "What is the role title?",
            name: "role_title",
        },
        {
            type: "text",
            message: "What is the roles salary?",
            name: "role_salary",
        },
        {
            type: "text",
            message: "What is the roles department id?",
            name: "role_department", //trim value
        }
    ])
    .then(function(data){
       // console.log(data.role_title, data.role_salary, data.role_department) //Test 12345 1
        // Check if department exists already
        let title = data.role_title;
        let salary = data.role_salary;
        let departmentid;
        // console.log(roleInput)//[ 'Test', '12345', '1' ]

        connectDb.query("SELECT * FROM department", (err, result) => {
            if (err) {
                console.error(err)
            } else {
                //console.log(result)
                //Parse Row Data Obj into Obj to access data
                const obj = Object.params(JSON.parse(JSON.stringify(result)));
                //console.log(obj)

                //Check if user input for department matches any existing department name
                obj.forEach(function(val) {

                    //If the department exists the department id of the added role will be the same
                    // as the exsing department
                    if (val.department_name == data.role_department) {
                        
                        const getId = val.id;
                        const roleInput = [title, salary, getId]
                        return addRoleExistingDep(roleInput);

                     }// else if (val.department_name !== data.role_department){
                    //     return addRoleNewDepartment();
                    // }
                    
                })
            }
        });
    })
}

function addRoleExistingDep(roleInput){

    let sql = `INSERT INTO role (role_title, role_salary, department_id) params (?)`

    connectDb.query(sql, [roleInput], (err, result) => {
        if (err) {
            console.error(err)
        } else {
            console.log("\x1b[33m", `\n------  Database has been updated! ------\n`);
            viewRoles();
        }
    });
};

// function addRoleNewDepartment(){
//     console.log("test")
// }

const addEmployee = async function () {
    inquirer.prompt([
        {
            type: "text",
            message: "What is the eomplyees first name?",
            name: "fist_name",
        },
        {
            type: "text",
            message: "What is the employees last name?",
            name: "last_name",
        },
        {
            type: "list",
            message: "What is the employees role?",
            name: "role_title", //trim value
            choices: await getRoles(updateEmp.department)
        },
        {
            type: "text",
            message: "Who is the employees manager?",
            name: "role_department", //trim value
        }
    ])
    .then(function(data){
       //write query to add employee
    })
}

const updateRole = async function () {
    let updateEmp = await inquirer.prompt([
		{
			"type": "list",
			"name": "name",
			"message": "Which employee would you like to update?",
			"choices": await getEmployees()
		},
		{
			"type": "list",
			"name": "department",
			"message": "In which department is the role categorised?",
			"choices": await roleDepartment() //Use distinct to not make it repeat
		}
	]);

    updateEmp = Object.assign(updateEmp, await inquirer.prompt([
		{
			"type": "list",
			"name": "role",
			"message": "What is the employee's role?",
			"choices": await getRoles(updateEmp.department)
		}
    ]));

    const sql = "UPDATE employee SET ? WHERE ? AND ?";
	const param_array = [
		{
			role_id: await getRoleId(updateEmp.role)
		},
		{
			first_name: updateEmp.name.split('')[0]
		},
		{
			last_name: updateEmp.name.split('')[1]
		}
	];

	connectDb.query(sql, param_array, (err) => {
		if (err) throw err;
		showUpdatedEmployee(updateEmp.name);
	});
}

function showUpdatedEmployee (name) {

    const params = name;

    const sql = 
    `SELECT role.role_title, role.role_id, employee.first_name, employee.last_name, employee.employee_id, employee.manager_id 
    FROM role 
    LEFT JOIN employee 
    ON role.role_id = employee.role_id WHERE CONCAT(first_name, ' ', last_name) = ?`;

    connectDb.query(sql, params, (err, result) => {
        if (err) {
            console.error(err)
        } else {
            console.table(result);
            startPrompts();
        }
    });
}

function getEmployees () {
    const sql = "SELECT CONCAT(first_name, ' ', last_name) AS 'name' FROM employee ORDER BY employee_id, first_name;";

    return new Promise((resolve) => {
        
        connectDb.query(sql, (err, result) => {
            if (err) {
            console.error(err)
            } else {
            resolve(result.map(employee => employee.name))
            }
        })
    })
}

function roleDepartment () {
    const sql = "SELECT department_name FROM department ORDER BY id, department_name;";

	return new Promise((resolve) => {
		connectDb.query(sql, (err, result) => {
			if (err) throw err;
			resolve(result.map(department => department.department_name));
		});
	});
}

async function getRoles(department) {

	const sql = "SELECT role_title FROM role WHERE department_id = ? ORDER BY department_id, role_title;"
	const params = [await getDepartmentId(department)];

	return new Promise ((resolve) => {
		connectDb.query(sql, params, (err, result) => {
			if (err) throw err;
			resolve(result.map(role => role.role_title));
		});
	});
}

function getDepartmentId(department) {
	const sql = "SELECT id FROM department WHERE department_name = ?";
	const params = [department];

	return new Promise ((resolve) => {
		connectDb.query(sql, params, (err, result) => {
			if (err) throw err;
			resolve(result[0].id);
            console.log(result[0].id)
		});
	});
}

function getRoleId(role) {
	const sql = "SELECT role_id FROM role WHERE role_title = ?";
	const param = [role];

	return new Promise((resolve) => {
		connectDb.query(sql, param, (err, result) => {
			if (err) throw err;
			
            console.log(result)
            resolve(result[0].role_id);
            
		});
	});
}

const init = async () => {
    await console.log("\x1b[32m", "\n========================== Welcome to the Employee's Database! ==========================\n");
    startPrompts();
}

init();
