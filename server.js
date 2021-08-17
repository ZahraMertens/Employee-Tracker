const express = require('express');
const fs = require('fs');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const { inherits } = require('util');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// const db = mysql.createConnection(
//   {
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'employees_db'
//   },
//   console.log(`Connected to the employees_db database.`)
// );

function startPrompts(){
    console.log("\x1b[32m", "\n========================== Welcome to the Employee's Database! ==========================\n")
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
            console.log("\x1b[33m", `\n------  Awesome! ------\n`);
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

}

const viewRoles = function () {}

const viewEmployees = function () {}

const addDepartment = function () {}

const addRole = function () {}

const addEmployee = function () {}

const updateRole = function () {}

startPrompts();
