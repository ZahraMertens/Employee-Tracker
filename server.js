const { resolveCname } = require('dns');
const inquirer = require('inquirer');
const { connect } = require('./config/connection');
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
                    "View all roles assigned to a department",
                    "View all employees",
                    "View all employees assigned to a role or department",
                    "View employees by manager",
                    "View employees by department",
                    "Add a department",
                    "Add a role",
                    "Add an employee",
                    "Update/Change an employee's role",
                    "Update an employees manager",
                    "Update a roles department",
                    "Delete a department",
                    "Delete a role",
                    "Delete an employee"
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
                case "View all roles assigned to a department":
                    if (selectedOpt === "View all roles assigned to a department"){
                        return viewAssignedRoles();
                    }
                case "View all employees":
                    if (selectedOpt === "View all employees"){
                        return viewEmployees();
                    }
                case "View all employees assigned to a role or department":
                    if (selectedOpt === "View all employees assigned to a role or department"){
                        return viewAssignedEmployees();
                    }
                case "View employees by manager":
                    if (selectedOpt === "View employees by manager"){
                        return viewEmployeesByManager();
                    }
                case "View employees by department":
                    if (selectedOpt === "View employees by department"){
                        return viewEmployeesByDepartment();
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
                case "Update/Change an employee's role":
                    if (selectedOpt === "Update/Change an employee's role"){
                        return updateRoleEmployee();
                    }
                case "Update a roles department":
                    if (selectedOpt === "Update a roles department"){
                        return updateRolesDepartment();
                    }
                case "Update an employees manager":
                    if (selectedOpt === "Update an employees manager"){
                        return updateManager();
                    }
                case "Delete a department":
                    if (selectedOpt === "Delete a department"){
                        return deleteDepartment();
                    }
                case "Delete a role":
                    if (selectedOpt === "Delete a role"){
                        return deleteRole();
                    }
                case "Delete an employee":
                    if (selectedOpt === "Delete an employee"){
                        return deleteEmployee();
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

function viewRoles (){
    const sql = `SELECT * FROM role`;

    connectDb.query(sql, (err, result) => {
     if (err) {
        console.error(err)
     } else {
        console.table(result)
        startPrompts();
     }
    });
}

const viewAssignedRoles = function () {
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
    const sql = `SELECT * FROM employee`;

    connectDb.query(sql, (err, result) => {
     if (err) {
        console.error(err)
     } else {
        console.table(result)
        startPrompts();
     }
    });
}

const viewAssignedEmployees = function () {
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

async function viewEmployeesByManager () {

    let manager = await inquirer.prompt([
        {
            type: "list",
			name: "name",
			message: "Who's manager's team would you like to see?",
			choices: await getEmployees()
        }
    ])

    const sql = `SELECT * FROM employee WHERE manager_id = ?`
    const params = await getManagerId(manager.name)

    connectDb.query(sql, params, (err, result) => {
        if (err){
            console.error(err)
        } else {
            //console.log(result.length)
            if (result.length == 0){
                console.log("\x1b[31m", `\n ------- ${manager.name} is NOT the manager of anyone! -------\n`)
                startPrompts();
            } else {
                console.log("\x1b[33m", `\n -------${manager.name} is the manager of following employees: -------\n`)
                console.table(result);
                startPrompts();
            }
           
        }
    })
}

async function viewEmployeesByDepartment () {

    let department = await inquirer.prompt([
        {
            type: "list",
			name: "department_name",
			message: "Which department's employee's would you like to view?",
			choices: await getDepartment()
        }
    ])

    const sql = `SELECT 
    role.role_title, 
    role.department_id,
    role.role_salary,
    employee.first_name, 
    employee.last_name, 
    employee.employee_id, 
    employee.manager_id,
    department.department_name
    FROM role
    LEFT JOIN employee
    ON role.role_id = employee.role_id
    LEFT JOIN department
    ON department.id = role.department_id
    WHERE department.department_name = ? AND employee.first_name IS NOT NULL`
    //As the department can be selected without having an employee we need to define employee not to be null to filter the result
    const param = [department.department_name];

    connectDb.query(sql, param, (err, result) => {
        if (err){
            console.error(err)
        } else {
            //console.log(result.length)
            if (result.length == 0){
                console.log("\x1b[31m", `\n ------- There are no employees assigned to the ${department.department_name} department! -------\n`)
                startPrompts();
            } else {
                console.log("\x1b[33m", `\n ------- See all employees from the ${department.department_name} department below: -------\n`)
                console.table(result);
                startPrompts();
            }
        }
    })
}

//------------------ ALL ADD FUNCTIONS TO ADD DEPARTMENT/ROLE/EMPLOYEE ---------//

const addDepartment = function () {
    inquirer.prompt([
        {
            type: "text",
            message: "What is the name of the department?",
            name: "addDepartment"//,
            // validate: function (input) {   //other way: checkExistingDepartment

            //     var done = this.async()

            //     setTimeout(function() {

            //         connectDb.query(`SELECT id FROM department WHERE department_name = '${input}'`, (err, result) => {
            //             if (err){
            //                 console.error(err)
            //             } else {
            //                 //console.log(result)
            //                 //console.log(result.length)
            //                 if (result.length !== 0){ //If the department exists result is a Row Data Obejct and....
            //                     done('Already exists');//...If the department does not exist it is an empty array
            //                     return;
            //                 }
            //             }
            //         })
            //         done(true);
            //     }, 5000);
            //}
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

// // Check if department exists
// async function checkExistingDepartment (input) {

//     const sql = `SELECT id FROM department WHERE department_name = ?`;
//     const param = [input]

//     connectDb.query(sql, param, (err, result) => {
//         if (err) {
//              console.error(err)
//         } else {
//            //console.log(result)
//            if (result.length !== 0){
//                console.log("\x1b[31m", `\n\n -------${param} already exists! Please try again!-------\n`)
//                return startPrompts()
//             }
//         }
        
//     })
//    return true
// }
// async function checkExistingDepartment (input) {

//     const sql = `SELECT id FROM department WHERE department_name = ?`;
//     const param = [input]

//     connectDb.query(sql, param, (err, result) => {
//         if (err) {
//              console.error(err)
//         } else {
//            //console.log(result)
//            if (result.length !== 0){
//                console.log("\x1b[31m", `\n\n -------${param} already exists! Please try again!-------\n`)
//                return startPrompts();
//             } 
//         }
        
//     })
//     return true
// }

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

const updateRoleEmployee = async function () {
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
		},
        {
            type: "list",
			name: "newManager",
			message: "Who is the employees new Manager?",
			choices: await getEmployees()//BONUS: UPDATE MANAGER ID OF EMPLOYEE WHEN CHANGE JOB ROLE
        }
    ]));

    const sql = "UPDATE employee SET role_id = ?, manager_id = ? WHERE CONCAT(first_name, ' ', last_name) = ?";
	const param_array = [await getRoleId(updateEmp.role), await getManagerId(updateEmp.newManager), updateEmp.name]

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

async function updateRolesDepartment () {
    let updateRoleDep = await inquirer.prompt([
        {
            type: "list",
			name: "role",
			message: "Which role would you like to update?",
			choices: await getRolesByName()
        }
    ])

    upadteRoleDep = Object.assign(updateRoleDep, await inquirer.prompt ([
        {
            type: "list",
			name: "newDepartment",
			message: "Which department would you like to assign the role to?",
			choices: await getDepartment()
        }
    ]))

    const sql = "UPDATE role SET department_id = ? WHERE role_title = ?"
    const params = [await getDepartmentId(updateRoleDep.newDepartment), updateRoleDep.role];

    connectDb.query(sql, params, (err, result) => {
        if (err) {
        console.error(err)
        } else {
            console.log("\x1b[33m", `\nSuccess! The role ${updateRoleDep.role} is now assigned to the ${upadteRoleDep.newDepartment} department! \n`)
            startPrompts();
        }
    })

}

async function updateManager () {
    let newManager = await inquirer.prompt([
        {
            type: "list",
			name: "employee_name",
			message: "Who's manager would you like to update?",
			choices: await getEmployees()
        }
    ])

    newManager = Object.assign(newManager, await inquirer.prompt([
        {
            type: "list",
			name: "manager_name",
			message: "Who is the new Manager of the employee?",
			choices: await getEmployees()
        }
    ]))

    const sql = `UPDATE employee SET manager_id = ? WHERE CONCAT(first_name, ' ', last_name) = ?`;
    const params = [await getManagerId(newManager.manager_name), newManager.employee_name]

    connectDb.query(sql, params, (err, result) => {
        if (err){
            console.error(err)
        } else {
            showUpdatedEmployee(newManager.employee_name);
        }
    })
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

function getRolesByName () {
    const sql = "SELECT role_title FROM role;";

    return new Promise((resolve) => {
		connectDb.query(sql, (err, result) => {
			if (err) console.error(err);
			resolve(result.map(role => role.role_title));
		});
	});
}

//Get all existing departments for choices
function getDepartment () {
    const sql = "SELECT department_name FROM department";

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
            try {
                if (err) {
                    throw err
                } else if (result.length == 0) {
                    console.log("There are no roles categorised in the department")
                    return startPrompts();
                } else if (result.length !== 0){
                    resolve(result.map(role => role.role_title));
                }
            } catch (error){
                console.error(error)
            }
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

// -------------- ALL DELETE FUNCTIONS-----------------//
async function deleteDepartment () {
    
    let deleteDep = await inquirer.prompt([
        {
            type: "list",
			name: "department_name",
			message: "Which department would you like to remove from the database?",
			choices: await getDepartment()
        }
    ])

    const sql = `DELETE FROM department WHERE department_name = ?`
    const params = [deleteDep.department_name]

    connectDb.query(sql, params, (err, result) => {
        if (err){
            console.error(err)
        } else {
            console.log("\x1b[32m", `\n-------------- The ${deleteDep.department_name} department has been removed from the database! -------------\n`)
            startPrompts();
           
        }
    })
}

async function deleteRole () {
    
    let deleteRole = await inquirer.prompt([
        {
            type: "list",
			name: "department",
			message: "In which department is the role you would like to delete from the database?",
			choices: await getDepartment()
        }
    ]);

    deleteRole = Object.assign(deleteRole, await inquirer.prompt([
		{
			type: "list",
			name: "role_title",
			message: "Which role would you like to remove from the database?",
			choices: await getRoles(deleteRole.department)//, 
            // validate: function (input) {
            //     let value = this.choices.filter(undefined)
            //     if (input == value){
            //         return startPrompts();
            //     } 
            //     return true
            // }
		}
    ]));

    const sql = `DELETE FROM role WHERE role_title = ?`
    const params = [deleteRole.role_title]

    connectDb.query(sql, params, (err, result) => {
        if (err){
            console.error(err)
        } else {
            console.log("\x1b[32m", `\n-------------- ${deleteRole.role_title} has been removed from the database! -------------\n`)
            startPrompts();
           
        }
    })
}

async function deleteEmployee () {
    
    let deleteEmp = await inquirer.prompt([
        {
            type: "list",
			name: "employee_name",
			message: "Whom would you like to remove from the database?",
			choices: await getEmployees()
        }
    ])

    const sql = `DELETE FROM employee WHERE CONCAT(first_name, ' ', last_name) = ?`
    const params = [deleteEmp.employee_name]

    connectDb.query(sql, params, (err, result) => {
        if (err){
            console.error(err)
        } else {
            console.log("\x1b[32m", `\n-------------- ${deleteEmp.employee_name} has been removed from the database! -------------\n`)
            startPrompts();
           
        }
    })
}

const init = async () => {
    await console.log("\x1b[32m", "\n========================== Welcome to the Employee's Database! ==========================\n");
    startPrompts();
}

init();