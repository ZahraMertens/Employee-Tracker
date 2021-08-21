const inquirer = require('inquirer');
const connectDb = require("./config/connection")

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

//------------------ ALL VIEW FUNCTIONS TO SEE TABLE OF DEPARTMENT/ROLE/EMPLOYEE ---------//
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
    //Join statement to add department_name to role table
    const sql = `SELECT department.department_name, department.id, role.role_title, role.role_id, role.role_salary
    FROM department
    LEFT JOIN role
    ON department.id = role.department_id
    WHERE role.role_id IS NOT NULL`;

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
    //Join statement to see relations between department, role and employee
    const sql = `SELECT 
    employee.employee_id,
    employee.first_name, 
    employee.last_name,
    employee.manager_id AS emp_id_of_manager,
    role.department_id,
    department.department_name,
    role.role_title, 
    role.role_id,
    role.role_salary
    FROM role
    LEFT JOIN employee
    ON role.role_id = employee.role_id
    LEFT JOIN department
    ON department.id = role.department_id
    WHERE employee.employee_id IS NOT NULL`;

    connectDb.query(sql, (err, result) => {
     if (err) {
         console.error(err)
     } else {
         console.table(result)
         startPrompts();
     }
    });
}

//------------------ ALL ADD FUNCTIONS TO ADD DEPARTMENT/ROLE/EMPLOYEE ---------//

const addDepartment = function () {
    inquirer.prompt([
        {
            type: "text",
            message: "What is the name of the department?",
            name: "addDepartment",
        }
    ])
    .then(function(data){
        const param = data.addDepartment
        const sql = `INSERT INTO department (department_name) VALUES (?)`

        connectDb.query(sql, [param], (err, result) => {
            if (err) {
                console.error(err)
            } else {
                console.log("\x1b[33m", `\n------  ${param} has been added to the department table ------\n`);
                viewDepartment();
            }
        });
    })
}

async function addRole () {
    const newRole = await inquirer.prompt([
        {
            type: "list",
            message: "Which department does the role belong to?",
            name: "department",
            choices: await getDepartment()
        },
        {
            type: "input",
            message: "What is the role title?",
            name: "role_title"//,
            //validate: checkExistingRole
        },
        {
            type: "input",
            message: "What is the salary for the role?",
            name: "role_salary"
        }
    ])

    // const roleTitle = newRole.role_title;
    const sql = `INSERT INTO role SET ?`;

    const params = [
        {
            role_title: newRole.role_title, 
            role_salary: newRole.role_salary, 
            department_id: await getDepartmentId(newRole.department)
        }
    ]
                
    connectDb.query(sql, params, (err, result) => {
        if (err) {
            console.error(err)
        } else {
            viewNewRole(newRole.role_title)
        }
    })
}

//View new role function to only see the new role instead of the whole table
function viewNewRole (title) {

    const sql = `SELECT * FROM role WHERE role_title = ?`
    const param = title;

    connectDb.query(sql, param, (err, result) => {
        if (err) {
            console.error(err)
        } else {
            console.table(result)
            startPrompts();
        }
    })

}

// async function checkExistingRole (input) {

//     const sql = `SELECT role_title FROM role WHERE role_title = ?`;
//     const param = [input]

//     connectDb.query(sql, param, (err, result) => {
//         if (err) {
//              console.error(err)
//         } else {
//             let emptyArray = [];
//             console.log(result)
//             const objRole = JSON.parse(JSON.stringify(result))
//             console.log(objRole);
//             const roleTitle = objRole[0].role_title
//             //console.log(objRole[0].role_title)
//             //console.log(input)

//             if (input === roleTitle){
//                 console.log("Already exists")
//                 return false
//             } else {
//                 console.log("New Role")
//                 return true
//             }
                         
//         }
//     })
// }

//Add new employee to employee_db 
const addEmployee = async function () {
    //Await first prompts to be able to look for all role titles as they depend on the department
    let addEmp = await inquirer.prompt([
        {
            type: "text",
            message: "What is the eomplyees first name?",
            name: "first_name",
        },
        {
            type: "text",
            message: "What is the employees last name?",
            name: "last_name",
        },
        {
            type: "list",
            message: "In which department is the employee going to work?",
            name: "department", //trim value
            choices: await getDepartment()
        }
    ]);

    addEmp = Object.assign(addEmp, await inquirer.prompt([
        {
            type: "list",
            message: "What is the employees role?",
            name: "role_title",
            choices: await getRoles(addEmp.department)
        },
        {
            type: "list",
			name: "manager",
			message: "Who is the employee's current manager?",
			choices: await getEmployees()
        }
    ]))

    const sql = `INSERT INTO employee SET ?`
    const params = [
        {
            first_name: addEmp.first_name,
            last_name: addEmp.last_name,
            role_id: await getRoleId(addEmp.role_title),
            manager_id: await getManagerId(addEmp.manager)
        }    
    ]

    connectDb.query(sql, params, (err, result) => {
        if (err){
            console.error(err)
        } else {
            viewEmployees();
        }
    })

}

//----------------- Update employee's role function ------------------------//

const updateRole = async function () {
    let updateEmp = await inquirer.prompt([
		{
			type: "list",
			name: "name",
			message: "Which employee would you like to update?",
			choices: await getEmployees()
		},
		{
			type: "list",
			name: "department",
			message: "In which department is the role categorised?",
			choices: await getDepartment()
		}
	]);

    updateEmp = Object.assign(updateEmp, await inquirer.prompt([
		{
			type: "list",
			name: "role",
			message: "What is the employee's new role?",
			choices: await getRoles(updateEmp.department)
		}
    ]));

    const sql = "UPDATE employee SET role_id = ? WHERE CONCAT(first_name, ' ', last_name) = ?";
	const param_array = [await getRoleId(updateEmp.role), updateEmp.name]

	connectDb.query(sql, param_array, (err) => {
		if (err) throw err;
		showUpdatedEmployee(updateEmp.name);
	});
}

//Function to display table of updated employee
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



// --------- ALL HELPER FUNCTIONS TO GET THE DATA FROM ALL 3 TABLES FOR THE VIEW, ADD & UPDATE FUNCTIONS ------//

//Get employee names for prompt choices
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

//Get all existing departments for choices
function getDepartment () {
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

//Get manager id to add an employee
function getManagerId(manager) {
	const sql = "SELECT employee_id FROM employee WHERE ? AND ?"
	const params = [
		{
			first_name: manager.split(' ')[0]
		},
		{
			last_name: manager.split(' ')[1]
		}
	];

	return new Promise((resolve) => {
		connectDb.query(sql, params, (err, result) => {
			if (err) throw err;
			resolve(result[0].employee_id);
		});
	});
}

//Get Department id 
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

//Get role id 
function getRoleId(role) {
	const sql = "SELECT role_id FROM role WHERE role_title = ?";
	const param = [role];

	return new Promise((resolve) => {
		connectDb.query(sql, param, (err, result) => {
			if (err) throw err;
            resolve(result[0].role_id);
		});
	});
}

const init = async () => {
    await console.log("\x1b[32m", "\n========================== Welcome to the Employee's Database! ==========================\n");
    startPrompts();
}

init();